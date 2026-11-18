"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRightIcon, PencilIcon } from "@heroicons/react/20/solid";
import type { Activity } from "@/lib/activities";
import DeleteActivityButton from "@/app/ui/DeleteActivityButton";
import { buttonVariants } from "@/components/ui/button";
import { resolveImageSrc } from "@/lib/storage";
import { cn } from "cn";

const MAX_DESC_LENGTH = 150;

export default function ActivityCard({
  activity,
  canEdit = false,
}: {
  activity: Activity;
  canEdit?: boolean;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  const basePath = isDashboard ? "/dashboard/activities" : "/activities";

  const shortDesc =
    activity.description.length > MAX_DESC_LENGTH
      ? `${activity.description.slice(0, MAX_DESC_LENGTH).trimEnd()}...`
      : activity.description;

  return (
    <div className="flex flex-col justify-between w-64 overflow-hidden rounded-xl bg-muted text-muted-foreground">
      <div>
        <Link
          href={`${basePath}/${activity.id}`}
        >
          <div className="relative h-40 overflow-hidden rounded-lg m-2 grow">
            <Image
              src={resolveImageSrc(activity.image_src)}
              alt={activity.image_alt}
              fill
              className="object-cover"
              sizes="256px"
            />
          </div>
        </Link>
        <div className="px-4 pb-4 pt-2">
          <h3 className="text-lg font-semibold text-foreground">
            {activity.title}
          </h3>
          <p className="mt-1 text-sm text-foreground/70">{shortDesc}</p>
        </div>
      </div>

      {/* Edit/Delete/View Buttons */}
      <div className="space-y-2 px-4 pb-4">
        {isDashboard && canEdit && (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/dashboard/edit/${activity.id}`}
              aria-label={`Edit ${activity.title}`}
              className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2")}
            >
              <PencilIcon className="h-5 w-5" />
              Edit
            </Link>
            <div>
              <DeleteActivityButton id={activity.id} title={activity.title} />
            </div>
          </div>
        )}

        <Link
          href={`${basePath}/${activity.id}`}
          className={cn(buttonVariants(), "w-full")}
        >
          View Activity
          <ArrowRightIcon className="ml-auto h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}