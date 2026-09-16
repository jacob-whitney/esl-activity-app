import Nav from '@/app/ui/nav';
import Signup from '@/app/ui/signup-form'

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <Nav />
      <Signup />
      
    </main>
  );
}