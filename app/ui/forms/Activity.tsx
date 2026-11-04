'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, DocumentArrowUpIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { MAX_ATTACHMENT_BYTES } from '@/lib/activities';
import type { FormattedActivity, NewAttachmentInput } from '@/lib/activities';

// Supabase Storage bucket for uploaded images and attachments (public bucket assumed)
const STORAGE_BUCKET = 'activities';

type Category = { id: string; name: string };

type Props = {
  activity?: FormattedActivity;
  categories: Category[];
};

const inputClass =
  'peer block w-full rounded-md border border-ring bg-background py-2.25 pl-5 text-sm outline-2 placeholder:text-foreground/50';
const labelClass = 'mb-3 mt-5 block text-xs font-medium';
const dropzoneClass =
  'flex items-center gap-2 w-full cursor-pointer rounded-md border border-dashed border-ring bg-background py-3 px-5 text-sm hover:border-ring/70';

const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

async function uploadFile(file: File, folder: string): Promise<string> {
  const supabase = createClient();
  const path = `${folder}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
  if (error) throw new Error(`Upload failed for ${file.name}: ${error.message}`);
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export default function ActivityForm({ activity, categories }: Props) {
  const router = useRouter();
  const isEditing = Boolean(activity);

  // activities table fields
  const [title, setTitle] = useState(activity?.title ?? '');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [imageAlt, setImageAlt] = useState(activity?.imageAlt ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // relations
  const [categoryIds, setCategoryIds] = useState<string[]>(activity?.categoryIds ?? []);
  const [newCategories, setNewCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');

  // attachments
  const [existingAttachments, setExistingAttachments] = useState(activity?.attachments ?? []);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const existingBytes = existingAttachments.reduce((sum, a) => sum + a.size_bytes, 0);
  const newBytes = newFiles.reduce((sum, f) => sum + f.size, 0);
  const totalBytes = existingBytes + newBytes;
  const overLimit = totalBytes > MAX_ATTACHMENT_BYTES;

  const featuredImageName = imageFile?.name ?? activity?.imageSrc?.split('/').pop() ?? null;

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const addCategory = () => {
    const name = categoryInput.trim().replace(/\s+/g, ' ');
    if (!name) return;

    const existing = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      // Already exists: just select it instead of creating a duplicate
      setCategoryIds((prev) => (prev.includes(existing.id) ? prev : [...prev, existing.id]));
    } else if (!newCategories.some((n) => n.toLowerCase() === name.toLowerCase())) {
      setNewCategories((prev) => [...prev, name]);
    }
    setCategoryInput('');
  };

  const removeExisting = (id: number) => {
    setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
    setRemovedAttachmentIds((prev) => [...prev, id]);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (overLimit) return;

    setSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      // Upload files to storage first, then send URLs to the API
      let imageSrc: string | undefined;
      if (imageFile) imageSrc = await uploadFile(imageFile, 'images');

      const newAttachments: NewAttachmentInput[] = await Promise.all(
        newFiles.map(async (f) => ({
          name: f.name,
          url: await uploadFile(f, 'attachments'),
          sizeBytes: f.size,
        }))
      );

      const payload = {
        title,
        description,
        imageAlt: imageAlt.trim() || null,
        categoryIds,
        newCategoryNames: newCategories,
        removedAttachmentIds,
        newAttachments,
        ...(imageSrc ? { imageSrc } : {}),
      };

      const res = await fetch(
        isEditing ? `/api/activities/${encodeURIComponent(activity!.id)}` : '/api/activities',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');

      const result = data as FormattedActivity;
      setCategoryIds(result.categoryIds);
      setNewCategories([]);
      setExistingAttachments(result.attachments);
      setRemovedAttachmentIds([]);
      setNewFiles([]);
      setImageFile(null);
      setSaved(true);
      if (isEditing && result.id !== activity!.id) {
        // Title changed, so the slug (id) changed: move to the new edit URL
        router.replace(`/dashboard/edit/${encodeURIComponent(result.id)}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-3 mt-8" onSubmit={handleSubmit}>
      <div className="flex-1 md:w-1/2 rounded-lg bg-muted mx-auto px-6 py-4">
        <div className="w-full">
          {/* Featured image (activities.image_src) */}
          <div className="mt-4">
            <label className={labelClass} htmlFor="featuredImage">
              Featured Image
            </label>
            <label
              htmlFor="featuredImage"
              className={`${dropzoneClass} text-foreground/30`}
            >
              <DocumentArrowUpIcon className="h-5 w-5 text-foreground/30" />
              {featuredImageName ? (
                <span className="text-foreground">{featuredImageName}</span>
              ) : (
                <span>Click to upload an image</span>
              )}
              <input
                id="featuredImage"
                name="featuredImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* Image alt text (activities.image_alt) */}
          <div>
            <label className={labelClass} htmlFor="imageAlt">
              Image Alt Text
            </label>
            <input
              className={inputClass}
              id="imageAlt"
              type="text"
              name="imageAlt"
              placeholder="Describe the image"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
            />
          </div>

          {/* Title (activities.title) */}
          <div>
            <label className={labelClass} htmlFor="title">
              Title
            </label>
            <input
              className={inputClass}
              id="title"
              type="text"
              name="title"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description (activities.description) */}
          <div className="mt-4">
            <label className={labelClass} htmlFor="description">
              Description
            </label>
            <textarea
              className={inputClass}
              id="description"
              name="description"
              rows={4}
              placeholder="Enter activity description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Categories (activity_categories) */}
          <fieldset className="mt-4">
            <legend className={labelClass}>Categories</legend>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-md bg-background px-5 py-3 text-sm">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(c.id)}
                      onChange={() => setCategoryIds((prev) => toggle(prev, c.id))}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}

            {newCategories.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                {newCategories.map((name) => (
                  <li
                    key={name}
                    className="flex items-center gap-2 rounded-md bg-background px-3 py-1"
                  >
                    {name} <span className="text-xs text-foreground/50">(new)</span>
                    <button
                      type="button"
                      aria-label={`Remove new category ${name}`}
                      className="text-xs text-destructive hover:underline"
                      onClick={() => setNewCategories((prev) => prev.filter((n) => n !== name))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-2 flex gap-2">
              <input
                className={inputClass}
                type="text"
                aria-label="New category name"
                placeholder="Add a new category"
                maxLength={60}
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // don't submit the whole form
                    addCategory();
                  }
                }}
              />
              <button
                type="button"
                className="shrink-0 rounded-md border border-ring bg-background px-4 text-sm hover:bg-muted disabled:opacity-50"
                disabled={!categoryInput.trim()}
                onClick={addCategory}
              >
                Add
              </button>
            </div>
          </fieldset>

          {/* Attachments (attachments table) */}
          <div className="mt-4">
            <label className={labelClass} htmlFor="attachments">
              Attachments
            </label>
            <label htmlFor="attachments" className={`${dropzoneClass} text-foreground/50`}>
              <DocumentArrowUpIcon className="h-5 w-5 text-foreground/30" />
              <span>Click to upload files</span>
              <input
                id="attachments"
                name="attachments"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []);
                  setNewFiles((prev) => [...prev, ...picked]);
                  e.target.value = ''; // allow re-picking the same file
                }}
              />
            </label>

            {(existingAttachments.length > 0 || newFiles.length > 0) && (
              <ul className="mt-2 space-y-1 rounded-md bg-background px-5 py-3 text-sm">
                {existingAttachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate hover:underline"
                    >
                      {a.name}
                    </a>
                    <button
                      type="button"
                      className="text-xs text-destructive hover:underline"
                      onClick={() => removeExisting(a.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {newFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      {f.name} <span className="text-xs text-foreground/50">(new)</span>
                    </span>
                    <button
                      type="button"
                      className="text-xs text-destructive hover:underline"
                      onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className={`mt-2 text-xs ${overLimit ? 'text-destructive' : 'text-foreground/50'}`}>
              {formatMB(totalBytes)} MB of {formatMB(MAX_ATTACHMENT_BYTES)} MB used
              {overLimit && ' – remove some files to continue'}
            </p>
          </div>

          <Button type="submit" className="mt-4 w-full" disabled={overLimit || submitting}>
            {submitting
              ? 'Saving...'
              : isEditing
                ? 'Update Activity'
                : 'Create Activity'}
            <ArrowRightIcon className="ml-auto h-5 w-5" />
          </Button>

          <div className="flex min-h-8 items-end space-x-1" aria-live="polite">
            {error && <p className="text-xs text-destructive">{error}</p>}
            {saved && !error && <p className="text-xs text-foreground/70">Activity saved.</p>}
          </div>
        </div>
      </div>
    </form>
  );
}
