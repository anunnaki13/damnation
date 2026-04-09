'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

const STATUS_MAP: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'default' }> = {
  ORDERED: { label: 'Order Masuk', variant: 'warning' },
  SCHEDULED: { label: 'Dijadwalkan', variant: 'info' },
  IN_PROGRESS: { label: 'Pemeriksaan', variant: 'info' },
  COMPLETED: { label: 'Selesai', variant: 'success' },
};

const MODALITAS_ICON: Record<string, string> = {
  XRAY: 'X', CT: 'CT', MRI: 'MR', USG: 'US', FLUOROSCOPY: 'FL', MAMMOGRAPHY: 'MM',
};

export default function RadiologiPage() {
  const [worklist, setWorklist] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showExpertise, setShowExpertise] = useState<any>(null);
  const [expertiseForm, setExpertiseForm] = useState({ hasilBacaan: '', kesan: '', proyeksi: '', kV: '', mAS: '', dosis: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const [wl, st] = await Promise.all([
        apiClient.get('/radiology/worklist', { params }),
        apiClient.get('/radiology/stats'),
      ]);
      setWorklist(wl.data);
      setStats(st.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusUpdate = async (id: number, status: string) => {
    await apiClient.patch(`/radiology/order/${id}/status`, { status });
    fetchData();
  };

  const handleExpertise = async () => {
    if (!showExpertise) return;
    try {
      await apiClient.post(`/radiology/order/${showExpertise.id}/expertise`, {
        ...expertiseForm, radiologistId: 1,
      });
      alert('Expertise berhasil disimpan');
      setShowExpertise(null);
      setExpertiseForm({ hasilBacaan: '', kesan: '', proyeksi: '', kV: '', mAS: '', dosis: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal simpan');
    }
  };

  return (
    <div>
      <PageHeader title="Radiologi" description="Kelola order, pemeriksaan, dan expertise radiologi" />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, text: 'text-white' },
            { label: 'Order Masuk', value: stats.ordered, text: 'text-amber-400' },
            { label: 'Proses', value: stats.inProgress, text: 'text-indigo-400' },
            { label: 'Selesai', value: stats.completed, text: 'text-emerald-400' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`text-3xl font-bold ${s.text} mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {[{ key: '', label: 'Aktif' }, { key: 'COMPLETED', label: 'Selesai' }].map((f) => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 text-sm rounded-xl ${filterStatus === f.key ? 'glass-btn' : 'glass-btn-outline'}`}>{f.label}</button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="glass-card p-12 text-center"><div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" /></div>
        ) : worklist.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500">Tidak ada order radiologi</div>
        ) : worklist.map((order) => {
          const st = STATUS_MAP[order.status] || { label: order.status, variant: 'default' as const };
          return (
            <div key={order.id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                    {MODALITAS_ICON[order.modalitas] || order.modalitas?.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-indigo-400">{order.noOrder}</span>
                      <StatusBadge status={st.label} variant={st.variant} />
                      <StatusBadge status={order.modalitas} variant="default" />
                    </div>
                    <p className="text-white font-medium mt-1">{order.jenisPemeriksaan}</p>
                    <p className="text-xs text-slate-500">{order.patient?.namaLengkap} ({order.patient?.noRm})</p>
                    {order.catatanKlinis && <p className="text-xs text-slate-400 mt-1">Klinis: {order.catatanKlinis}</p>}
                    {order.kesan && (
                      <div className="mt-2 p-2 bg-white/[0.02] rounded-lg">
                        <p className="text-xs text-slate-400">Kesan: <span className="text-white">{order.kesan}</span></p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {order.status === 'ORDERED' && (
                    <button onClick={() => handleStatusUpdate(order.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 text-xs glass-btn">Mulai</button>
                  )}
                  {order.status === 'IN_PROGRESS' && (
                    <button onClick={() => { setShowExpertise(order); setExpertiseForm({ hasilBacaan: '', kesan: '', proyeksi: '', kV: '', mAS: '', dosis: '' }); }}
                      className="px-3 py-1.5 text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl">
                      Input Expertise
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expertise Modal */}
      <Modal isOpen={!!showExpertise} onClose={() => setShowExpertise(null)}
        title={`Expertise — ${showExpertise?.jenisPemeriksaan || ''}`} size="lg">
        <div className="space-y-4">
          <div className="bg-white/[0.02] rounded-xl p-3 text-sm">
            <p className="text-slate-400">Pasien: <span className="text-white">{showExpertise?.patient?.namaLengkap}</span></p>
            <p className="text-slate-400">Modalitas: <span className="text-white">{showExpertise?.modalitas}</span></p>
            {showExpertise?.catatanKlinis && <p className="text-slate-400">Klinis: <span className="text-white">{showExpertise.catatanKlinis}</span></p>}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <FormField label="Proyeksi">
              <input value={expertiseForm.proyeksi} onChange={(e) => setExpertiseForm({ ...expertiseForm, proyeksi: e.target.value })}
                className="w-full px-3 py-2 glass-input text-sm" placeholder="AP/PA" />
            </FormField>
            <FormField label="kV">
              <input value={expertiseForm.kV} onChange={(e) => setExpertiseForm({ ...expertiseForm, kV: e.target.value })}
                className="w-full px-3 py-2 glass-input text-sm" />
            </FormField>
            <FormField label="mAS">
              <input value={expertiseForm.mAS} onChange={(e) => setExpertiseForm({ ...expertiseForm, mAS: e.target.value })}
                className="w-full px-3 py-2 glass-input text-sm" />
            </FormField>
            <FormField label="Dosis">
              <input value={expertiseForm.dosis} onChange={(e) => setExpertiseForm({ ...expertiseForm, dosis: e.target.value })}
                className="w-full px-3 py-2 glass-input text-sm" />
            </FormField>
          </div>

          <FormField label="Hasil Bacaan" required>
            <textarea value={expertiseForm.hasilBacaan} onChange={(e) => setExpertiseForm({ ...expertiseForm, hasilBacaan: e.target.value })}
              className="w-full px-3 py-2 glass-input text-sm" rows={5} placeholder="Deskripsi hasil pemeriksaan radiologi..." />
          </FormField>

          <FormField label="Kesan / Impression" required>
            <textarea value={expertiseForm.kesan} onChange={(e) => setExpertiseForm({ ...expertiseForm, kesan: e.target.value })}
              className="w-full px-3 py-2 glass-input text-sm" rows={3} placeholder="Kesan/kesimpulan radiolog..." />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
            <button onClick={() => setShowExpertise(null)} className="px-4 py-2 text-sm glass-btn-outline rounded-xl">Batal</button>
            <button onClick={handleExpertise} className="px-6 py-2 text-sm glass-btn">Simpan Expertise</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
