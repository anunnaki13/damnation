'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

type Tab = 'worklist' | 'history' | 'stock';

const STATUS_STYLE: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'default' }> = {
  SUBMITTED: { label: 'Menunggu Telaah', variant: 'warning' },
  VERIFIED: { label: 'Terverifikasi', variant: 'info' },
  DISPENSED: { label: 'Sudah Diserahkan', variant: 'success' },
  PARTIALLY_DISPENSED: { label: 'Parsial', variant: 'danger' },
  CANCELLED: { label: 'Dibatalkan', variant: 'default' },
};

export default function FarmasiPage() {
  const [tab, setTab] = useState<Tab>('worklist');
  const [worklist, setWorklist] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [stockDash, setStockDash] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorklist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/pharmacy/dispensing/worklist');
      setWorklist(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/pharmacy/dispensing/history');
      setHistory(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const fetchStockDashboard = useCallback(async () => {
    try {
      const res = await apiClient.get('/pharmacy/stock/dashboard');
      setStockDash(res.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchWorklist();
    fetchStockDashboard();
    apiClient.get('/pharmacy/stock/predictions?days=7').then((r) => setPredictions(r.data)).catch(() => {});
  }, [fetchWorklist, fetchStockDashboard]);

  useEffect(() => {
    if (tab === 'history') fetchHistory();
    if (tab === 'worklist') fetchWorklist();
  }, [tab, fetchHistory, fetchWorklist]);

  const handleVerify = async (id: number) => {
    try {
      const res = await apiClient.post(`/pharmacy/dispensing/verify/${id}`);
      if (res.data.hasWarnings) {
        const proceed = confirm(`Peringatan:\n${res.data.warnings.join('\n')}\n\nLanjutkan?`);
        if (!proceed) return;
      }
      alert('Resep diverifikasi');
      fetchWorklist();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal verifikasi');
    }
  };

  const handleDispense = async (id: number) => {
    try {
      const res = await apiClient.post(`/pharmacy/dispensing/dispense/${id}`);
      const shortages = res.data.items.filter((i: any) => i.shortage > 0);
      if (shortages.length > 0) {
        alert(`Dispensing parsial:\n${shortages.map((s: any) => `${s.medicine}: kurang ${s.shortage}`).join('\n')}`);
      } else {
        alert('Semua obat berhasil diserahkan');
      }
      fetchWorklist();
      fetchStockDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal dispensing');
    }
  };

  const tabs = [
    { key: 'worklist', label: `Resep Masuk (${worklist.length})` },
    { key: 'history', label: 'Riwayat' },
    { key: 'stock', label: 'Stok' },
  ];

  return (
    <div>
      <PageHeader title="Farmasi / Apotek" description="Kelola resep, dispensing obat, dan stok" />

      {/* Stock Dashboard Cards */}
      {stockDash && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Item Obat', value: stockDash.totalItems, gradient: 'from-indigo-500/20', text: 'text-indigo-400' },
            { label: 'Dengan Stok', value: stockDash.totalWithStock, gradient: 'from-emerald-500/20', text: 'text-emerald-400' },
            { label: 'Stok Rendah', value: stockDash.lowStock, gradient: 'from-amber-500/20', text: 'text-amber-400' },
            { label: 'Expired < 90hr', value: stockDash.expiringSoon, gradient: 'from-red-500/20', text: 'text-red-400' },
          ].map((s) => (
            <div key={s.label} className={`glass-card p-4 relative overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} to-transparent opacity-50`} />
              <div className="relative">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={`text-3xl font-bold ${s.text} mt-1`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Predictive Stock Alert */}
      {predictions && predictions.predictions.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl border" style={{ background: 'var(--amber-dim)', borderColor: 'rgba(252,211,77,0.15)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="dot-live" style={{ background: 'var(--amber)' }} />
              <span className="text-[13px] font-semibold" style={{ color: 'var(--amber)' }}>
                Prediksi Kehabisan Stok — {predictions.summary.urgent} obat dalam 7 hari
                {predictions.summary.critical > 0 && <span style={{ color: 'var(--rose)' }}> ({predictions.summary.critical} KRITIS &lt;3 hari)</span>}
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            {predictions.predictions.slice(0, 8).map((p: any) => (
              <div key={p.medicineId} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="flex items-center gap-2">
                  {p.isCritical && <span className="badge badge-danger">KRITIS</span>}
                  {p.isUrgent && !p.isCritical && <span className="badge badge-warning">SEGERA</span>}
                  <span className="text-[12px]" style={{ color: 'var(--text-1)' }}>{p.namaGenerik}</span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-3)' }}>{p.kode}</span>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-semibold" style={{ color: p.isCritical ? 'var(--rose)' : 'var(--amber)' }}>
                    {p.daysUntilStockout} hari lagi
                  </span>
                  <span className="text-[10px] ml-2" style={{ color: 'var(--text-3)' }}>
                    (stok: {p.currentStock}, pakai: {p.avgDailyUsage}/hr)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-white/[0.06]">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as Tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'worklist' && (
        <div className="space-y-3">
          {loading ? (
            <div className="glass-card p-12 text-center">
              <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-sm mt-3">Memuat...</p>
            </div>
          ) : worklist.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500">Tidak ada resep menunggu</div>
          ) : (
            worklist.map((rx) => {
              const st = STATUS_STYLE[rx.status] || { label: rx.status, variant: 'default' as const };
              return (
                <div key={rx.id} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-indigo-400">{rx.noResep}</span>
                        <StatusBadge status={st.label} variant={st.variant} />
                        {rx.encounter?.penjamin && (
                          <StatusBadge status={rx.encounter.penjamin} variant={rx.encounter.penjamin === 'BPJS' ? 'success' : 'info'} />
                        )}
                      </div>
                      <p className="text-white font-medium mt-1">{rx.patient?.namaLengkap}</p>
                      <p className="text-xs text-slate-500">{rx.patient?.noRm} | Dokter: {rx.prescriber?.namaLengkap}</p>
                      {rx.patient?.alergiObat && (
                        <p className="text-xs text-red-400 mt-1">Alergi: {rx.patient.alergiObat}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {rx.status === 'SUBMITTED' && (
                        <button onClick={() => handleVerify(rx.id)}
                          className="px-3 py-1.5 text-xs glass-btn">Telaah</button>
                      )}
                      {['SUBMITTED', 'VERIFIED'].includes(rx.status) && (
                        <button onClick={() => handleDispense(rx.id)}
                          className="px-3 py-1.5 text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl">
                          Serahkan Obat
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3 space-y-1.5">
                    {rx.items?.map((item: any, idx: number) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                          <span className="text-slate-300">{item.medicine?.namaGenerik}</span>
                          {item.medicine?.golongan && (
                            <StatusBadge status={item.medicine.golongan} variant={
                              item.medicine.golongan === 'NARKOTIKA' || item.medicine.golongan === 'PSIKOTROPIKA' ? 'danger' :
                              item.medicine.golongan === 'KERAS' ? 'warning' : 'default'
                            } />
                          )}
                        </div>
                        <div className="text-right text-slate-400">
                          <span>{item.jumlah} {item.medicine?.satuan}</span>
                          {item.dosis && <span className="ml-3 text-xs">{item.dosis}</span>}
                          {item.aturanPakai && <span className="ml-2 text-xs text-slate-500">({item.aturanPakai})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500">Belum ada riwayat dispensing hari ini</div>
          ) : (
            history.map((rx) => (
              <div key={rx.id} className="glass-card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-sm text-slate-400">{rx.noResep}</span>
                    <p className="text-white text-sm mt-1">{rx.patient?.namaLengkap} ({rx.patient?.noRm})</p>
                  </div>
                  <StatusBadge status={STATUS_STYLE[rx.status]?.label || rx.status}
                    variant={STATUS_STYLE[rx.status]?.variant || 'default'} />
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {rx.items?.map((i: any) => (
                    <span key={i.id} className="mr-3">{i.medicine?.namaGenerik} x{i.jumlah}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'stock' && (
        <div className="glass-card p-6 text-center text-slate-500">
          <p className="text-lg text-white mb-2">Manajemen Stok</p>
          <p className="text-sm">Gunakan halaman <a href="/admin/obat" className="text-indigo-400 hover:underline">Admin &rarr; Obat</a> untuk melihat dan mengelola data obat.</p>
          <p className="text-sm mt-1">Fitur penerimaan barang, stok opname, dan kartu stok tersedia via API.</p>
          <div className="grid grid-cols-2 gap-3 mt-6 max-w-md mx-auto">
            <a href="/admin/obat" className="glass-btn px-4 py-2.5 text-sm text-center rounded-xl block">Master Obat</a>
            <button onClick={() => alert('Fitur stok opname tersedia via API:\nPOST /pharmacy/stock/adjust/:stockId\n\nGunakan Swagger docs untuk detail.')} className="btn btn-ghost">Stok Opname</button>
          </div>
        </div>
      )}
    </div>
  );
}
