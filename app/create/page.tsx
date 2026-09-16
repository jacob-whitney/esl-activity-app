import Nav from '@/app/ui/nav';
import Creator from '@/app/ui/create-form';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <Nav />
      <Creator />
    </main>
  );
}