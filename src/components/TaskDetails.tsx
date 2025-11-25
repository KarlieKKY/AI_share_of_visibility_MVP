import type { HistoryRecord } from "../../types/task";
import {
  getVisibilityColor,
  getVisibilityLabel,
  getFilteredCompetitors,
} from "../../utils/taskHelpers";

interface TaskDetailsProps {
  task: HistoryRecord;
  onShowAnswer: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
  disabled: boolean;
}

export const TaskDetails = ({
  task,
  onShowAnswer,
  onRegenerate,
  regenerating,
  disabled,
}: TaskDetailsProps) => {
  return (
    <div className="bg-white rounded-3xl px-8 py-4 shadow-sm overflow-y-auto relative">
      {/* Regenerate Button */}
      <button
        onClick={onRegenerate}
        disabled={disabled || regenerating}
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
          <p className="text-gray-500">{task.prompts}</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-2 uppercase">
            TARGET
          </h3>
          <span className="inline-block px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-sm">
            {task.targets}
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
              className={`w-4 h-4 rounded-full ${getVisibilityColor(task)}`}
            ></div>
            <span className="text-gray-500 font-medium">
              {getVisibilityLabel(task)}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-2 uppercase">
            RANK POSITION
          </h3>
          <p className="text-gray-500 font-medium">
            {task.rank_position === null || task.rank_position === 0
              ? "Not Ranked"
              : task.rank_position}
          </p>
        </div>
      </div>

      {/* Competitors */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-800 mb-2 uppercase">
          COMPETITORS
        </h3>
        <div className="flex flex-wrap gap-2">
          {getFilteredCompetitors(task).map((competitor, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-sm"
            >
              {competitor}
            </span>
          ))}
        </div>
      </div>

      {/* Answer Text */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-800 mb-2 uppercase">
          ANSWER (CLICK TO VIEW FULL)
        </h3>
        <div
          onClick={onShowAnswer}
          className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <p className="text-gray-500 italic">
            "{task.answer_text.substring(0, 400)}
            {task.answer_text.length > 400 ? "..." : ""}"
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
                {task.citations.length > 0 ? (
                  task.citations.map((citation, index) => (
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
  );
};
