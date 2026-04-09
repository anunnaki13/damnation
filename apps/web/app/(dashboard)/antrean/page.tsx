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
          <button onClick={handleCallNext}
            className="px-6 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium">
            Panggil Berikutnya
          </button>
        ) : undefined}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {summary.map((s) => (
          <button key={s.location.id} onClick={() => fetchQueue(s.location.id)}
            className={`bg-white rounded-xl border p-4 text-left hover:shadow-md transition ${
              selectedLoc === s.location.id ? 'ring-2 ring-primary-500 border-primary-500' : ''
            }`}>
            <p className="text-sm font-medium text-gray-700 truncate">{s.location.nama}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-primary-600">{s.currentNumber ?? '-'}</span>
              <span className="text-xs text-gray-400">sedang</span>
            </div>
            <div className="flex gap-3 mt-2 text-xs text-gray-500">
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
            <div className="bg-primary-600 text-white rounded-2xl p-8 mb-6 text-center">
              <p className="text-sm opacity-80">Nomor Antrean Saat Ini</p>
              <p className="text-7xl font-bold my-2">{queueData.summary.currentNumber}</p>
              <p className="text-sm opacity-80">
                {queueData.tickets.find((t: any) => t.status === 'CALLED' || t.status === 'SERVING')?.patient?.namaLengkap || ''}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold">{queueData.summary.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{queueData.summary.waiting}</p>
              <p className="text-xs text-blue-500">Menunggu</p>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{queueData.summary.serving}</p>
              <p className="text-xs text-green-500">Dilayani</p>
            </div>
            <div className="bg-gray-50 rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-gray-500">{queueData.summary.done}</p>
              <p className="text-xs text-gray-400">Selesai</p>
            </div>
          </div>

          {/* Ticket List */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-center w-20">No</th>
                  <th className="px-4 py-3 text-left">Pasien</th>
                  <th className="px-4 py-3 text-left">No. RM</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Waktu Daftar</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {queueData.tickets.map((t: any) => {
                  const st = STATUS_STYLE[t.status] || { label: t.status, variant: 'default' as const };
                  return (
                    <tr key={t.id} className={`border-b last:border-0 ${
                      t.status === 'CALLED' ? 'bg-yellow-50' :
                      t.status === 'SERVING' ? 'bg-green-50' : ''
                    }`}>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-2xl font-bold ${
                          t.status === 'CALLED' || t.status === 'SERVING' ? 'text-primary-600' : 'text-gray-400'
                        }`}>
                          {t.nomorAntrean}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{t.patient?.namaLengkap || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.patient?.noRm || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={st.label} variant={st.variant} />
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">
                        {t.waktuDaftar ? new Date(t.waktuDaftar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {t.status === 'CALLED' && (
                          <button onClick={() => handleServe(t.id)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 mr-1">
                            Layani
                          </button>
                        )}
                        {(t.status === 'WAITING' || t.status === 'CALLED') && (
                          <button onClick={() => handleSkip(t.id)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
                            Skip
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {queueData.tickets.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Belum ada antrean</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          Pilih poli untuk melihat dan mengelola antrean
        </div>
      )}
    </div>
  );
}
