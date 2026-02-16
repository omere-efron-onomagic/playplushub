import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { fileGetQuizmoStages } from '../repositories/quizmoFile.repository.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureSchema() {
  console.log('📋 Ensuring QUIZMO schema exists...');
  
  const { error: stagesError } = await supabase
    .from('quizmo_stages')
    .select('stage_id')
    .limit(1);
  
  if (stagesError && stagesError.code === '42P01') {
    console.log('⚠️  Tables do not exist. Creating schema...');
    
    const schema = `
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
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (createError) {
      console.error('❌ Failed to create schema. Please run the schema manually in Supabase SQL Editor:');
      console.error('   File: backend/supabase-schema.sql (QUIZMO section)');
      console.error('   Error:', createError);
      process.exit(1);
    }
    
    console.log('✅ Schema created successfully');
  } else if (stagesError) {
    console.error('❌ Error checking schema:', stagesError);
    process.exit(1);
  } else {
    console.log('✅ Schema already exists');
  }
}

async function migrateData() {
  console.log('\n📦 Loading QUIZMO content from filesystem...');
  
  const stages = await fileGetQuizmoStages();
  
  if (stages.length === 0) {
    console.log('⚠️  No stages found in QUIZMO/ folder');
    return;
  }
  
  console.log(`Found ${stages.length} stage(s)`);
  
  let totalQuestions = 0;
  
  for (const stage of stages) {
    console.log(`\n🔄 Migrating stage: ${stage.stageId}`);
    console.log(`   Title: ${stage.title}`);
    console.log(`   Questions: ${stage.questions.length}`);
    
    // Upsert stage
    const { error: stageError } = await supabase
      .from('quizmo_stages')
      .upsert({
        stage_id: stage.stageId,
        title: stage.title,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stage_id' });
    
    if (stageError) {
      console.error(`   ❌ Failed to upsert stage: ${stageError.message}`);
      continue;
    }
    
    // Delete existing questions
    const { error: deleteError } = await supabase
      .from('quizmo_questions')
      .delete()
      .eq('stage_id', stage.stageId);
    
    if (deleteError) {
      console.error(`   ❌ Failed to delete old questions: ${deleteError.message}`);
      continue;
    }
    
    // Insert questions
    if (stage.questions.length > 0) {
      const questionRows = stage.questions.map((q) => ({
        stage_id: stage.stageId,
        level_index: q.levelIndex,
        image_url: q.imageUrl,
        question: q.question,
        option_1: q.options[0],
        option_2: q.options[1],
        option_3: q.options[2],
        option_4: q.options[3],
        correct_answer_index: q.correctAnswerIndex,
      }));
      
      const { error: insertError } = await supabase
        .from('quizmo_questions')
        .insert(questionRows);
      
      if (insertError) {
        console.error(`   ❌ Failed to insert questions: ${insertError.message}`);
        continue;
      }
      
      totalQuestions += stage.questions.length;
    }
    
    console.log(`   ✅ Stage migrated successfully`);
  }
  
  console.log(`\n✅ Migration complete!`);
  console.log(`   Stages: ${stages.length}`);
  console.log(`   Questions: ${totalQuestions}`);
}

async function main() {
  console.log('🚀 QUIZMO Supabase Migration\n');
  console.log(`Project: ${supabaseUrl}`);
  console.log(`Driver: ${process.env.CONTENT_STORE_DRIVER || 'json'}\n`);
  
  try {
    await ensureSchema();
    await migrateData();
    console.log('\n✨ Done!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
