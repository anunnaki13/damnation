'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function LogistikPage() {
  return (
    <div>
      <PageHeader title="Logistik & Inventaris" description="Pengadaan, distribusi, dan stok barang non-medis" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Item', value: '0', color: 'var(--text-1)' },
          { label: 'Stok Rendah', value: '0', color: 'var(--amber)' },
          { label: 'Pengadaan Aktif', value: '0', color: 'var(--primary-soft)' },
          { label: 'Distribusi Hari Ini', value: '0', color: 'var(--teal)' },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ '--stat-color': s.color } as any}>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value mt-2" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { title: 'Pengadaan', items: ['Permintaan Barang', 'Order Pembelian', 'Penerimaan Barang', 'Retur ke Supplier'] },
          { title: 'Distribusi', items: ['Permintaan Unit', 'Distribusi ke Unit', 'Retur dari Unit', 'Stok Opname'] },
        ].map((section) => (
          <div key={section.title} className="card-flat p-5">
            <p className="overline mb-4">{section.title}</p>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div key={item} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                  <span className="text-[13px]" style={{ color: 'var(--text-2)' }}>{item}</span>
                  <span className="badge badge-default">Coming Soon</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
