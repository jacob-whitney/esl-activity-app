import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// Limit number of bytes in attachment storage a user can upload
export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
// Limit character length of category names
const MAX_CATEGORY_NAME_LENGTH = 60;

// Define types related to activities
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

const ACTIVITY_SELECT = `
  id, title, description, image_src, image_alt,
  attachments ( id, name, url, size_bytes ),
  activity_categories ( sort_order, categories ( id, name ) )
`;

function toActivity(row: ActivityRow): Activity {
  const { activity_categories, ...activity } = row;
  return {
    ...activity,
    categories: activity_categories
      .map((ac) => ac.categories)
      .filter((c): c is Category => c !== null),
  };
}

export async function getActivity(
  supabase: SupabaseClient,
  id: string
): Promise<Activity | null> {
  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("id", id)
    .order("id", { referencedTable: "attachments" })
    .order("sort_order", { referencedTable: "activity_categories" })
    .maybeSingle();

  if (error) throw error;
  return data ? toActivity(data as unknown as ActivityRow) : null;
}

export async function getActivities(
  supabase: SupabaseClient
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .order("sort_order")
    .order("id", { referencedTable: "attachments" })
    .order("sort_order", { referencedTable: "activity_categories" });

  if (error) throw error;
  return (data as unknown as ActivityRow[]).map(toActivity);
}

// Get activity IDs that are assigned to the user from activity_assignments table
export async function getAssignedActivityIds(
  supabase: SupabaseClient
): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from("activity_assignments")
    .select("activity_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to load assignments:", error.message);
    return new Set();
  }
  return new Set(data.map((row) => row.activity_id));
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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