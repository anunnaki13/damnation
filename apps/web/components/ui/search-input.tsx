'use client';

import { useState, useEffect } from 'react';

interface SearchInputProps {
  placeholder?: string; onSearch: (value: string) => void; debounceMs?: number; className?: string;
}

export function SearchInput({ placeholder = 'Cari...', onSearch, debounceMs = 400, className }: SearchInputProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const t = setTimeout(() => onSearch(value), debounceMs);
    return () => clearTimeout(t);
  }, [value, debounceMs, onSearch]);

  return (
    <div className={`relative max-w-sm ${className || ''}`}>
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5268]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder}
        className="input pl-10 !rounded-xl" />
    </div>
  );
}
