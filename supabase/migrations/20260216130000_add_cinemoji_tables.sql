-- Cinemoji content tables (puzzles from TheGame.txt, hints from stages.txt)

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
