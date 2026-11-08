import { createClient } from "@/lib/supabase/server";
import { getActivities } from "@/lib/activities";
import ActivityCard from "@/app/ui/ActivityCard";

export default async function ActivityDashboard({
  filter = "all",
  query = "",
}: {
  filter?: string;
  query?: string;
}) {
  const supabase = await createClient();
  const activities = await getActivities(supabase);

  // getUser validates the session; prefer it over getSession on the server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Activity IDs assigned to this user
  let assignedIds = new Set<string>();
  if (user) {
    const { data, error } = await supabase
      .from("activity_assignments")
      .select("activity_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to load assignments:", error.message);
    } else {
      assignedIds = new Set(data.map((row) => row.activity_id));
    }
  }

  // Apply the filter
  let visibleActivities = activities;

  if (filter === "mine") {
    visibleActivities = activities.filter((a) => assignedIds.has(a.id));
  } else if (filter !== "all") {
    // Anything else is treated as a category id
    const { data, error } = await supabase
      .from("activity_categories")
      .select("activity_id")
      .eq("category_id", filter);

    if (error) {
      console.error("Failed to load category filter:", error.message);
    } else {
      const categoryActivityIds = new Set(data.map((row) => row.activity_id));
      visibleActivities = activities.filter((a) => categoryActivityIds.has(a.id));
    }
  }

  // Apply the search to whatever the filter left
const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery) {
    visibleActivities = visibleActivities.filter(
      (a) =>
        a.title?.toLowerCase().includes(normalizedQuery) ||
        a.description?.toLowerCase().includes(normalizedQuery)
    );
  }

  return (
    <div className="p-0 my-8 md:p-8">
      <div className="flex flex-wrap gap-6 justify-center">
        {visibleActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            canEdit={assignedIds.has(activity.id)}
          />
        ))}
      </div>

      {visibleActivities.length === 0 && (
        <p className="text-foreground/50">
          {query.trim()
            ? "No activities match your search."
            : filter === "all"
              ? "No activities yet."
              : filter === "mine"
                ? "You haven't been assigned any activities yet."
                : "No activities match this filter."}
        </p>
      )}
    </div>
  );
}