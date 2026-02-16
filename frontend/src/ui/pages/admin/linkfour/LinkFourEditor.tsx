import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import {
  useCreateRoundMutation,
  useUploadImageMutation,
} from '@/store/apis/admin.api';
import { useGetGameRoundsQuery } from '@/store/apis/games.api';
import { VITE_API_URL } from '@/consts/consts';
import type { GameEditorProps } from '../gameEditorRegistry';
import { linkFourRoundSchema, type LinkFourRoundForm } from './LinkFourEditor.schema';
import { LevelImageSlot } from './LevelImageSlot';
import { LevelDropZone } from './LevelDropZone';

/**
 * Link Four content editor - creates rounds with levels (4 images + answer).
 * Extra letters are auto-generated on the backend.
 */
export function LinkFourEditor({ gameId }: GameEditorProps) {
  const { data: rounds = [] } = useGetGameRoundsQuery(gameId);
  const [createRound, { isLoading: isSaving, isSuccess, isError, error }] =
    useCreateRoundMutation();
  const [uploadImage] = useUploadImageMutation();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<LinkFourRoundForm>({
    resolver: zodResolver(linkFourRoundSchema),
    defaultValues: {
      roundId: '',
      levels: [{ answer: '', images: ['', '', '', ''] }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'levels',
  });

  const toUrl = (res: { url: string }) => {
    const u = res.url;
    return u.startsWith('http') ? u : `${(VITE_API_URL ?? '').replace(/\/$/, '')}${u}`;
  };

  const handleUploadSingle = async (levelIdx: number, imgIdx: number, file: File) => {
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData).unwrap();
      const url = toUrl(res);
      setValue(`levels.${levelIdx}.images.${imgIdx}` as any, url, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (err) {
      setUploadError('Image upload failed. Please try again.');
      console.error('Upload error:', err);
    }
  };

  const handleUploadBatch = async (levelIdx: number, files: File[]) => {
    setUploadError(null);
    try {
      const results = await Promise.all(
        files.slice(0, 4).map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);
          const res = await uploadImage(formData).unwrap();
          return toUrl(res);
        })
      );
      results.forEach((url, i) => {
        setValue(`levels.${levelIdx}.images.${i}` as any, url, {
          shouldValidate: true,
          shouldDirty: true,
        });
      });
    } catch (err) {
      setUploadError('Batch upload failed. Please try again.');
      console.error('Upload error:', err);
    }
  };

  const onSubmit = async (data: LinkFourRoundForm) => {
    setUploadError(null);
    try {
      await createRound({
        gameId,
        roundId: data.roundId.trim(),
        levels: data.levels.map((l) => ({
          answer: l.answer.trim().toUpperCase(),
          images: l.images as [string, string, string, string],
        })),
      }).unwrap();
      
      // Only reset on successful save
      reset({
        roundId: '',
        levels: [{ answer: '', images: ['', '', '', ''] }],
      });
    } catch (err) {
      // Form state is preserved on error
      console.error('Save error:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/games" className="text-sm text-gv-text-muted hover:text-gv-gold">
          ← Back to Games
        </Link>
        <h1 className="font-heading text-xl font-bold text-gv-gold">
          Link Four - Create Round
        </h1>
      </div>

      {isSuccess && (
        <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3">
          <p className="text-sm text-green-400">Round created successfully!</p>
        </div>
      )}

      {isError && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">
            Failed to save round. {error && 'data' in error ? String(error.data) : 'Please try again.'}
          </p>
        </div>
      )}

      {uploadError && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{uploadError}</p>
        </div>
      )}

      <p className="mb-4 text-sm text-gv-text-muted">
        Drop or select 4 images per level, enter the answer. Extra letters are generated
        automatically.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-xs text-gv-text-muted mb-1">Round ID</label>
          <input
            {...register('roundId')}
            placeholder="e.g. round-6"
            className={`w-full rounded border px-3 py-2 ${
              errors.roundId
                ? 'border-red-400 bg-red-400/10 text-gv-text'
                : 'border-gv-border bg-gv-bg text-gv-text'
            }`}
          />
          {errors.roundId && (
            <p className="mt-1 text-xs text-red-400">{errors.roundId.message}</p>
          )}
        </div>

        <div className="space-y-6 rounded-xl border border-gv-border bg-gv-surface p-6">
          {fields.map((field, levelIdx) => (
            <div
              key={field.id}
              className="space-y-3 rounded border border-gv-border bg-gv-bg p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gv-text">Level {levelIdx + 1}</h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(levelIdx)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs text-gv-text-muted">Answer</label>
                <input
                  {...register(`levels.${levelIdx}.answer`)}
                  placeholder="e.g. WATER"
                  className={`mt-1 w-full rounded border px-3 py-1.5 ${
                    errors.levels?.[levelIdx]?.answer
                      ? 'border-red-400 bg-red-400/10 text-gv-text'
                      : 'border-gv-border bg-gv-bg text-gv-text'
                  }`}
                />
                {errors.levels?.[levelIdx]?.answer && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.levels[levelIdx]?.answer?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gv-text-muted mb-1">4 Images</label>
                <LevelDropZone
                  onFiles={(files) => handleUploadBatch(levelIdx, files)}
                  disabled={isSaving}
                  hasAny={field.images.some((u) => u.trim())}
                />
                <p className="mt-2 text-xs text-gv-text-muted">Or edit individually:</p>
                <div className="mt-2 space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <LevelImageSlot
                      key={i}
                      index={i}
                      value={field.images[i] ?? ''}
                      onChange={(v) =>
                        setValue(`levels.${levelIdx}.images.${i}` as any, v, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      onUpload={(f) => handleUploadSingle(levelIdx, i, f)}
                      disabled={isSaving}
                      error={errors.levels?.[levelIdx]?.images?.[i]?.message}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => append({ answer: '', images: ['', '', '', ''] })}
            className="rounded border border-gv-gold px-3 py-1.5 text-sm text-gv-gold hover:bg-gv-gold/10"
          >
            + Add level to round
          </button>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="rounded-lg bg-gv-gold px-4 py-2 font-medium text-gv-bg disabled:opacity-50 hover:bg-gv-gold/90"
            >
              {isSaving ? 'Creating...' : 'Create Round'}
            </button>
            {isDirty && (
              <span className="text-xs text-gv-text-muted">Unsaved changes</span>
            )}
          </div>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="font-semibold text-gv-text mb-4">
          Existing Rounds ({rounds.length})
        </h2>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {rounds.map((r) => (
            <div
              key={r.roundId}
              className="rounded border border-gv-border bg-gv-surface px-3 py-2 text-sm"
            >
              <span className="font-medium text-gv-gold">{r.roundId}</span>{' '}
              ({r.levels.length} levels)
            </div>
          ))}
        </div>
      </div>

      <Link
        to="/admin/upload"
        className="mt-4 block text-sm text-gv-gold hover:underline"
      >
        Need to upload images first? Use the Assets page
      </Link>
    </div>
  );
}
