import { useState, useRef } from 'react';

interface LevelDropZoneProps {
  onFiles: (files: File[]) => Promise<void>;
  disabled?: boolean;
  hasAny?: boolean;
}

/**
 * Drop zone for batch uploading up to 4 images at once.
 */
export function LevelDropZone({ onFiles, disabled, hasAny }: LevelDropZoneProps) {
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async (files: File[]) => {
    if (!files.length || disabled || uploading) return;
    setUploading(true);
    try {
      await onFiles(files.slice(0, 4));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      /^image\/(jpeg|png|webp)$/i.test(f.type)
    );
    void run(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    void run(files);
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const files = items
      .filter((item) => item.kind === 'file' && /^image\/(jpeg|png|webp)$/i.test(item.type))
      .map((item) => item.getAsFile())
      .filter((f): f is File => !!f);
    if (files.length) {
      e.preventDefault();
      void run(files);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled && !uploading) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
      onKeyDown={(e) =>
        e.key === 'Enter' && !disabled && !uploading && inputRef.current?.click()
      }
      className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-3 text-center text-sm transition-colors ${
        drag
          ? 'border-gv-gold bg-gv-gold/10'
          : hasAny
            ? 'border-gv-gold/50 bg-gv-gold/5 hover:border-gv-gold/70'
            : 'border-gv-border bg-gv-bg/50 hover:border-gv-gold/50 hover:bg-gv-gold/5'
      } ${disabled || uploading ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      {uploading ? (
        <span className="text-gv-text-muted">Uploading…</span>
      ) : (
        <span className="text-gv-text-muted">
          {hasAny
            ? 'Drop or paste 4 images to replace • click to add more'
            : 'Drop 4 images here, or click to select, or paste'}
        </span>
      )}
    </div>
  );
}
