import About from '@/app/ui/About';
import PageTitle from '@/app/ui/PageTitle';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle>
        <ChevronRightIcon className="h-3 w-3 mr-2 inline-block" />
        About Us
      </PageTitle>
      <About />
    </div>
  );
}