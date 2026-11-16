"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PencilIcon } from "@heroicons/react/20/solid";
import DeleteActivityButton from "@/app/ui/DeleteActivityButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default function ActivityActions({
  id,
  title,
  canEdit = false,
}: {
  id: string;
  title: string;
  canEdit?: boolean;
}) {
  const pathname = usePathname();

  if (!pathname.startsWith("/dashboard") || !canEdit) return null;

  return (
    <div className="flex shrink-0 gap-2">
      <Link
        href={`/dashboard/edit/${id}`}
        aria-label={`Edit ${title}`}
        className={cn(buttonVariants({ variant: "secondary" }), "w-28 gap-2")}
      >
        <PencilIcon className="h-5 w-5" />
        Edit
      </Link>
      <div className="w-28">
        <DeleteActivityButton id={id} title={title} />
      </div>
    </div>
  );
}