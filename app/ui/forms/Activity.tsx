'use client';

import { useState } from 'react';
import { ArrowRightIcon, DocumentArrowUpIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/Button';

type Activity = {
  id: string;
  title: string;
  instructions?: string;
  featuredImage?: string;
  attachment?: string;
};

export default function ActivityForm({ activity }: { activity?: Activity }) {
  const isEditing = Boolean(activity);

  const [featuredImageName, setFeaturedImageName] = useState<string | null>(
    activity?.featuredImage ?? null
  );
  const [attachmentName, setAttachmentName] = useState<string | null>(
    activity?.attachment ?? null
  );

  return (
    <form className="space-y-3 mt-8">
      <div className="flex-1 md:w-1/2 rounded-lg bg-gray-50 mx-auto px-6 py-4">
        <div className="w-full">
          {/* Featured Image uploader */}
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="featuredImage">
              Featured Image
            </label>
            <label
              htmlFor="featuredImage"
              className="flex items-center gap-2 w-full cursor-pointer rounded-md border border-dashed border-gray-300 bg-white py-3 px-5 text-sm text-gray-500 hover:border-gray-400"
            >
              <DocumentArrowUpIcon className="h-5 w-5 text-gray-400" />
              {featuredImageName ? (
                <span className="text-gray-900">{featuredImageName}</span>
              ) : (
                <span>Click to upload a file</span>
              )}
              <input
                id="featuredImage"
                name="featuredImage"
                type="file"
                className="hidden"
                onChange={(e) => setFeaturedImageName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="title">
              Title
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500"
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
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="instructions">
              Instructions
            </label>
            <div className="relative">
              <textarea
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500"
                id="instructions"
                name="instructions"
                rows={4}
                placeholder="Enter activity instructions..."
                defaultValue={activity?.instructions ?? ''}
              />
            </div>
          </div>

          {/* Attachment uploader */}
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="attachment">
              Attachment
            </label>
            <label
              htmlFor="attachment"
              className="flex items-center gap-2 w-full cursor-pointer rounded-md border border-dashed border-gray-300 bg-white py-3 px-5 text-sm text-gray-500 hover:border-gray-400"
            >
              <DocumentArrowUpIcon className="h-5 w-5 text-gray-400" />
              {attachmentName ? (
                <span className="text-gray-900">{attachmentName}</span>
              ) : (
                <span>Click to upload a file</span>
              )}
              <input
                id="attachment"
                name="attachment"
                type="file"
                className="hidden"
                onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
          </div>
        </div>

        <Button className="mt-4 w-full">
          {isEditing ? 'Update Activity' : 'Create Activity'}
          <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        <div className="flex h-8 items-end space-x-1">
          {/* Add form errors here */}
        </div>
      </div>
    </form>
  );
}