import { useState, useRef } from 'react';
import { Link } from 'react-router';
import {
  useGetAdminGamesQuery,
  useCreateRoundMutation,
  useUploadImageMutation,
} from '@/store/apis/admin.api';
import { useGetGameRoundsQuery } from '@/store/apis/games.api';
import { VITE_API_URL } from '@/consts/consts';
import type { CreateRoundLevel } from '@/store/apis/admin.api';

function ImageSlot({
  value,
  onChange,
  onUpload,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onUpload: (file: File) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex gap-1">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="URL or upload"
        className="flex-1 rounded border border-gv-border bg-gv-bg px-2 py-1 text-sm text-gv-text"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="shrink-0 rounded border border-gv-gold px-2 py-1 text-xs text-gv-gold"
      >
        Upload
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
        }}
      />
    </div>
  );
}

export function AdminLinkFourLevels() {
  const { data: games = [] } = useGetAdminGamesQuery();
  const [gameId, setGameId] = useState('1');
  const { data: rounds = [] } = useGetGameRoundsQuery(gameId, { skip: !gameId });
  const [createRound, { isLoading: isSaving, error: saveError }] = useCreateRoundMutation();
  const [uploadImage] = useUploadImageMutation();

  const [roundId, setRoundId] = useState('');
  const [levels, setLevels] = useState<CreateRoundLevel[]>([
    { answer: '', images: ['', '', '', ''] },
  ]);

  const setLevelImage = (levelIdx: number, imgIdx: number, url: string) => {
    setLevels((prev) => {
      const next = [...prev];
      const imgs = [...(next[levelIdx]?.images ?? ['', '', '', ''])] as [string, string, string, string];
      imgs[imgIdx] = url;
      next[levelIdx] = { ...next[levelIdx]!, images: imgs };
      return next;
    });
  };

  const handleUpload = async (levelIdx: number, imgIdx: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData).unwrap();
      const url = res.url.startsWith('http') ? res.url : `${(VITE_API_URL ?? '').replace(/\/$/, '')}${res.url}`;
      setLevelImage(levelIdx, imgIdx, url);
    } catch {
      // Error shown via mutation state
    }
  };

  const addLevel = () => {
    setLevels((prev) => [...prev, { answer: '', images: ['', '', '', ''] }]);
  };

  const handleCreateRound = () => {
    if (!roundId.trim()) return;
    const valid = levels.every(
      (l) => l.answer.trim() && l.images.every((u) => u.trim()),
    );
    if (!valid) return;
    createRound({
      gameId,
      roundId: roundId.trim(),
      levels: levels.map((l) => ({
        answer: l.answer.trim().toUpperCase(),
        images: l.images as [string, string, string, string],
      })),
    });
    setRoundId('');
    setLevels([{ answer: '', images: ['', '', '', ''] }]);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/games" className="text-sm text-gv-text-muted hover:text-gv-gold">
          Back to Games
        </Link>
        <h1 className="font-heading text-xl font-bold text-gv-gold">
          Create Round
        </h1>
      </div>
      <p className="mb-4 text-sm text-gv-text-muted">
        Upload 4 images per level, enter the answer. Extra letters are generated automatically.
      </p>
      <div className="mb-6">
        <label className="block text-xs text-gv-text-muted mb-1">Game</label>
        <select
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          className="rounded-lg border border-gv-border bg-gv-surface px-3 py-2 text-gv-text"
        >
          {games.map((g) => (
            <option key={g.gameId} value={g.gameId}>
              {g.title} ({g.gameId})
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <label className="block text-xs text-gv-text-muted mb-1">Round ID</label>
        <input
          value={roundId}
          onChange={(e) => setRoundId(e.target.value)}
          placeholder="e.g. round-6"
          className="w-full rounded border border-gv-border bg-gv-bg px-3 py-2 text-gv-text"
        />
      </div>
      <div className="space-y-6 rounded-xl border border-gv-border bg-gv-surface p-6">
        {levels.map((level, levelIdx) => (
          <div key={levelIdx} className="space-y-3 rounded border border-gv-border bg-gv-bg p-4">
            <h3 className="font-semibold text-gv-text">Level {levelIdx + 1}</h3>
            <div>
              <label className="block text-xs text-gv-text-muted">Answer</label>
              <input
                value={level.answer}
                onChange={(e) =>
                  setLevels((prev) => {
                    const n = [...prev];
                    n[levelIdx] = { ...n[levelIdx]!, answer: e.target.value };
                    return n;
                  })
                }
                placeholder="e.g. WATER"
                className="mt-1 w-full rounded border border-gv-border bg-gv-bg px-3 py-1.5 text-gv-text"
              />
            </div>
            <div>
              <label className="block text-xs text-gv-text-muted">4 Images</label>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="mt-1">
                  <ImageSlot
                    value={level.images[i] ?? ''}
                    onChange={(v) => setLevelImage(levelIdx, i, v)}
                    onUpload={(f) => handleUpload(levelIdx, i, f)}
                    disabled={isSaving}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addLevel}
          className="rounded border border-gv-gold px-3 py-1.5 text-sm text-gv-gold"
        >
          + Add level to round
        </button>
        {saveError && (
          <p className="text-sm text-red-400">Save failed. Check URLs and answers.</p>
        )}
        <button
          type="button"
          onClick={handleCreateRound}
          disabled={
            isSaving ||
            !roundId.trim() ||
            levels.some(
              (l) => !l.answer.trim() || l.images.some((u) => !u.trim()),
            )
          }
          className="rounded-lg bg-gv-gold px-4 py-2 font-medium text-gv-bg disabled:opacity-50"
        >
          {isSaving ? 'Creating...' : 'Create Round'}
        </button>
      </div>
      <div className="mt-8">
        <h2 className="font-semibold text-gv-text mb-4">Existing Rounds ({rounds.length})</h2>
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
      <Link to="/admin/upload" className="mt-4 block text-sm text-gv-gold hover:underline">
        Bulk upload images first
      </Link>
    </div>
  );
}
