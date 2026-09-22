import Image from "next/image";
import type { Activity } from "@/data/activities";

export default function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="w-64 overflow-hidden rounded-xl bg-blue-50">
      <div className="relative h-40 w-full overflow-hidden rounded-lg m-2">
        <Image
          src={activity.imageSrc}
          alt={activity.imageAlt}
          fill
          className="object-cover"
          sizes="256px"
        />
      </div>
      <div className="px-4 pb-4 pt-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {activity.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
      </div>
    </div>
  );
}