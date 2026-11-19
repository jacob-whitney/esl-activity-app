import { createClient } from "@/lib/supabase/server";
import { getActivities, getAssignedActivityIds } from "@/lib/activities";
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
  const assignedIds = await getAssignedActivityIds(supabase);

  // Apply the filter
  let visibleActivities = activities;

  if (filter === "mine") {
    visibleActivities = activities.filter((a) => assignedIds.has(a.id));
  } else if (filter !== "all") {
    visibleActivities = activities.filter((a) =>
      a.categories.some((c) => c.id === filter)
    );
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