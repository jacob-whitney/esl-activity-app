import { notFound } from 'next/navigation';
import ActivityForm from '@/app/ui/forms/Activity';
import { getActivities } from "@/data/activities";
import PageTitle from '@/app/ui/AccountPageTitle';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activities = await getActivities();
  const activity = activities.find((a) => a.id === id);

  if (!activity) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle>
        <ChevronRightIcon className="h-3 w-3 mr-2 inline-block" />
        Edit {activity.title}
      </PageTitle>
      <ActivityForm activity={activity} />
    </div>
  );
}