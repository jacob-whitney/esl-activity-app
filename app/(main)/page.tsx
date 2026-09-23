import SearchBar from '@/app/ui/SearchFilterBar'
import ActivityDashboard from '@/app/ui/ActivityDashboard'

export default function Page() {
  return (
    <div>
      <SearchBar placeholder="Search..." />
      <ActivityDashboard />
    </div>
  );
}
