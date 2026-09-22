// app/page.tsx
import { getActivities } from "@/data/activities";
import ActivityCard from "@/app/ui/ActivityCard";

import Image from "next/image";

export default async function ActivityDashboard() {
  const activities = await getActivities();

  return (
    <div className="p-0 my-8 md:p-8">
      <div className="flex flex-wrap gap-6 justify-center">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      {activities.length === 0 && (
        <p className="text-gray-500">No activities yet.</p>
      )}
    </div>
  );
}
