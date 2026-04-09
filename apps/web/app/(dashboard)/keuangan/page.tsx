'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';

const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function KeuanganPage() {
  const [revenue, setRevenue] = useState<any>(null);
  const [billingStats, setBillingStats] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/analytics/revenue').then((r) => setRevenue(r.data)).catch(() => {});
    apiClient.get('/billing/stats').then((r) => setBillingStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Keuangan & Akuntansi" description="Ringkasan pendapatan dan arus kas" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: formatRp(revenue?.totalRevenue || 0), color: 'var(--teal)' },
          { label: 'Total Pembayaran', value: formatRp(revenue?.totalPayments || 0), color: 'var(--primary-soft)' },
          { label: 'Transaksi', value: revenue?.paymentCount || 0, color: 'var(--text-1)' },
          { label: 'Piutang (Open)', value: revenue?.openBills || 0, color: 'var(--amber)' },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ '--stat-color': s.color } as any}>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value mt-2" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card-flat p-5">
          <p className="overline mb-4">Billing Hari Ini</p>
          {billingStats && (
            <div className="space-y-3">
              {[
                { label: 'Total Billing', value: billingStats.totalBills },
                { label: 'Lunas', value: billingStats.closedBills },
                { label: 'Belum Bayar', value: billingStats.openBills },
                { label: 'Revenue Hari Ini', value: formatRp(billingStats.totalRevenue) },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-2)' }}>{r.label}</span>
                  <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card-flat p-5">
          <p className="overline mb-4">Modul Keuangan</p>
          <div className="space-y-2">
            {['Jurnal Umum', 'Buku Besar', 'Laporan Laba Rugi', 'Neraca', 'Arus Kas'].map((m) => (
              <div key={m} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                <span className="text-[13px]" style={{ color: 'var(--text-2)' }}>{m}</span>
                <span className="badge badge-default">Phase 4</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
