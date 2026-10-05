import { HomeIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h6 className="font-light tracking-tight mb-6 flex items-center">
      <Link href="/">
        <HomeIcon className="h-4 w-4 mr-2 inline-block" />
      </Link>
      {children}
    </h6>
  );
}