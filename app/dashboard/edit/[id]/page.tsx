import { notFound } from 'next/navigation';
import ActivityForm from '@/app/ui/forms/Activity';
import { getActivities } from "@/data/activities";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activities = await getActivities();
  const activity = activities.find((a) => a.id === id);

  if (!activity) {
    notFound();
  }

  return <ActivityForm activity={activity} />;
}