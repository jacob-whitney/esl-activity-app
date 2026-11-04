import type { SupabaseClient } from "@supabase/supabase-js";

export type CategoryOption = { id: string; name: string };

/** All categories, for the activity form's category checkboxes. */
export async function fetchCategories(supabase: SupabaseClient): Promise<CategoryOption[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}