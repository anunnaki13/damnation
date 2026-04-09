'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

export default function AntreanPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<number | null>(null);
  const [queueData, setQueueData] = useState<any>(null);
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load poli list & summary
  useEffect(() => {
    apiClient.get('/locations', { params: { tipe: 'POLI' } }).then((r) => setLocations(r.data));
    apiClient.get('/queue/summary').then((r) => setSummary(r.data));
  }, []);

  // Auto-refresh setiap 10 detik
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedLoc) fetchQueue(selectedLoc);
      apiClient.get('/queue/summary').then((r) => setSummary(r.data));
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedLoc]);

  const fetchQueue = useCallback(async (locId: number) => {
    setLoading(true);
    setSelectedLoc(locId);
    try {
      const res = await apiClient.get(`/queue/today/${locId}`);
      setQueueData(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const handleCallNext = async () => {
    if (!selectedLoc) return;
    try {
      const res = await apiClient.post(`/queue/call-next/${selectedLoc}`);
      if (res.data.ticket) {
        alert(`Memanggil antrean #${res.data.ticket.nomorAntrean} — ${res.data.ticket.patient?.namaLengkap}`);
      } else {
        alert(res.data.message);
      }
      fetchQueue(selectedLoc);
    } catch (e) { console.error(e); }
  };

  const handleServe = async (ticketId: number) => {
    await apiClient.patch(`/queue/serve/${ticketId}`);
    if (selectedLoc) fetchQueue(selectedLoc);
  };

  const handleSkip = async (ticketId: number) => {
    if (!confirm('Lewati antrean ini?')) return;
    await apiClient.patch(`/queue/skip/${ticketId}`);
    if (selectedLoc) fetchQueue(selectedLoc);
  };

  const STATUS_STYLE: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'default' }> = {
    WAITING: { label: 'Menunggu', variant: 'info' },
    CALLED: { label: 'Dipanggil', variant: 'warning' },
    SERVING: { label: 'Dilayani', variant: 'success' },
    DONE: { label: 'Selesai', variant: 'default' },
    CANCELLED: { label: 'Dibatalkan', variant: 'danger' },
  };

  return (
    <div>
      <PageHeader
        title="Manajemen Antrean"
        description="Monitor dan kelola antrean pasien per poli"
        action={selectedLoc ? (
          <button onClick={handleCallNext} className="btn btn-primary btn-sm px-6 py-2.5 font-medium">
            Panggil Berikutnya
          </button>
        ) : undefined}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {summary.map((s) => (
          <button key={s.location.id} onClick={() => fetchQueue(s.location.id)}
            className={`card-flat p-4 text-left hover:bg-[var(--glass-hover)] transition ${
              selectedLoc === s.location.id ? 'ring-2 ring-[var(--primary)] border-[var(--primary)]' : ''
            }`}>
            <p className="text-sm font-medium text-[var(--text-1)] truncate">{s.location.nama}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-[var(--primary-soft)]">{s.currentNumber ?? '-'}</span>
              <span className="text-xs text-[var(--text-3)]">sedang</span>
            </div>
            <div className="flex gap-3 mt-2 text-xs text-[var(--text-3)]">
              <span>{s.waiting} menunggu</span>
              <span>{s.done} selesai</span>
            </div>
          </button>
        ))}
      </div>

      {/* Queue Detail */}
      {selectedLoc && queueData ? (
        <div>
          {/* Current Number Display */}
          {queueData.summary.currentNumber && (
            <div className="bg-[var(--primary)] text-white rounded-2xl p-8 mb-6 text-center">
              <p className="text-sm opacity-80">Nomor Antrean Saat Ini</p>
              <p className="text-7xl font-bold my-2">{queueData.summary.currentNumber}</p>
              <p className="text-sm opacity-80">
                {queueData.tickets.find((t: any) => t.status === 'CALLED' || t.status === 'SERVING')?.patient?.namaLengkap || ''}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="card-flat p-3 text-center">
              <p className="text-2xl font-bold text-[var(--text-1)]">{queueData.summary.total}</p>
              <p className="text-xs text-[var(--text-3)]">Total</p>
            </div>
            <div className="bg-[var(--primary-dim)] rounded-lg border border-[var(--glass-border)] p-3 text-center">
              <p className="text-2xl font-bold text-[var(--primary-soft)]">{queueData.summary.waiting}</p>
              <p className="text-xs text-[var(--primary-soft)]">Menunggu</p>
            </div>
            <div className="bg-[var(--teal-dim)] rounded-lg border border-[var(--glass-border)] p-3 text-center">
              <p className="text-2xl font-bold text-[var(--teal)]">{queueData.summary.serving}</p>
              <p className="text-xs text-[var(--teal)]">Dilayani</p>
            </div>
            <div className="bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)] p-3 text-center">
              <p className="text-2xl font-bold text-[var(--text-2)]">{queueData.summary.done}</p>
              <p className="text-xs text-[var(--text-3)]">Selesai</p>
            </div>
          </div>

          {/* Ticket List */}
          <div className="card-flat overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[rgba(255,255,255,0.03)] border-b border-[var(--glass-border)]">
                  <th className="px-4 py-3 text-center w-20 text-[var(--text-2)]">No</th>
                  <th className="px-4 py-3 text-left text-[var(--text-2)]">Pasien</th>
                  <th className="px-4 py-3 text-left text-[var(--text-2)]">No. RM</th>
                  <th className="px-4 py-3 text-center text-[var(--text-2)]">Status</th>
                  <th className="px-4 py-3 text-center text-[var(--text-2)]">Waktu Daftar</th>
                  <th className="px-4 py-3 text-center text-[var(--text-2)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {queueData.tickets.map((t: any) => {
                  const st = STATUS_STYLE[t.status] || { label: t.status, variant: 'default' as const };
                  return (
                    <tr key={t.id} className={`border-b border-[var(--glass-border)] last:border-0 ${
                      t.status === 'CALLED' ? 'bg-[var(--amber-dim)]' :
                      t.status === 'SERVING' ? 'bg-[var(--teal-dim)]' : ''
                    }`}>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-2xl font-bold ${
                          t.status === 'CALLED' || t.status === 'SERVING' ? 'text-[var(--primary-soft)]' : 'text-[var(--text-3)]'
                        }`}>
                          {t.nomorAntrean}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--text-1)]">{t.patient?.namaLengkap || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-2)]">{t.patient?.noRm || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={st.label} variant={st.variant} />
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-[var(--text-3)]">
                        {t.waktuDaftar ? new Date(t.waktuDaftar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {t.status === 'CALLED' && (
                          <button onClick={() => handleServe(t.id)}
                            className="btn btn-ghost btn-xs px-2 py-1 text-[var(--teal)] mr-1">
                            Layani
                          </button>
                        )}
                        {(t.status === 'WAITING' || t.status === 'CALLED') && (
                          <button onClick={() => handleSkip(t.id)}
                            className="btn btn-ghost btn-xs px-2 py-1 text-[var(--rose)]">
                            Skip
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {queueData.tickets.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-[var(--text-3)]">Belum ada antrean</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card-flat p-12 text-center text-[var(--text-3)]">
          Pilih poli untuk melihat dan mengelola antrean
        </div>
      )}
    </div>
  );
}
