import SearchFilterBar from '@/app/ui/SearchFilterBar'
import ActivityDashboard from '@/app/ui/ActivityDashboard'

export default function Page() {
  return (
    <div>
      <SearchFilterBar placeholder="Search..." />
      <ActivityDashboard />
    </div>
  );
}
