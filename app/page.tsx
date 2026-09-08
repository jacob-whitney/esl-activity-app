import Nav from '@/app/ui/nav';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import Image from 'next/image';
import { inter } from '@/app/ui/fonts'

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <Nav />

      <p>Home Page</p>

    </main>
  );
}
