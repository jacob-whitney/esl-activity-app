import Link from "next/link";
import Image from "next/image";
import { PencilIcon } from '@heroicons/react/20/solid';
import type { Activity } from "@/data/activities";
import DeleteActivityButton from '@/app/ui/DeleteActivityButton';

export default function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="w-64 overflow-hidden rounded-xl bg-muted text-muted-foreground">
      <Link href={`/dashboard/activities/${activity.id}`} className="block">
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

      <div className="flex justify-end gap-2 px-4 pb-3">
        <Link
          href={`/dashboard/edit/${activity.id}`}
          aria-label={`Edit ${activity.title}`}
          className="flex h-8.5 w-8.5 items-center justify-center rounded-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/80"
        >
          <PencilIcon className="h-4 w-4" />
        </Link>
        <DeleteActivityButton id={activity.id} title={activity.title} />
      </div>
    </div>
  );
}