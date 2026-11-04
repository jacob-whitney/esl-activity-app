'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';

export default function DeleteActivityButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    if (isPending) return;
    setOpen(false);
    setError(null);
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/activities/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data.error ?? 'Failed to delete activity.');
          return;
        }

        // Row is deleted. A storage warning means some files were orphaned,
        // but the activity itself is gone, so log it rather than block the user.
        if (data.warning) console.warn(data.warning);

        setOpen(false);
        router.refresh(); // re-fetch server components so the list updates
      } catch {
        setError('Network error. Please try again.');
      }
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
          onClick={closeModal}
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

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={closeModal} disabled={isPending}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                {isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}