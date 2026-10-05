'use client';

import { useState, useTransition } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import { deleteActivity } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';

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
      <Button
        variant="icon"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${title}`}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="w-full max-w-sm rounded-xl bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-modal-title" className="text-lg font-semibold">
              Delete activity?
            </h2>
            <p className="mt-2 text-sm text-foreground/60">
              Are you sure you want to delete <strong>{title}</strong>? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}