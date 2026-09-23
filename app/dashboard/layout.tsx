import ANav from '@/app/ui/AccountNav';

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <div>
      <ANav />
      <main className="flex mx-auto min-h-screen flex-col p-6 w-full md:max-w-[1000px]">
        {children}
      </main>
    </div>
  );
}
