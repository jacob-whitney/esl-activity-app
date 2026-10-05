import PageTitle from '@/app/ui/AccountPageTitle';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import ActivityForm from '@/app/ui/forms/Activity';

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle>
        <ChevronRightIcon className="h-3 w-3 mr-2 inline-block" />
        Create Activity
      </PageTitle>
      <ActivityForm />
    </div>
  );
}