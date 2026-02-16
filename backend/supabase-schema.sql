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
