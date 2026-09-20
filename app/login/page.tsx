import Nav from '@/app/ui/nav';
import Login from '@/app/ui/forms/login'

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <Nav />
      <Login />
      
    </main>
  );
}