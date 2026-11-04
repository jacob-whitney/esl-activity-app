import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import ActivityForm from '@/app/ui/forms/Activity';
import PageTitle from '@/app/ui/PageTitle';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { createClient } from '@/lib/supabase/server';
import { fetchFormattedActivity } from '@/lib/activities';
import { fetchCategories } from '@/lib/options';

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [activity, categories] = await Promise.all([
    fetchFormattedActivity(supabase, id),
    fetchCategories(supabase),
  ]);

  if (!activity) {
    notFound();
  }

  if (user) {
    const { data: assignment } = await supabase
      .from("activity_assignments")
      .select("id")
      .eq("activity_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!assignment) redirect("/dashboard");
  }
  

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle>
        <ChevronRightIcon className="h-3 w-3 mr-2 inline-block" />
        Edit {activity.title}
      </PageTitle>
      <ActivityForm activity={activity} categories={categories} />
    </div>
  );
}
