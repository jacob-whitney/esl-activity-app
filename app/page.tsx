import Nav from '@/app/ui/nav';
import SearchBar from '@/app/ui/search-filter-bar'

export default function Page() {
  return (
    <main className="mx-auto flex max-w-6xl min-h-screen flex-col p-6 gap-y-6 max-w-3/4">
      <Nav />
      <SearchBar placeholder="Search..." />

      <p>Home Page</p>

    </main>
  );
}
