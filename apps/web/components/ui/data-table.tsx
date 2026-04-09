'use client';

import { useState } from 'react';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
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

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''));
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map((col) => (
                <th key={col.key}
                  className={`px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:text-slate-200 select-none' : ''
                  } ${col.className || ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}>
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-indigo-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-slate-500 text-sm mt-3">Memuat data...</p>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-slate-500">{emptyMessage}</td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr key={row.id ?? idx}
                  className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}>
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-slate-300 ${col.className || ''}`}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
          <span className="text-xs text-slate-500">Halaman {currentPage} dari {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage <= 1}
              className="px-3 py-1 text-xs rounded-lg glass-btn-outline disabled:opacity-30">Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, currentPage - 2);
              const page = start + i;
              if (page > totalPages) return null;
              return (
                <button key={page} onClick={() => onPageChange?.(page)}
                  className={`px-3 py-1 text-xs rounded-lg ${page === currentPage ? 'glass-btn' : 'glass-btn-outline'}`}>
                  {page}
                </button>
              );
            })}
            <button onClick={() => onPageChange?.(currentPage + 1)} disabled={currentPage >= totalPages}
              className="px-3 py-1 text-xs rounded-lg glass-btn-outline disabled:opacity-30">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
