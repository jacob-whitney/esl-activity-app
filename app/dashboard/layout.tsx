// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ANav from '@/app/ui/AccountNav';

export default async function DashboardLayout({
  children,
}: LayoutProps<'/dashboard'>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <ANav />
      <main className="flex mx-auto min-h-screen flex-col p-6 w-full md:max-w-250">
        {children}
      </main>
    </div>
  );
}