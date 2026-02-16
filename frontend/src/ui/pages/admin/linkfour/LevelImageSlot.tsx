import { useRef } from 'react';

interface LevelImageSlotProps {
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
  disabled?: boolean;
  error?: string;
  index: number;
}

/**
 * Single image slot with URL input and file upload button.
 */
export function LevelImageSlot({
  value,
  onChange,
  onUpload,
  disabled,
  error,
  index,
}: LevelImageSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1">
      <label className="block text-xs text-gv-text-muted">
        Image {index + 1}
      </label>
      <div className="flex gap-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL or paste"
          className={`flex-1 rounded border px-2 py-1 text-sm ${
            error
              ? 'border-red-400 bg-red-400/10 text-gv-text'
              : 'border-gv-border bg-gv-bg text-gv-text'
          }`}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 rounded border border-gv-gold px-2 py-1 text-xs text-gv-gold hover:bg-gv-gold/10"
          disabled={disabled}
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
            e.target.value = '';
          }}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
