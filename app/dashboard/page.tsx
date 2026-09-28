import SearchBar from '@/app/ui/SearchFilterBar'
import AccountActivityDashboard from '@/app/ui/AccountActivityDashboard'

export default function Page() {
  return (
    <div>
      <SearchBar placeholder="Search..." />
      <AccountActivityDashboard />
    </div>
  );
}
