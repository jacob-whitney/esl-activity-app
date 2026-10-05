import Link from "next/link";
import Image from "next/image";
import type { Activity } from "@/data/activities";

export default function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Link 
      href={`/activities/${activity.id}`}
      className="w-64 overflow-hidden rounded-xl bg-muted text-muted-foreground"
    >
      <div className="relative h-40 overflow-hidden rounded-lg m-2 grow">
        <Image
          src={activity.imageSrc}
          alt={activity.imageAlt}
          fill
          className="object-cover"
          sizes="256px"
        />
      </div>
      <div className="px-4 pb-4 pt-2">
        <h3 className="text-lg font-semibold text-foreground">
          {activity.title}
        </h3>
        <p className="mt-1 text-sm text-foreground/70">{activity.description}</p>
      </div>
    </Link>
  );
}