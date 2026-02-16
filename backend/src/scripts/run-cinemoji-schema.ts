import 'dotenv/config';
import pg from 'pg';

const SUPABASE_URL = (process.env.SUPABASE_URL ?? '').trim();
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD ?? 'Efron_Omer_3364';

const match = SUPABASE_URL.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
const projectRef = match?.[1] ?? 'rwustlsaujrkfgsonrmv';

const connectionString = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;

const SQL = `
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
`;

async function main() {
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    await client.query(SQL);
    console.log('Cinemoji tables created.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
