import { createClient } from "@/lib/supabase/server";
import { getActivity } from "@/lib/activities";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { DocumentIcon } from "@heroicons/react/24/outline";
import PageTitle from "@/app/ui/PageTitle";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const activity = await getActivity(supabase, id);

  if (!activity) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle>
        <ChevronRightIcon className="h-3 w-3 mr-2 inline-block" />
        {activity.title}
      </PageTitle>
      <div className="max-w-2xl mx-auto p-6">
        <div className="relative h-64 w-full rounded-xl overflow-hidden">
          <Image
            src={`/images/${activity.image_src}`}
            alt={activity.image_alt}
            fill
            className="object-cover"
            sizes="624px"
          />
        </div>
        <h1 className="mt-6 text-3xl font-bold">{activity.title}</h1>

        {activity.categories.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {activity.categories.map((category) => (
              <li
                key={category.id}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                {category.name}
              </li>
            ))}
          </ul>
        )}

        {activity.attachments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Attachments</h2>
            <ul className="flex flex-row flex-wrap space-y-2 space-x-10">
              {activity.attachments.map((file) => (
                <li key={file.id} className="flex flex-row">
                  <DocumentIcon className="h-5 w-5 mr-2.5 text-primary" />
                  <Link
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {file.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-4">{activity.description}</p>
      </div>
    </div>
  );
}