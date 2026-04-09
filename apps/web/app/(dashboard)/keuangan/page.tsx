'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';

const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function KeuanganPage() {
  const [finance, setFinance] = useState<any>(null);
  const [billingStats, setBillingStats] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/finance/summary').then((r) => setFinance(r.data)).catch(() => {});
    apiClient.get('/billing/stats').then((r) => setBillingStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Keuangan & Akuntansi" description={finance ? `Periode: ${finance.periode}` : 'Ringkasan pendapatan dan arus kas'} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: formatRp(finance?.totalRevenue || 0), color: 'var(--teal)' },
          { label: 'Total Pembayaran', value: formatRp(finance?.totalPayments || 0), color: 'var(--primary-soft)' },
          { label: 'Transaksi', value: finance?.paymentCount || 0, color: 'var(--text-1)' },
          { label: 'Piutang (Open)', value: finance?.openBills || 0, color: 'var(--amber)' },
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
          {billingStats ? (
            <div className="space-y-3">
              {[
                { label: 'Total Billing', value: billingStats.totalBills },
                { label: 'Lunas', value: billingStats.closedBills },
                { label: 'Belum Bayar', value: billingStats.openBills },
                { label: 'Revenue', value: formatRp(billingStats.totalRevenue) },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-2)' }}>{r.label}</span>
                  <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{r.value}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Memuat...</p>}
        </div>
        <div className="card-flat p-5">
          <p className="overline mb-4">Billing Bulan Ini</p>
          {finance ? (
            <div className="space-y-3">
              {[
                { label: 'Revenue Bulan Ini', value: formatRp(finance.totalRevenue) },
                { label: 'Lunas', value: finance.closedBills },
                { label: 'Belum Bayar', value: finance.openBills },
                { label: 'Total Transaksi', value: finance.paymentCount },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-2)' }}>{r.label}</span>
                  <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{r.value}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Memuat...</p>}
        </div>
      </div>
    </div>
  );
}
