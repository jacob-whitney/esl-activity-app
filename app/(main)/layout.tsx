import PNav from '@/app/ui/PublicNav';

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div>
      <PNav />
      <main className="flex mx-auto min-h-screen flex-col p-6 w-full md:max-w-[1000px]">
        {children}
      </main>
    </div>
  );
}
