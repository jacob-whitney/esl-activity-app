import SearchFilterBar from '@/app/ui/SearchFilterBar'
import AccountActivityDashboard from '@/app/ui/AccountActivityDashboard'

export default function Page() {
  return (
    <div>
      <SearchFilterBar placeholder="Search..." />
      <AccountActivityDashboard />
    </div>
  );
}
