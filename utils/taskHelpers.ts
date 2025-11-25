import type { HistoryRecord } from '../types/task';

export const getVisibilityColor = (task: HistoryRecord): string => {
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

export const getVisibilityLabel = (task: HistoryRecord): string => {
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

export const getFilteredCompetitors = (task: HistoryRecord): string[] => {
  const targetNormalized = task.targets.trim().toLowerCase();
  return task.competitors.filter(
    (competitor) => competitor.trim().toLowerCase() !== targetNormalized
  );
};