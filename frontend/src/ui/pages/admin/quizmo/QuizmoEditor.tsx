import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import {
  useGetQuizmoStagesQuery,
  useUpsertQuizmoStageMutation,
  useUpsertQuizmoQuestionsMutation,
} from '@/store/apis/admin.api';
import type { GameEditorProps } from '../gameEditorRegistry';
import { quizmoStageSchema, type QuizmoStageForm } from './QuizmoEditor.schema';

const OPTION_INDEXES = [0, 1, 2, 3] as const;

/**
 * QUIZMO content editor - creates/edits stages and questions.
 */
export function QuizmoEditor(_props: GameEditorProps) {
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const { data: stages = [], isLoading: loadingStages } = useGetQuizmoStagesQuery();
  
  const [
    upsertStage,
    { isLoading: isSavingStage, isSuccess: isStageSuccess, isError: isStageError, error: stageError },
  ] = useUpsertQuizmoStageMutation();
  
  const [
    upsertQuestions,
    { isLoading: isSavingQuestions, isSuccess: isQuestionsSuccess, isError: isQuestionsError, error: questionsError },
  ] = useUpsertQuizmoQuestionsMutation();

  const form = useForm<QuizmoStageForm>({
    resolver: zodResolver(quizmoStageSchema),
    defaultValues: {
      stageId: 'stage-1-new',
      title: '',
      questions: [
        {
          levelIndex: 1,
          imageUrl: '',
          question: '',
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const loadStage = (stageId: string) => {
    const stage = stages.find((s) => s.stageId === stageId);
    if (stage) {
      form.reset({
        stageId: stage.stageId,
        title: stage.title,
        questions: stage.questions,
      });
      setSelectedStageId(stageId);
    }
  };

  const onSubmit = async (data: QuizmoStageForm) => {
    try {
      await upsertStage({ stageId: data.stageId, title: data.title }).unwrap();
      await upsertQuestions({ stageId: data.stageId, questions: data.questions }).unwrap();
      form.reset(data);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const addQuestion = () => {
    const maxLevel = Math.max(...fields.map((f) => f.levelIndex), 0);
    append({
      levelIndex: maxLevel + 1,
      imageUrl: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
    });
  };

  const isSaving = isSavingStage || isSavingQuestions;
  const isSuccess = isStageSuccess && isQuestionsSuccess;
  const isError = isStageError || isQuestionsError;
  const errorMsg = stageError || questionsError;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/games" className="text-sm text-gv-text-muted hover:text-gv-gold">
          ← Back to Games
        </Link>
        <h1 className="font-heading text-xl font-bold text-gv-gold">QUIZMO Content Editor</h1>
      </div>

      {loadingStages && <p className="text-sm text-gv-text-muted">Loading stages...</p>}

      {!loadingStages && stages.length > 0 && (
        <div className="mb-6">
          <label className="mb-2 block text-sm text-gv-text-muted">Load Existing Stage</label>
          <select
            value={selectedStageId}
            onChange={(e) => loadStage(e.target.value)}
            className="w-full max-w-md rounded border border-gv-border bg-gv-bg px-3 py-2 text-gv-text"
          >
            <option value="">-- Select a stage --</option>
            {stages.map((stage) => (
              <option key={stage.stageId} value={stage.stageId}>
                {stage.stageId} - {stage.title} ({stage.questions.length} questions)
              </option>
            ))}
          </select>
        </div>
      )}

      {isSuccess && (
        <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3">
          <p className="text-sm text-green-400">Stage and questions saved successfully!</p>
        </div>
      )}

      {isError && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">
            Failed to save. {errorMsg && 'data' in errorMsg ? String(errorMsg.data) : 'Please try again.'}
          </p>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-gv-border bg-gv-surface p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gv-text">Stage Info</h2>
          
          <div>
            <label className="block text-xs text-gv-text-muted mb-1">Stage ID</label>
            <input
              type="text"
              {...form.register('stageId')}
              className={`w-full rounded border px-3 py-2 ${
                form.formState.errors.stageId
                  ? 'border-red-400 bg-red-400/10 text-gv-text'
                  : 'border-gv-border bg-gv-bg text-gv-text'
              }`}
            />
            {form.formState.errors.stageId && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.stageId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gv-text-muted mb-1">Title</label>
            <input
              type="text"
              {...form.register('title')}
              className={`w-full rounded border px-3 py-2 ${
                form.formState.errors.title
                  ? 'border-red-400 bg-red-400/10 text-gv-text'
                  : 'border-gv-border bg-gv-bg text-gv-text'
              }`}
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.title.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gv-text">Questions ({fields.length})</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="rounded-lg border border-gv-gold bg-gv-gold/10 px-4 py-2 text-sm font-medium text-gv-gold hover:bg-gv-gold/20"
            >
              + Add Question
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-gv-border bg-gv-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gv-text">Question {index + 1}</h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gv-text-muted mb-1">Level Index</label>
                  <input
                    type="number"
                    {...form.register(`questions.${index}.levelIndex`, { valueAsNumber: true })}
                    className="w-full rounded border border-gv-border bg-gv-bg px-3 py-2 text-gv-text"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gv-text-muted mb-1">Correct Answer Index (0-3)</label>
                  <input
                    type="number"
                    {...form.register(`questions.${index}.correctAnswerIndex`, { valueAsNumber: true })}
                    className="w-full rounded border border-gv-border bg-gv-bg px-3 py-2 text-gv-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gv-text-muted mb-1">Image URL</label>
                <input
                  type="text"
                  {...form.register(`questions.${index}.imageUrl`)}
                  className="w-full rounded border border-gv-border bg-gv-bg px-3 py-2 text-gv-text"
                />
              </div>

              <div>
                <label className="block text-xs text-gv-text-muted mb-1">Question Text</label>
                <textarea
                  {...form.register(`questions.${index}.question`)}
                  rows={2}
                  className="w-full rounded border border-gv-border bg-gv-bg px-3 py-2 text-gv-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {OPTION_INDEXES.map((optIndex) => (
                  <div key={optIndex}>
                    <label className="block text-xs text-gv-text-muted mb-1">Option {optIndex + 1}</label>
                    <input
                      type="text"
                      {...form.register(`questions.${index}.options.${optIndex}` as const)}
                      className="w-full rounded border border-gv-border bg-gv-bg px-3 py-2 text-gv-text"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!form.formState.isDirty || isSaving}
            className="rounded-lg bg-gv-gold px-6 py-2 font-semibold text-gv-bg disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Stage & Questions'}
          </button>
          {form.formState.isDirty && !isSaving && (
            <span className="text-sm text-yellow-400">Unsaved changes</span>
          )}
        </div>
      </form>
    </div>
  );
}
