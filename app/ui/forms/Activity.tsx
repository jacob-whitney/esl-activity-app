'use client';

import { useState } from 'react';
import { ArrowRightIcon, DocumentArrowUpIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { MAX_ATTACHMENT_BYTES, type Attachment } from '@/data/activities';
import { DocumentIcon } from '@heroicons/react/24/outline';

type Activity = {
  id: string;
  title: string;
  description?: string;
  imageSrc?: string;
  attachments?: Attachment[];
};

export default function ActivityForm({ activity }: { activity?: Activity }) {
  const isEditing = Boolean(activity);

  const [featuredImageName, setFeaturedImageName] = useState<string | null>(
    activity?.imageSrc?.replace('/', '') ?? null
  );
  const existingAttachments = activity?.attachments ?? [];
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const existingBytes = existingAttachments.reduce((sum, a) => sum + a.sizeBytes, 0);
  const newBytes = newFiles.reduce((sum, f) => sum + f.size, 0);
  const totalBytes = existingBytes + newBytes;
  const overLimit = totalBytes > MAX_ATTACHMENT_BYTES;

  const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

  return (
    <form className="space-y-3 mt-8">
      <div className="flex-1 md:w-1/2 rounded-lg bg-muted mx-auto px-6 py-4">
        <div className="w-full">
          {/* Featured Image uploader */}
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium" htmlFor="featuredImage">
              Featured Image
            </label>
            <label
              htmlFor="featuredImage"
              className="flex items-center gap-2 w-full cursor-pointer rounded-md border border-dashed border-ring bg-background py-3 px-5 text-sm text-foreground/30 hover:border-ring/70"
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
                onChange={(e) => setFeaturedImageName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="mb-3 mt-5 block text-xs font-medium" htmlFor="title">
              Title
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-ring bg-background py-2.25 pl-5 text-sm outline-2 placeholder:text-foreground/50"
                id="title"
                type="text"
                name="title"
                placeholder="Enter title"
                defaultValue={activity?.title ?? ''}
                required
              />
            </div>
          </div>

          {/* Textarea */}
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium" htmlFor="instructions">
              Instructions
            </label>
            <div className="relative">
              <textarea
                className="peer block w-full rounded-md border border-ring bg-background py-2.25 pl-5 text-sm outline-2 placeholder:text-foreground/50"
                id="instructions"
                name="instructions"
                rows={4}
                placeholder="Enter activity instructions..."
                defaultValue={activity?.description ?? ''}
              />
            </div>
          </div>

          {/* Attachments uploader */}
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium" htmlFor="attachments">
              Attachments
            </label>
            <label
              htmlFor="attachments"
              className="flex items-center gap-2 w-full cursor-pointer rounded-md border border-dashed border-ring bg-background py-3 px-5 text-sm text-foreground/50 hover:border-ring/70"
            >
              <DocumentArrowUpIcon className="h-5 w-5 text-foreground/30" />
              <span>Click to upload files</span>
              <input
                id="attachments"
                name="attachments"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
              />
            </label>

            {(existingAttachments.length > 0 || newFiles.length > 0) && (
              <ul className="mt-2 space-y-1 rounded-md bg-background px-5 py-3 text-sm0">
                {existingAttachments.map((a) => (
                  <li key={a.id}>{a.name}</li>
                ))}
                {newFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`}>
                    {f.name} <span className="text-xs text-foreground/50">(new)</span>
                  </li>
                ))}
              </ul>
            )}

            <p className={`mt-2 text-xs ${overLimit ? 'text-destructive' : 'text-foreground/50'}`}>
              {formatMB(totalBytes)} MB of {formatMB(MAX_ATTACHMENT_BYTES)} MB used
              {overLimit && ' – remove some files to continue'}
            </p>
          </div>

          <Button className="mt-4 w-full" disabled={overLimit}>
            {isEditing ? 'Update Activity' : 'Create Activity'}
            <ArrowRightIcon className="ml-auto h-5 w-5 text-foreground/50" />
          </Button>

          <div className="flex h-8 items-end space-x-1">
            {/* Add form errors here */}
          </div>
        </div>
      </div>
    </form>
  );
}