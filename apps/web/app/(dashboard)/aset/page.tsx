'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function AsetPage() {
  return (
    <div>
      <PageHeader title="Manajemen Aset" description="Inventaris alat medis, kendaraan, dan peralatan RS" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Aset', value: '0', color: 'var(--text-1)' },
          { label: 'Kondisi Baik', value: '0', color: 'var(--teal)' },
          { label: 'Perlu Maintenance', value: '0', color: 'var(--amber)' },
          { label: 'Rusak/Dihapuskan', value: '0', color: 'var(--rose)' },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ '--stat-color': s.color } as any}>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value mt-2" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card-flat p-5">
        <p className="overline mb-4">Kategori Aset</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Alat Medis', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
            { label: 'Kendaraan', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' },
            { label: 'Komputer & IT', icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25' },
            { label: 'Meubelair', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
            { label: 'Bangunan', icon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21' },
            { label: 'Lainnya', icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z' },
          ].map((cat) => (
            <div key={cat.label} className="card-flat p-4 flex items-center gap-3 hover:border-[var(--glass-border-hover)] transition cursor-pointer">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--primary-dim)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--primary-soft)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                </svg>
              </div>
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-1)' }}>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
