-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/rwustlsaujrkfgsonrmv/sql/new

-- QUIZMO content tables
CREATE TABLE IF NOT EXISTS quizmo_stages (
  stage_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quizmo_questions (
  stage_id TEXT NOT NULL REFERENCES quizmo_stages(stage_id) ON DELETE CASCADE,
  level_index INTEGER NOT NULL CHECK (level_index >= 1),
  image_url TEXT NOT NULL,
  question TEXT NOT NULL,
  option_1 TEXT NOT NULL,
  option_2 TEXT NOT NULL,
  option_3 TEXT NOT NULL,
  option_4 TEXT NOT NULL,
  correct_answer_index INTEGER NOT NULL CHECK (correct_answer_index >= 0 AND correct_answer_index < 4),
  PRIMARY KEY (stage_id, level_index)
);

CREATE INDEX IF NOT EXISTS idx_quizmo_questions_stage ON quizmo_questions (stage_id);
CREATE INDEX IF NOT EXISTS idx_quizmo_questions_level ON quizmo_questions (stage_id, level_index);
