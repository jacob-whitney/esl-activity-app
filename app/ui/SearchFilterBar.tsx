'use client';

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
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

const items = [
  { label: 'All', value: 'all' },
  { label: 'Vocab', value: 'vocab' },
  { label: 'Conversation', value: 'conversation' },
  { label: 'Uncategorized', value: 'uncategorized' },
];

export default function SearchFilterBar() {
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
      <Select items={items} defaultValue="all">
        <SelectTrigger className="w-full md:max-w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Category</SelectLabel>
            {items.map((item) => (
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
