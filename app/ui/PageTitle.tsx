'use client';

import { HomeIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PageTitle({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const homeHref = pathname.startsWith('/dashboard') ? '/dashboard' : '/';

  return (
    <h6 className="font-light tracking-tight mb-6 flex items-center">
      <Link href={homeHref}>
        <HomeIcon className="h-4 w-4 mr-2 inline-block" />
      </Link>
      {children}
    </h6>
  );
}