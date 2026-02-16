import { useState } from 'react';
import { useUploadImageMutation } from '@/store/apis/admin.api';
import { VITE_API_URL } from '@/consts/consts';

export function AdminImageUpload() {
  const [upload, { isSuccess, data, error, reset }] = useUploadImageMutation();
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      await upload(formData).unwrap();
      setFile(null);
    } catch {
      // error handled below
    }
  };

  const resolvedUrl = data?.url
    ? data.url.startsWith('http')
      ? data.url
      : `${(VITE_API_URL ?? '').replace(/\/$/, '')}${data.url}`
    : null;

  return (
    <div className="p-6">
      <h1 className="font-heading text-xl font-bold text-gv-gold mb-6">
        Upload Image
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-gv-border bg-gv-surface p-6"
      >
        <div>
          <label className="block text-xs text-gv-text-muted mb-1">
            Image (JPEG, PNG, WebP, max 5MB)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gv-text-muted file:mr-4 file:rounded file:border-0 file:bg-gv-gold/20 file:px-4 file:py-2 file:text-gv-gold"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400">
            Upload failed. Check file type and size.
          </p>
        )}
        {isSuccess && resolvedUrl && (
          <div className="rounded-lg bg-gv-bg p-3">
            <p className="text-xs text-gv-text-muted mb-1">URL (copy for levels):</p>
            <code className="block break-all text-sm text-gv-gold">
              {resolvedUrl}
            </code>
          </div>
        )}
        <button
          type="submit"
          disabled={!file}
          className="rounded-lg bg-gv-gold px-4 py-2 font-medium text-gv-bg disabled:opacity-50"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
