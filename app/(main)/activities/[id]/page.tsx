import { getActivities } from "@/data/activities";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { DocumentIcon } from '@heroicons/react/24/outline';

interface PageProps {
  params: { id: string };
}

export default async function ActivityPage({ params }: PageProps) {
  const { id } = await params;
  const activities = await getActivities();
  const activity = activities.find((a) => a.id === id);

  if (!activity) notFound();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="relative h-64 w-full rounded-xl overflow-hidden">
        <Image 
          src={activity.imageSrc} 
          alt={activity.imageAlt} 
          fill 
          className="object-cover" 
          sizes="624px"
          />
      </div>
      <h1 className="mt-6 text-3xl font-bold">{activity.title}</h1>

      {activity.attachments && activity.attachments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Attachments</h2>
          <ul className="flex flex-row flex-wrap space-y-2 space-x-10">
            {activity.attachments.map((file) => (
              <li key={file.url} className="flex flex-row">
                <DocumentIcon className="h-5 w-5 mr-[10px] text-blue-700" />
                <Link
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {file.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-gray-700">{activity.description}</p>
    </div>
  );
}

export async function generateStaticParams() {
  const activities = await getActivities();
  return activities.map((activity) => ({ id: activity.id }));
}