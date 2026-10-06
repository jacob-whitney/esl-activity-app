'use client';

import { usePathname } from 'next/navigation';
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
} from "@/components/ui/select"

const categories = [
  { label: 'Vocab', value: 'vocab' },
  { label: 'Conversation', value: 'conversation' },
  { label: 'Uncategorized', value: 'uncategorized' },
];

export default function SearchFilterBar() {
  const pathname = usePathname();
  const dashboard = pathname.startsWith('/dashboard');

  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-center md:gap-4">
      {/* Search Bar */}
      <InputGroup className="md:max-w-xs">
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      {/* Filter Dropdown */}
      <Select items={categories} defaultValue="All">
        <SelectTrigger className="w-full md:max-w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem key="all" value="All">All</SelectItem>
            {dashboard && (
              <SelectItem key="my-activities" value="My Activities">
                My Activities
              </SelectItem>
            )}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Category</SelectLabel>
            {categories.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
