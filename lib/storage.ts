import type { SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKET = "activities";

/**
 * Extracts the object path (e.g. "images/abc-photo.png") from a public URL like
 * https://<project>.supabase.co/storage/v1/object/public/activities/images/abc-photo.png
 * Returns null for URLs that don't belong to the bucket (e.g. old local images).
 */
export function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = url.slice(index + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/** Removes the bucket files behind the given public URLs. Returns an error message or null. */
export async function removeStorageFiles(
  supabase: SupabaseClient,
  urls: Array<string | null | undefined>
): Promise<string | null> {
  const paths = urls
    .map(storagePathFromUrl)
    .filter((p): p is string => p !== null);

  if (paths.length === 0) return null;

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  if (error) return error.message;

  // remove() returns only the files it actually deleted; a short list usually means RLS blocked some
  if ((data?.length ?? 0) < paths.length) {
    return `Only ${data?.length ?? 0} of ${paths.length} files were removed from storage`;
  }
  return null;
}