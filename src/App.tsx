import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

interface HistoryRecord {
  id: number;
  created_at: string;
  completed_at: string;
  targets: string;
  prompts: string;
  competitors: string[];
  answer_text: string;
  is_visible: boolean;
  rank_position: number | null;
  citations: string[];
}

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const SUPABASE_EDGE_FUNCTION_URL = import.meta.env
  .VITE_SUPABASE_EDGE_FUNCTION_URL as string;
// const SUPABASE_EDGE_FUNCTION_URL_DB_RESPONDER = import.meta.env
//   .VITE_SUPABASE_DB_RESPONDER_EDGE_FUNCTION_URL as string;

function App() {
  const [tasks, setTasks] = useState<HistoryRecord[]>([]);
  const [selectedTask, setSelectedTask] = useState<HistoryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [promptError, setPromptError] = useState("");
  const [targetError, setTargetError] = useState("");
  const [submittingNew, setSubmittingNew] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (record: HistoryRecord | null = null) => {
    try {
      const { data, error } = await supabase
        .from("history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);

      // Automatically select the first (most recent) task
      if (record) {
        setSelectedTask(record);
      } else if (data && data.length > 0) {
        setSelectedTask(data[0]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityColor = (task: HistoryRecord) => {
    // Not visible = Red
    if (!task.is_visible) {
      return "bg-red-500";
    }

    // Visible but null/0 rank = Grey (mentioned but not ranked)
    if (task.rank_position === null || task.rank_position === 0) {
      return "bg-gray-400";
    }

    // Rank 1-3 = Green (High Visibility)
    if (task.rank_position >= 1 && task.rank_position <= 3) {
      return "bg-green-500";
    }

    // Rank 4+ = Amber (Medium Visibility)
    return "bg-amber-500";
  };

  const getVisibilityLabel = (task: HistoryRecord) => {
    if (!task.is_visible) {
      return "Not Found";
    }

    if (task.rank_position === null || task.rank_position === 0) {
      return "Mentioned (Not Ranked)";
    }

    if (task.rank_position >= 1 && task.rank_position <= 3) {
      return "High Visibility";
    }

    return "Medium Visibility";
  };

  const getFilteredCompetitors = (task: HistoryRecord) => {
    const targetNormalized = task.targets.trim().toLowerCase();
    return task.competitors.filter(
      (competitor) => competitor.trim().toLowerCase() !== targetNormalized
    );
  };

  const handleRegenerate = async () => {
    if (!selectedTask) {
      return;
    }

    try {
      setRegenerating(true);
      const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          id: selectedTask.id,
          query: selectedTask.prompts,
          targetClient: selectedTask.targets,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate analysis");
      }

      const updatedRecord: HistoryRecord = await response.json();
      updatedRecord.id = selectedTask.id; // Ensure ID remains the same

      // Rrefresh the entire list from database
      await fetchTasks(updatedRecord);
    } catch (error) {
      console.error("Error regenerating analysis:", error);
      alert("Failed to regenerate analysis. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleSubmitAnalysis = async () => {
    // Reset errors
    setPromptError("");
    setTargetError("");

    // Validate inputs
    const trimmedPrompt = newPrompt.trim();
    const trimmedTarget = newTarget.trim();

    let hasError = false;

    if (!trimmedPrompt) {
      setPromptError("Please enter a prompt");
      hasError = true;
    }

    if (!trimmedTarget) {
      setTargetError("Please enter a target");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setSubmittingNew(true);

      const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          id: null,
          query: trimmedPrompt,
          targetClient: trimmedTarget,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create analysis");
      }

      const newRecord: HistoryRecord = await response.json();

      // Add new record to the beginning of the list
      setTasks([newRecord, ...tasks]);

      // Select the newly created task
      setSelectedTask(newRecord);

      // Clear input fields
      setNewPrompt("");
      setNewTarget("");

      // Optionally refresh the entire list from database
      await fetchTasks();
    } catch (error) {
      console.error("Error submitting analysis:", error);
      alert("Failed to create analysis. Please try again.");
    } finally {
      setSubmittingNew(false);
    }
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-80 bg-[#d3dade] border-r border-gray-300 overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#3d5266] uppercase">
              ANALYSIS HISTORY
            </h2>
            <div className="w-full h-0.5 bg-[#3d5266] mt-2"></div>
          </div>

          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={`taskRecord${task.id}${Math.random()}`}
                  onClick={() =>
                    !regenerating && !submittingNew && setSelectedTask(task)
                  }
                  className={`p-3 rounded-lg bg-white shadow-md transition-all cursor-pointer ${
                    selectedTask?.id === task.id
                      ? "shadow-lg border-3 border-gray-500"
                      : "hover:shadow-lg border-3 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${getVisibilityColor(
                        task
                      )}`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 line-clamp-2">
                        {task.prompts.substring(0, 30)}
                        {task.prompts.length > 30 ? "..." : ""}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {new Date(task.created_at).toLocaleDateString()}
                        </p>
                        <span className="inline-block px-2 py-0.5 bg-gray-300 text-gray-700 rounded-full text-xs">
                          {task.targets}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gradient-to-br from-[#2c3c4c] to-[#242f3b] min-w-0 overflow-y-auto p-8">
        {selectedTask ? (
          <div className="w-full flex flex-col gap-6">
            {/* Title and Description */}
            <div className="text-center">
              <h1 className="text-4xl font-semibold text-white uppercase mb-2">
                AI Share of Visibility Dashboard
              </h1>
              <p className="text-gray-400 text-base max-w-5xl mx-auto">
                Track and analyze your brand's visibility across AI-powered
                search results. Monitor rankings, citations, and competitive
                positioning.
              </p>
            </div>

            {/* Dashboard Content */}
            <div className="bg-white rounded-3xl px-8 py-4 shadow-sm overflow-y-auto relative">
              {/* Regenerate Button */}
              <button
                onClick={handleRegenerate}
                disabled={regenerating || submittingNew}
                className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-[#3d5266] text-white rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {regenerating ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                    Regenerate
                  </>
                )}
              </button>

              {/* Prompt and Target */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-2 uppercase">
                    PROMPT
                  </h3>
                  <p className="text-gray-500">{selectedTask.prompts}</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-2 uppercase">
                    TARGET
                  </h3>
                  <span className="inline-block px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-sm">
                    {selectedTask.targets}
                  </span>
                </div>
              </div>

              {/* Visibility Status and Rank Position */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-2 uppercase">
                    VISIBILITY STATUS
                  </h3>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${getVisibilityColor(
                        selectedTask
                      )}`}
                    ></div>
                    <span className="text-gray-500 font-medium">
                      {getVisibilityLabel(selectedTask)}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-2 uppercase">
                    RANK POSITION
                  </h3>
                  <p className="text-gray-500 font-medium">
                    {selectedTask.rank_position === null ||
                    selectedTask.rank_position === 0
                      ? "Not Ranked"
                      : selectedTask.rank_position}
                  </p>
                </div>
              </div>

              {/* Competitors */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2 uppercase">
                  COMPETITORS
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getFilteredCompetitors(selectedTask).map(
                    (competitor, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-sm"
                      >
                        {competitor}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Answer Text */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2 uppercase">
                  ANSWER (CLICK TO VIEW FULL)
                </h3>
                <div
                  onClick={() => setShowAnswerModal(true)}
                  className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <p className="text-gray-500 italic">
                    "{selectedTask.answer_text.substring(0, 200)}
                    {selectedTask.answer_text.length > 200 ? "..." : ""}"
                  </p>
                </div>
              </div>

              {/* Citations Table */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2 uppercase">
                  CITATIONS
                </h3>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="max-h-[260px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 w-16">
                            #
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                            Source URL
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedTask.citations.length > 0 ? (
                          selectedTask.citations.map((citation, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                <a
                                  href={citation}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                                >
                                  {citation}
                                </a>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={2}
                              className="px-4 py-3 text-sm text-gray-500 text-center"
                            >
                              No citations available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Create New Analysis Section */}
            <div className="bg-white rounded-3xl px-8 py-4 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 uppercase">
                NEW ANALYSIS
              </h2>

              <div className="space-y-4">
                {/* Prompt and Target Input Row */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Prompt Input - 2 columns */}
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">
                      Prompt
                    </label>
                    <textarea
                      value={newPrompt}
                      onChange={(e) => {
                        setNewPrompt(e.target.value);
                        if (promptError) setPromptError("");
                      }}
                      placeholder="Enter your search query or prompt..."
                      className={`w-full px-4 py-3 bg-gray-50 border ${
                        promptError ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d5266] focus:border-transparent resize-none`}
                      rows={1}
                      disabled={submittingNew || regenerating}
                    />
                    {promptError && (
                      <p className="text-red-500 text-sm mt-1">{promptError}</p>
                    )}
                  </div>

                  {/* Target Input - 1 column */}
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">
                      Target
                    </label>
                    <input
                      type="text"
                      value={newTarget}
                      onChange={(e) => {
                        setNewTarget(e.target.value);
                        if (targetError) setTargetError("");
                      }}
                      placeholder="Enter target company or brand..."
                      className={`w-full px-4 py-3 bg-gray-50 border ${
                        targetError ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d5266] focus:border-transparent`}
                      disabled={submittingNew || regenerating}
                    />
                    {targetError && (
                      <p className="text-red-500 text-sm mt-1">{targetError}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitAnalysis}
                  disabled={submittingNew || regenerating}
                  className="flex items-center gap-2 px-6 py-3 bg-[#2c3e50] text-white rounded-lg hover:bg-[#34495e] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingNew ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Start Analysis
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            Select a task to view details
          </div>
        )}
      </div>

      {/* Answer Modal */}
      {showAnswerModal && selectedTask && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowAnswerModal(false)}
        >
          <div
            className="bg-gray-50 rounded-lg max-w-3xl max-h-[80vh] shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-8 pb-4 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-800">
                Full Answer
              </h3>
              <button
                onClick={() => setShowAnswerModal(false)}
                className="text-slate-600 hover:text-slate-700 text-3xl font-normal leading-none"
              >
                ×
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-8 pb-8">
              <p className="text-gray-700 italic whitespace-pre-wrap">
                "{selectedTask.answer_text}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
