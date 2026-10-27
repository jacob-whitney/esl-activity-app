import PageTitle from '@/app/ui/PageTitle';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import Link from "next/link";

export default function ConfirmPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle>
        <ChevronRightIcon className="h-3 w-3 mr-2 inline-block" />
        Account Created Confirmation
      </PageTitle>
      <p className="mb-5">Your new account has been created</p>
      <Link href="/login" className="py-2 px-4 rounded-md cursor-pointer bg-primary text-primary-foreground hover:bg-primary/80">Login</Link>
    </div>
  );
}