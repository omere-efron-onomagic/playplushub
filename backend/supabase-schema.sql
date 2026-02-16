-- Run this in Supabase SQL Editor before migrating.
-- Creates games and link_four_levels tables.

CREATE TABLE IF NOT EXISTS games (
  game_id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  coin_cost INTEGER NOT NULL DEFAULT 0,
  reward_coins INTEGER NOT NULL DEFAULT 0,
  total_levels INTEGER,
  total_rounds INTEGER,
  levels_per_round INTEGER,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL,
  rating NUMERIC,
  players TEXT,
  is_hot BOOLEAN,
  is_pick BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_games_enabled ON games (enabled);

CREATE TABLE IF NOT EXISTS link_four_levels (
  game_id TEXT NOT NULL,
  round_id TEXT,
  level INTEGER NOT NULL,
  answer TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]',
  extra_letters TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (game_id, level)
);

CREATE INDEX IF NOT EXISTS idx_link_four_levels_game ON link_four_levels (game_id);
CREATE INDEX IF NOT EXISTS idx_link_four_levels_round ON link_four_levels (game_id, round_id);

-- Cinemoji content (puzzles from TheGame.txt, hints from stages.txt)
CREATE TABLE IF NOT EXISTS cinemoji_puzzles (
  puzzle_index INTEGER PRIMARY KEY CHECK (puzzle_index >= 1 AND puzzle_index <= 40),
  category TEXT NOT NULL,
  left_emoji TEXT NOT NULL,
  right_emoji TEXT NOT NULL,
  title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cinemoji_stage_hints (
  mode TEXT NOT NULL CHECK (mode IN ('mode1', 'mode2')),
  stage INTEGER NOT NULL,
  hint_text TEXT NOT NULL,
  PRIMARY KEY (mode, stage)
);

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
