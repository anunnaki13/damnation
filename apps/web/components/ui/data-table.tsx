'use client';

import { useState } from 'react';

interface Column<T> {
  key: string; label: string; sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode; className?: string;
}
interface DataTableProps<T> {
  columns: Column<T>[]; data: T[]; totalPages?: number; currentPage?: number;
  onPageChange?: (page: number) => void; onRowClick?: (row: T) => void;
  isLoading?: boolean; emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns, data, totalPages = 1, currentPage = 1, onPageChange, onRowClick, isLoading, emptyMessage = 'Tidak ada data',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => { const c = String(a[sortKey]??'').localeCompare(String(b[sortKey]??'')); return sortDir === 'asc' ? c : -c; })
    : data;

  return (
    <div className="card-flat overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {columns.map((col) => (
                <th key={col.key}
                  className={`px-5 py-3 text-left text-[11px] font-semibold text-[#4a5268] uppercase tracking-[0.08em] ${col.sortable ? 'cursor-pointer select-none hover:text-[#8892a4]' : ''} ${col.className || ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}>
                  {col.label}
                  {col.sortable && sortKey === col.key && <span className="text-[#7c5cfc] ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columns.length} className="py-20 text-center">
                <div className="w-5 h-5 border-2 border-[#7c5cfc]/20 border-t-[#7c5cfc] rounded-full animate-spin mx-auto" />
                <p className="text-[#4a5268] text-[13px] mt-3">Memuat...</p>
              </td></tr>
            ) : sorted.length === 0 ? (
              <tr><td colSpan={columns.length} className="py-20 text-center text-[#4a5268] text-[13px]">{emptyMessage}</td></tr>
            ) : sorted.map((row, idx) => (
              <tr key={row.id ?? idx}
                className={`border-b border-white/[0.02] transition-colors hover:bg-white/[0.015] ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}>
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-3.5 text-[13px] text-[#c4cad4] ${col.className || ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04]">
          <span className="text-[11px] text-[#4a5268]">Hal {currentPage}/{totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage <= 1}
              className="btn btn-ghost btn-xs disabled:opacity-30">Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(1, currentPage - 2) + i;
              if (p > totalPages) return null;
              return <button key={p} onClick={() => onPageChange?.(p)}
                className={`btn btn-xs ${p === currentPage ? 'btn-primary' : 'btn-ghost'}`}>{p}</button>;
            })}
            <button onClick={() => onPageChange?.(currentPage + 1)} disabled={currentPage >= totalPages}
              className="btn btn-ghost btn-xs disabled:opacity-30">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
