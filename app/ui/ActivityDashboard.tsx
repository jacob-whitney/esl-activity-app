import { createClient } from "@/lib/supabase/server";
import { getActivities } from "@/lib/activities";
import ActivityCard from "@/app/ui/ActivityCard";

export default async function ActivityDashboard() {
  const supabase = await createClient();
  const activities = await getActivities(supabase);

  return (
    <div className="p-0 my-8 md:p-8">
      <div className="flex flex-wrap gap-6 justify-center">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      {activities.length === 0 && (
        <p className="text-foreground/50">No activities yet.</p>
      )}
    </div>
  );
}