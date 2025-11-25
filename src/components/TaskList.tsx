import type { HistoryRecord } from "../../types/task";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: HistoryRecord[];
  selectedTask: HistoryRecord | null;
  loading: boolean;
  onSelectTask: (task: HistoryRecord) => void;
  disabled: boolean;
}

export const TaskList = ({
  tasks,
  selectedTask,
  loading,
  onSelectTask,
  disabled,
}: TaskListProps) => {
  return (
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
              <TaskCard
                key={`taskRecord${task.id}${Math.random()}`}
                task={task}
                isSelected={selectedTask?.id === task.id}
                onClick={() => onSelectTask(task)}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
