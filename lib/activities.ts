import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

export type Attachment = {
  id: number;
  name: string;
  url: string;
  size_bytes: number;
};

export type Category = {
  id: string;
  name: string;
};

export type Activity = {
  id: string;
  title: string;
  description: string;
  image_src: string;
  image_alt: string;
  attachments: Attachment[];
  categories: Category[];
};

type ActivityRow = Omit<Activity, "categories"> & {
  activity_categories: {
    sort_order: number;
    categories: Category | null;
  }[];
};

export type FormattedActivity = {
  id: string;
  title: string;
  description: string;
  imageSrc: string | null;
  imageAlt: string | null;
  sortOrder: number | null;
  categoryIds: string[];
  assignedUserIds: string[];
  attachments: Attachment[];
};

export type NewAttachmentInput = {
  name: string;
  url: string;
  sizeBytes: number;
};

export type ActivityWriteBody = {
  title?: string;
  description?: string;
  imageSrc?: string | null;
  imageAlt?: string | null;
  categoryIds?: string[];
  newCategoryNames?: string[];
  removedAttachmentIds?: number[];
  newAttachments?: NewAttachmentInput[];
};

export async function getActivity(
  supabase: SupabaseClient,
  id: string
): Promise<Activity | null> {
  const { data, error } = await supabase
    .from("activities")
    .select(
      `
      id,
      title,
      description,
      image_src,
      image_alt,
      attachments ( id, name, url, size_bytes ),
      activity_categories (
        sort_order,
        categories ( id, name )
      )
    `
    )
    .eq("id", id)
    .order("id", { referencedTable: "attachments" })
    .order("sort_order", { referencedTable: "activity_categories" })
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { activity_categories, ...activity } = data as unknown as ActivityRow;

  return {
    ...activity,
    categories: activity_categories
      .map((ac) => ac.categories)
      .filter((c): c is Category => c !== null),
  };
}

export async function getActivities(
  supabase: SupabaseClient
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select(
      `
      id,
      title,
      description,
      image_src,
      image_alt,
      attachments ( id, name, url, size_bytes ),
      activity_categories (
        sort_order,
        categories ( id, name )
      )
    `
    )
    .order("sort_order")
    .order("id", { referencedTable: "attachments" })
    .order("sort_order", { referencedTable: "activity_categories" });

  if (error) throw error;

  return (data as unknown as ActivityRow[]).map(
    ({ activity_categories, ...activity }) => ({
      ...activity,
      categories: activity_categories
        .map((ac) => ac.categories)
        .filter((c): c is Category => c !== null),
    })
  );
}

/** Reads an activity plus its categories, assignments and attachments. */
export async function fetchFormattedActivity(
  supabase: SupabaseClient,
  id: string
): Promise<FormattedActivity | null> {
  const { data: activity, error } = await supabase
    .from("activities")
    .select("id, title, description, image_src, image_alt, sort_order")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!activity) return null;

  const [categories, assignments, attachments] = await Promise.all([
    supabase
      .from("activity_categories")
      .select("category_id, sort_order")
      .eq("activity_id", id)
      .order("sort_order", { ascending: true }),
    supabase.from("activity_assignments").select("user_id").eq("activity_id", id),
    supabase
      .from("attachments")
      .select("id, name, url, size_bytes")
      .eq("activity_id", id)
      .order("id", { ascending: true }),
  ]);

  for (const result of [categories, assignments, attachments]) {
    if (result.error) throw new Error(result.error.message);
  }

  return {
    id: activity.id,
    title: activity.title,
    description: activity.description ?? "",
    imageSrc: activity.image_src ?? null,
    imageAlt: activity.image_alt ?? null,
    sortOrder: activity.sort_order ?? null,
    categoryIds: (categories.data ?? []).map((c) => c.category_id),
    assignedUserIds: (assignments.data ?? []).map((a) => a.user_id),
    attachments: (attachments.data ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      url: a.url,
      size_bytes: Number(a.size_bytes ?? 0),
    })),
  };
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const MAX_CATEGORY_NAME_LENGTH = 60;

/**
 * Turns typed-in category names into category ids. Names that already exist
 * (case-insensitive) reuse the existing row; the rest are created.
 */
