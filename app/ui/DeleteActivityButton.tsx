'use client';

import { useState, useTransition } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import { deleteActivity } from '@/app/lib/actions';

export default function DeleteActivityButton({
  id, 
  title,
}: {
  id: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteActivity(id);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button" 
        onClick={() => setOpen(true)}
        aria-label={`Delete ${title}`}
        className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer bg-black text-white hover:bg-gray-600">
        <TrashIcon className="h-4 w-4"></TrashIcon>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-modal-title" className="text-lg font-semibold text-gray-900">
              Delete activity?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <strong>{title}</strong>? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}