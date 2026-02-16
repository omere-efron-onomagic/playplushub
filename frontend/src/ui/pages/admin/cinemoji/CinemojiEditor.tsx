import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import {
  useUpsertCinemojiPuzzleMutation,
  useUpsertCinemojiHintMutation,
} from '@/store/apis/admin.api';
import type { GameEditorProps } from '../gameEditorRegistry';
import {
  cinemojiPuzzleSchema,
  cinemojiHintSchema,
  type CinemojiPuzzleForm,
  type CinemojiHintForm,
} from './CinemojiEditor.schema';

type EditorMode = 'puzzle' | 'hint';

/**
 * Cinemoji content editor - creates/edits puzzles and stage hints.
 */
export function CinemojiEditor(_props: GameEditorProps) {
  const [mode, setMode] = useState<EditorMode>('puzzle');
  
  const [
    upsertPuzzle,
    { isLoading: isSavingPuzzle, isSuccess: isPuzzleSuccess, isError: isPuzzleError, error: puzzleError },
  ] = useUpsertCinemojiPuzzleMutation();
  
  const [
    upsertHint,
    { isLoading: isSavingHint, isSuccess: isHintSuccess, isError: isHintError, error: hintError },
  ] = useUpsertCinemojiHintMutation();

  const puzzleForm = useForm<CinemojiPuzzleForm>({
    resolver: zodResolver(cinemojiPuzzleSchema),
    defaultValues: {
      index: 1,
      category: 'Movies',
      leftEmoji: '',
      rightEmoji: '',
      title: '',
    },
  });

  const hintForm = useForm<CinemojiHintForm>({
    resolver: zodResolver(cinemojiHintSchema),
    defaultValues: {
      mode: 'mode1',
      stage: 1,
      hintText: '',
    },
  });

  const onSubmitPuzzle = async (data: CinemojiPuzzleForm) => {
    try {
      await upsertPuzzle(data).unwrap();
      puzzleForm.reset({
        index: data.index + 1,
        category: data.category,
        leftEmoji: '',
        rightEmoji: '',
        title: '',
      });
    } catch (err) {
      console.error('Save puzzle error:', err);
    }
  };

  const onSubmitHint = async (data: CinemojiHintForm) => {
    try {
      await upsertHint(data).unwrap();
      hintForm.reset({
        mode: data.mode,
        stage: data.stage + 1,
        hintText: '',
      });
    } catch (err) {
      console.error('Save hint error:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/games" className="text-sm text-gv-text-muted hover:text-gv-gold">
          ← Back to Games
        </Link>
        <h1 className="font-heading text-xl font-bold text-gv-gold">
          Cinemoji Content Editor
        </h1>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('puzzle')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            mode === 'puzzle'
              ? 'bg-gv-gold text-gv-bg'
              : 'border border-gv-border text-gv-text hover:bg-gv-gold/10'
          }`}
        >
          Puzzles
        </button>
        <button
          type="button"
          onClick={() => setMode('hint')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            mode === 'hint'
              ? 'bg-gv-gold text-gv-bg'
              : 'border border-gv-border text-gv-text hover:bg-gv-gold/10'
          }`}
        >
          Stage Hints
        </button>
      </div>

      {mode === 'puzzle' && (
        <div>
          {isPuzzleSuccess && (
            <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3">
              <p className="text-sm text-green-400">Puzzle saved successfully!</p>
            </div>
          )}

          {isPuzzleError && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">
                Failed to save puzzle. {puzzleError && 'data' in puzzleError ? String(puzzleError.data) : 'Please try again.'}
              </p>
            </div>
          )}

          <p className="mb-4 text-sm text-gv-text-muted">
            Create or update Cinemoji puzzles. Each puzzle consists of two emojis and a movie/TV show title.
          </p>

          <form onSubmit={puzzleForm.handleSubmit(onSubmitPuzzle)} className="space-y-4">
            <div className="rounded-xl border border-gv-border bg-gv-surface p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gv-text-muted mb-1">Index</label>
                  <input
                    type="number"
                    {...puzzleForm.register('index', { valueAsNumber: true })}
                    className={`w-full rounded border px-3 py-2 ${
                      puzzleForm.formState.errors.index
                        ? 'border-red-400 bg-red-400/10 text-gv-text'
                        : 'border-gv-border bg-gv-bg text-gv-text'
                    }`}
                  />
                  {puzzleForm.formState.errors.index && (
                    <p className="mt-1 text-xs text-red-400">{puzzleForm.formState.errors.index.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gv-text-muted mb-1">Category</label>
                  <select
                    {...puzzleForm.register('category')}
                    className="w-full rounded border border-gv-border bg-gv-bg px-3 py-2 text-gv-text"
                  >
                    <option value="Movies">Movies</option>
                    <option value="TV SHOWS">TV Shows</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gv-text-muted mb-1">Left Emoji</label>
                  <input
                    {...puzzleForm.register('leftEmoji')}
                    placeholder="e.g. 🦁"
                    className={`w-full rounded border px-3 py-2 text-2xl ${
                      puzzleForm.formState.errors.leftEmoji
                        ? 'border-red-400 bg-red-400/10'
                        : 'border-gv-border bg-gv-bg'
                    }`}
                  />
                  {puzzleForm.formState.errors.leftEmoji && (
                    <p className="mt-1 text-xs text-red-400">{puzzleForm.formState.errors.leftEmoji.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gv-text-muted mb-1">Right Emoji</label>
                  <input
                    {...puzzleForm.register('rightEmoji')}
                    placeholder="e.g. 👑"
                    className={`w-full rounded border px-3 py-2 text-2xl ${
                      puzzleForm.formState.errors.rightEmoji
                        ? 'border-red-400 bg-red-400/10'
                        : 'border-gv-border bg-gv-bg'
                    }`}
                  />
                  {puzzleForm.formState.errors.rightEmoji && (
                    <p className="mt-1 text-xs text-red-400">{puzzleForm.formState.errors.rightEmoji.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gv-text-muted mb-1">Title (Answer)</label>
                <input
                  {...puzzleForm.register('title')}
                  placeholder="e.g. The Lion King"
                  className={`w-full rounded border px-3 py-2 ${
                    puzzleForm.formState.errors.title
                      ? 'border-red-400 bg-red-400/10 text-gv-text'
                      : 'border-gv-border bg-gv-bg text-gv-text'
                  }`}
                />
                {puzzleForm.formState.errors.title && (
                  <p className="mt-1 text-xs text-red-400">{puzzleForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingPuzzle || !puzzleForm.formState.isDirty}
                  className="rounded-lg bg-gv-gold px-4 py-2 font-medium text-gv-bg disabled:opacity-50 hover:bg-gv-gold/90"
                >
                  {isSavingPuzzle ? 'Saving...' : 'Save Puzzle'}
                </button>
                {puzzleForm.formState.isDirty && (
                  <span className="text-xs text-gv-text-muted">Unsaved changes</span>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {mode === 'hint' && (
        <div>
          {isHintSuccess && (
            <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3">
              <p className="text-sm text-green-400">Hint saved successfully!</p>
            </div>
          )}

          {isHintError && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">
                Failed to save hint. {hintError && 'data' in hintError ? String(hintError.data) : 'Please try again.'}
              </p>
            </div>
          )}

          <p className="mb-4 text-sm text-gv-text-muted">
            Create or update stage hints for Mode 1 and Mode 2.
          </p>

          <form onSubmit={hintForm.handleSubmit(onSubmitHint)} className="space-y-4">
            <div className="rounded-xl border border-gv-border bg-gv-surface p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gv-text-muted mb-1">Mode</label>
                  <select
                    {...hintForm.register('mode')}
                    className="w-full rounded border border-gv-border bg-gv-bg px-3 py-2 text-gv-text"
                  >
                    <option value="mode1">Mode 1 (Keyboard Input)</option>
                    <option value="mode2">Mode 2 (Drag & Match)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gv-text-muted mb-1">Stage</label>
                  <input
                    type="number"
                    {...hintForm.register('stage', { valueAsNumber: true })}
                    className={`w-full rounded border px-3 py-2 ${
                      hintForm.formState.errors.stage
                        ? 'border-red-400 bg-red-400/10 text-gv-text'
                        : 'border-gv-border bg-gv-bg text-gv-text'
                    }`}
                  />
                  {hintForm.formState.errors.stage && (
                    <p className="mt-1 text-xs text-red-400">{hintForm.formState.errors.stage.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gv-text-muted mb-1">Hint Text</label>
                <textarea
                  {...hintForm.register('hintText')}
                  placeholder="e.g. Focus on classic movies from the 90s"
                  rows={3}
                  className={`w-full rounded border px-3 py-2 ${
                    hintForm.formState.errors.hintText
                      ? 'border-red-400 bg-red-400/10 text-gv-text'
                      : 'border-gv-border bg-gv-bg text-gv-text'
                  }`}
                />
                {hintForm.formState.errors.hintText && (
                  <p className="mt-1 text-xs text-red-400">{hintForm.formState.errors.hintText.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingHint || !hintForm.formState.isDirty}
                  className="rounded-lg bg-gv-gold px-4 py-2 font-medium text-gv-bg disabled:opacity-50 hover:bg-gv-gold/90"
                >
                  {isSavingHint ? 'Saving...' : 'Save Hint'}
                </button>
                {hintForm.formState.isDirty && (
                  <span className="text-xs text-gv-text-muted">Unsaved changes</span>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-gv-border bg-gv-surface/50 p-4">
        <h3 className="font-semibold text-gv-text mb-2">Quick Tips</h3>
        <ul className="text-sm text-gv-text-muted space-y-1">
          <li>• Puzzles: Use emoji picker or copy/paste emojis for left and right fields</li>
          <li>• Category: Choose "Movies" or "TV Shows" to organize content</li>
          <li>• Index: Sequential puzzle numbers (1, 2, 3...)</li>
          <li>• Hints: Provide helpful clues for each stage without giving away answers</li>
        </ul>
      </div>
    </div>
  );
}
