import SearchFilterBar from '@/app/ui/SearchFilterBar'
import ActivityDashboard from '@/app/ui/ActivityDashboard'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter, q } = await searchParams;
  return (
    <div>
      <SearchFilterBar />
      <ActivityDashboard filter={filter ?? 'all'} query={q ?? ''} />
    </div>
  );
}