import { createClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/categories';
import SearchFilterBar from '@/app/ui/SearchFilterBar';
import ActivityDashboard from '@/app/ui/ActivityDashboard';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter, q } = await searchParams;
  const supabase = await createClient();
  const categories = await getCategories(supabase);
  return (
    <div>
      <SearchFilterBar categories={categories} />
      <ActivityDashboard filter={filter ?? 'mine'} query={q ?? ''} />
    </div>
  );
}