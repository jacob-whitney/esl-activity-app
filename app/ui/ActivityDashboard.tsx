import { createClient } from "@/lib/supabase/server";
import { getActivities } from "@/lib/activities";
import ActivityCard from "@/app/ui/ActivityCard";

export default async function ActivityDashboard() {
  const supabase = await createClient();
  const activities = await getActivities(supabase);

  // Get the current user (getUser validates the session; prefer it over getSession on the server)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the activity IDs assigned to this user
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

  return (
    <div className="p-0 my-8 md:p-8">
      <div className="flex flex-wrap gap-6 justify-center">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            canEdit={assignedIds.has(activity.id)}
          />
        ))}
      </div>

      {activities.length === 0 && (
        <p className="text-foreground/50">No activities yet.</p>
      )}
    </div>
  );
}