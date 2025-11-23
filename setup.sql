CREATE TABLE history (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  targets TEXT,
  prompts TEXT,
  answer_text TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  rank_position INTEGER,
  citations TEXT[]
);