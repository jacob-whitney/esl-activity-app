import PageTitle from '@/app/ui/PageTitle';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import ActivityForm from '@/app/ui/forms/Activity';
import { createClient } from '@/lib/supabase/server';
import { fetchCategories } from '@/lib/options';

export default async function CreateActivityPage() {
  const supabase = await createClient();

  const categories = await fetchCategories(supabase);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle>
        <ChevronRightIcon className="h-3 w-3 mr-2 inline-block" />
        Create Activity
      </PageTitle>
      <ActivityForm categories={categories} />
    </div>
  );
}
