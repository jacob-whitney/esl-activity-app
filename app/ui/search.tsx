'use client';

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

type FilterOption = {
  label: string;
  value: string;
};

const DEFAULT_FILTERS: FilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Vocab', value: 'vocab' },
  { label: 'Conversation', value: 'conversation' },
  { label: 'Uncategorized', value: 'uncategorized' },
];

export default function Search({
  placeholder,
  filterOptions = DEFAULT_FILTERS,
  onSearch,
  onFilterChange,
}: {
  placeholder: string;
  filterOptions?: FilterOption[];
  onSearch?: (term: string) => void;
  onFilterChange?: (value: string) => void;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(option: FilterOption) {
    setSelectedFilter(option);
    setIsFilterOpen(false);
    onFilterChange?.(option.value);
  }

  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:w-3/4 md:items-center md:justify-center md:gap-4">
      {/* Search Bar */}
      <div className="relative flex flex-1 md:max-w-[300px]">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <input
          id="search"
          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
          placeholder={placeholder}
          onChange={(e) => onSearch?.(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>

      {/* Filter Dropdown */}
      <div className="relative" ref={filterRef}>
        <button
          type="button"
          onClick={() => setIsFilterOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isFilterOpen}
          className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-4 py-[9px] text-sm text-gray-700 hover:bg-gray-50 md:w-auto md:min-w-[140px]"
        >
          <span>{selectedFilter.label}</span>
          <ChevronDownIcon
            className={`h-[18px] w-[18px] text-gray-500 transition-transform ${
              isFilterOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isFilterOpen && (
          <ul
            role="listbox"
            className="absolute right-0 z-10 mt-2 w-full min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg md:left-0 md:right-auto"
          >
            {filterOptions.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedFilter.value === option.value}
                  onClick={() => handleSelect(option)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  {option.label}
                  {selectedFilter.value === option.value && (
                    <CheckIcon className="h-4 w-4 text-gray-900" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