async function resolveNewCategories(
  supabase: SupabaseClient,
  names: string[]
): Promise<{ ids: string[]; error: string | null }> {
  const unique = new Map<string, string>();
  for (const raw of names) {
    const name = String(raw).trim().replace(/\s+/g, " ");
    if (!name) continue;
    if (name.length > MAX_CATEGORY_NAME_LENGTH) {
      return { ids: [], error: `Category names must be ${MAX_CATEGORY_NAME_LENGTH} characters or fewer` };
    }
    unique.set(name.toLowerCase(), name);
  }

  const { data: existing, error } = await supabase.from("categories").select("id, name");
  if (error) return { ids: [], error: error.message };

  const idByName = new Map((existing ?? []).map((c) => [String(c.name).toLowerCase(), c.id as string]));
  const takenIds = new Set((existing ?? []).map((c) => c.id as string));
  const ids: string[] = [];

  for (const [key, name] of unique) {
    const found = idByName.get(key);
    if (found) {
      ids.push(found);
      continue;
    }

    let id = slugify(name) || randomUUID();
    if (takenIds.has(id)) id = `${id}-${randomUUID().slice(0, 6)}`;

    const { error: insertError } = await supabase.from("categories").insert({ id, name });
    if (insertError) return { ids: [], error: insertError.message };

    takenIds.add(id);
    ids.push(id);
  }

  return { ids, error: null };
}

/**
 * Syncs categories and attachments for an activity.
 * Returns an error message, or null on success.
 */
export async function syncActivityRelations(
  supabase: SupabaseClient,
  id: string,
  body: ActivityWriteBody
): Promise<string | null> {
  const { removedAttachmentIds, newAttachments, newCategoryNames } = body;
  let categoryIds = body.categoryIds;

  // Create (or reuse) any categories the user typed in, then include them in the selection
  if (Array.isArray(newCategoryNames) && newCategoryNames.length > 0) {
    const resolved = await resolveNewCategories(supabase, newCategoryNames);
    if (resolved.error) return resolved.error;
    categoryIds = [...new Set([...(categoryIds ?? []), ...resolved.ids])];
  }

    // Categories: diff against current links
  if (Array.isArray(categoryIds)) {
    const targetIds = [...new Set(categoryIds)]; // drop any duplicates

    const { data: current, error: fetchErr } = await supabase
      .from("activity_categories")
      .select("category_id")
      .eq("activity_id", id);
    if (fetchErr) return fetchErr.message;

    const currentIds = (current ?? []).map((c) => c.category_id as string);
    const toRemove = currentIds.filter((cid) => !targetIds.includes(cid));

    // Remove deselected categories
    if (toRemove.length > 0) {
      const { data: removed, error: delErr } = await supabase
        .from("activity_categories")
        .delete()
        .eq("activity_id", id)
        .in("category_id", toRemove)
        .select("category_id");
      if (delErr) return delErr.message;
      if ((removed?.length ?? 0) < toRemove.length) {
        return "Could not remove some categories. Check the delete policy on activity_categories.";
      }
    }

    // Inserts new links and refreshes sort_order on existing ones
    if (targetIds.length > 0) {
      const { error: upsertErr } = await supabase.from("activity_categories").upsert(
        targetIds.map((category_id, index) => ({
          activity_id: id,
          category_id,
          sort_order: index,
        })),
        { onConflict: "activity_id,category_id" }
      );
      if (upsertErr) return upsertErr.message;
    }
  }

  // Attachments: remove, then add
  if (Array.isArray(removedAttachmentIds) && removedAttachmentIds.length > 0) {
    const { error } = await supabase
      .from("attachments")
      .delete()
      .eq("activity_id", id)
      .in("id", removedAttachmentIds);
    if (error) return error.message;
  }

  if (Array.isArray(newAttachments) && newAttachments.length > 0) {
    const { error } = await supabase.from("attachments").insert(
      newAttachments.map((a) => ({
        activity_id: id,
        name: a.name,
        url: a.url,
        size_bytes: a.sizeBytes,
      }))
    );
    if (error) return error.message;
  }

  return null;
}