import type { HistoryRecord } from "../../types/task";
import { getVisibilityColor } from "../../utils/taskHelpers";

interface TaskCardProps {
  task: HistoryRecord;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const TaskCard = ({
  task,
  isSelected,
  onClick,
  disabled,
}: TaskCardProps) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`p-3 rounded-lg bg-white shadow-md transition-all cursor-pointer ${
        isSelected
          ? "shadow-lg border-3 border-gray-500"
          : "hover:shadow-lg border-3 border-transparent"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
  );
};
