import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import type { HistoryRecord } from "../types/task";
import { TaskList } from "./components/TaskList";
import { TaskDetails } from "./components/TaskDetails";
import { NewAnalysisForm } from "./components/NewAnalysisForm";
import { AnswerModal } from "./components/AnswerModal";

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const SUPABASE_EDGE_FUNCTION_URL = import.meta.env
  .VITE_SUPABASE_EDGE_FUNCTION_URL as string;

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

      // Refresh the entire list from database
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

  const handlePromptChange = (value: string) => {
    setNewPrompt(value);
    if (promptError) setPromptError("");
  };

  const handleTargetChange = (value: string) => {
    setNewTarget(value);
    if (targetError) setTargetError("");
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <TaskList
        tasks={tasks}
        selectedTask={selectedTask}
        loading={loading}
        onSelectTask={setSelectedTask}
        disabled={regenerating || submittingNew}
      />

      {/* Main Content Area */}
      <div className="flex-1 bg-gradient-to-br from-[#2c3c4c] to-[#242f3b] min-w-0 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
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
              <TaskDetails
                task={selectedTask}
                onShowAnswer={() => setShowAnswerModal(true)}
                onRegenerate={handleRegenerate}
                regenerating={regenerating}
                disabled={submittingNew}
              />

              {/* Create New Analysis Section */}
              <NewAnalysisForm
                prompt={newPrompt}
                target={newTarget}
                promptError={promptError}
                targetError={targetError}
                submitting={submittingNew}
                disabled={regenerating}
                onPromptChange={handlePromptChange}
                onTargetChange={handleTargetChange}
                onSubmit={handleSubmitAnalysis}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              Select a task to view details
            </div>
          )}
        </div>
      </div>

      {/* Answer Modal */}
      {showAnswerModal && selectedTask && (
        <AnswerModal
          answerText={selectedTask.answer_text}
          onClose={() => setShowAnswerModal(false)}
        />
      )}
    </div>
  );
}

export default App;
