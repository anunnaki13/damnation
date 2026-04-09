'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';

const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function AnalitikPage() {
  const [kpi, setKpi] = useState<any>(null);
  const [topDiseases, setTopDiseases] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/analytics/kpi').then((r) => setKpi(r.data)).catch(() => {});
    apiClient.get('/analytics/top-diseases').then((r) => setTopDiseases(r.data)).catch(() => {});
    apiClient.get('/analytics/visit-trend').then((r) => setTrend(r.data)).catch(() => {});
    apiClient.get('/analytics/revenue').then((r) => setRevenue(r.data)).catch(() => {});
  }, []);

  const maxTrend = Math.max(...trend.map((t) => t.count), 1);

  return (
    <div>
      <PageHeader title="Dashboard Analitik" description={kpi?.periode || 'Statistik operasional rumah sakit'} />

      {/* KPI Cards */}
      {kpi && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'BOR', value: `${kpi.bor}%`, sub: 'Bed Occupancy Rate', color: kpi.bor >= 85 ? 'text-red-400' : kpi.bor >= 60 ? 'text-emerald-400' : 'text-amber-400' },
            { label: 'ALOS', value: `${kpi.alos}`, sub: 'Avg Length of Stay', color: 'text-[#7c5cfc]' },
            { label: 'BTO', value: `${kpi.bto}`, sub: 'Bed Turn Over', color: 'text-[#2dd4bf]' },
            { label: 'Total Pasien', value: kpi.totalPatients.toLocaleString(), sub: 'Terdaftar', color: 'text-white' },
            { label: 'Kunjungan', value: kpi.totalEncounters, sub: 'Bulan ini', color: 'text-[#9b85fd]' },
            { label: 'BPJS', value: `${kpi.bpjsPercentage}%`, sub: 'Dari total kunjungan', color: 'text-emerald-400' },
          ].map((k) => (
            <div key={k.label} className="card-flat p-4">
              <p className="text-[10px] text-[#4a5268] uppercase tracking-wider font-semibold">{k.label}</p>
              <p className={`text-[28px] font-black ${k.color} mt-1`}>{k.value}</p>
              <p className="text-[10px] text-[#3a3f4e] mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* Visit Trend — mini bar chart */}
        <div className="col-span-12 md:col-span-7 card-flat p-5">
          <p className="text-[12px] text-[#4a5268] uppercase tracking-wider font-semibold mb-4">Trend Kunjungan 7 Hari</p>
          <div className="flex items-end gap-2 h-40">
            {trend.map((t) => (
              <div key={t.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[11px] text-[#8892a4] font-semibold">{t.count}</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-[#7c5cfc]/30 to-[#7c5cfc]/60 transition-all duration-500"
                  style={{ height: `${(t.count / maxTrend) * 100}%`, minHeight: '4px' }} />
                <span className="text-[10px] text-[#4a5268]">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div className="col-span-12 md:col-span-5 card-flat p-5">
          <p className="text-[12px] text-[#4a5268] uppercase tracking-wider font-semibold mb-4">Pendapatan Bulan Ini</p>
          {revenue && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-[#4a5268]">Total Revenue</p>
                <p className="text-[24px] font-bold text-emerald-400">{formatRp(revenue.totalRevenue)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3">
                  <p className="text-[18px] font-bold text-white">{revenue.paymentCount}</p>
                  <p className="text-[10px] text-[#4a5268]">Transaksi</p>
                </div>
                <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3">
                  <p className="text-[18px] font-bold text-amber-400">{revenue.openBills}</p>
                  <p className="text-[10px] text-[#4a5268]">Belum Bayar</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top 10 Diseases */}
      <div className="card-flat p-5">
        <p className="text-[12px] text-[#4a5268] uppercase tracking-wider font-semibold mb-4">10 Penyakit Terbanyak</p>
        {topDiseases.length === 0 ? (
          <p className="text-[13px] text-[#3a3f4e] py-8 text-center">Belum ada data diagnosis</p>
        ) : (
          <div className="space-y-2">
            {topDiseases.map((d) => {
              const maxCount = topDiseases[0]?.count || 1;
              return (
                <div key={d.icd10Code} className="flex items-center gap-3">
                  <span className="w-6 text-right text-[12px] font-bold text-[#4a5268]">{d.rank}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary font-mono">{d.icd10Code}</span>
                        <span className="text-[12px] text-[#c4cad4]">{d.icd10Display}</span>
                      </div>
                      <span className="text-[12px] font-bold text-white">{d.count}</span>
                    </div>
                    <div className="h-1 bg-[rgba(255,255,255,0.03)] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#7c5cfc] to-[#2dd4bf] rounded-full transition-all duration-700"
                        style={{ width: `${(d.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
