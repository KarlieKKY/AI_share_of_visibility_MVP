export interface HistoryRecord {
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