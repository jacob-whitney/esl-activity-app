'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Category = {
  id: string;
  name: string;
};

export default function SearchFilterBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dashboard = pathname.startsWith('/dashboard');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const res = await fetch('/api/categories', { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to load categories');
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
    return () => controller.abort();
  }, []);

  const defaultFilter = dashboard ? 'mine' : 'all';
  const currentFilter = searchParams.get('filter') ?? defaultFilter;
  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === urlQuery) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (trimmed) {
        params.set('q', trimmed);
      } else {
        params.delete('q');
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, urlQuery, searchParams, pathname, router]);

  function handleFilterChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === defaultFilter) {
      params.delete('filter');
    } else {
      params.set('filter', value);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const items = [
    { label: 'All', value: 'all' },
    ...(dashboard ? [{ label: 'My Activities', value: 'mine' }] : []),
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-center md:gap-4">
      {/* Search Bar */}
      <InputGroup className="md:max-w-xs">
        <InputGroupInput
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      {/* Filter Dropdown */}
      <Select items={items} value={currentFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-full md:max-w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All</SelectItem>
            {dashboard && <SelectItem value="mine">My Activities</SelectItem>}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Category</SelectLabel>
            {loading && (
              <SelectItem value="__loading" disabled>
                Loading...
              </SelectItem>
            )}
            {error && (
              <SelectItem value="__error" disabled>
                Couldn&apos;t load categories
              </SelectItem>
            )}
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}