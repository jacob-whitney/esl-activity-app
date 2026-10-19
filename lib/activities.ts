import type { SupabaseClient } from "@supabase/supabase-js";

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

// Shape of the raw nested row Supabase returns
type ActivityRow = Omit<Activity, "categories"> & {
  activity_categories: {
    sort_order: number;
    categories: Category | null;
  }[];
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