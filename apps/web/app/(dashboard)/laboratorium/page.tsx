'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

const STATUS_MAP: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'default' }> = {
  ORDERED: { label: 'Order Masuk', variant: 'warning' },
  SPECIMEN_COLLECTED: { label: 'Specimen', variant: 'info' },
  IN_PROGRESS: { label: 'Proses', variant: 'info' },
  COMPLETED: { label: 'Selesai', variant: 'success' },
  CANCELLED: { label: 'Batal', variant: 'danger' },
};

const PRIORITAS_VARIANT: Record<string, 'default' | 'warning' | 'danger'> = {
  ROUTINE: 'default', URGENT: 'warning', STAT: 'danger',
};

export default function LaboratoriumPage() {
  const [worklist, setWorklist] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [resultInputs, setResultInputs] = useState<Record<number, Array<{ parameter: string; hasil: string; satuan: string; nilaiNormal: string; flag: string }>>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const [wl, st] = await Promise.all([
        apiClient.get('/lab/worklist', { params }),
        apiClient.get('/lab/stats'),
      ]);
      setWorklist(wl.data);
      setStats(st.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (order: any) => {
    try {
      const res = await apiClient.get(`/lab/order/${order.id}`);
      setSelectedOrder(res.data);
      // Initialize result inputs
      const inputs: Record<number, any[]> = {};
      for (const item of res.data.items) {
        if (!item.results?.length) {
          inputs[item.id] = [{ parameter: item.pemeriksaan, hasil: '', satuan: '', nilaiNormal: '', flag: '' }];
        }
      }
      setResultInputs(inputs);
    } catch (e) { console.error(e); }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await apiClient.patch(`/lab/order/${id}/status`, { status });
    fetchData();
    if (selectedOrder?.id === id) openDetail(selectedOrder);
  };

  const handleInputResult = async (itemId: number) => {
    const results = resultInputs[itemId];
    if (!results?.length) return;
    try {
      await apiClient.post(`/lab/order/${itemId}/results`, { results });
      alert('Hasil berhasil disimpan');
      if (selectedOrder) openDetail(selectedOrder);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal input hasil');
    }
  };

  const handleValidate = async (orderId: number) => {
    await apiClient.post(`/lab/order/${orderId}/validate`);
    alert('Hasil lab divalidasi');
    fetchData();
    setSelectedOrder(null);
  };

  return (
    <div>
      <PageHeader title="Laboratorium" description="Kelola order, input hasil, dan validasi lab" />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Order', value: stats.total, text: 'text-white' },
            { label: 'Order Masuk', value: stats.ordered, text: 'text-amber-400' },
            { label: 'Diproses', value: stats.inProgress, text: 'text-indigo-400' },
            { label: 'Selesai', value: stats.completed, text: 'text-emerald-400' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`text-3xl font-bold ${s.text} mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[{ key: '', label: 'Aktif' }, { key: 'COMPLETED', label: 'Selesai' }, { key: 'ORDERED', label: 'Order Masuk' }].map((f) => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 text-sm rounded-xl ${filterStatus === f.key ? 'glass-btn' : 'glass-btn-outline'}`}>{f.label}</button>
        ))}
      </div>

      {/* Worklist */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card p-12 text-center"><div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" /></div>
        ) : worklist.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500">Tidak ada order lab</div>
        ) : worklist.map((order) => {
          const st = STATUS_MAP[order.status] || { label: order.status, variant: 'default' as const };
          return (
            <div key={order.id} className="glass-card p-5 cursor-pointer hover:bg-white/[0.06]" onClick={() => openDetail(order)}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-indigo-400">{order.noOrder}</span>
                    <StatusBadge status={st.label} variant={st.variant} />
                    <StatusBadge status={order.prioritas} variant={PRIORITAS_VARIANT[order.prioritas] || 'default'} />
                  </div>
                  <p className="text-white font-medium mt-1">{order.patient?.namaLengkap}</p>
                  <p className="text-xs text-slate-500">{order.patient?.noRm} | Dokter: {order.requester?.namaLengkap} | {order.encounter?.tipe}</p>
                </div>
                <div className="flex gap-2">
                  {order.status === 'ORDERED' && (
                    <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'SPECIMEN_COLLECTED'); }}
                      className="px-3 py-1.5 text-xs glass-btn">Specimen</button>
                  )}
                  {order.status === 'SPECIMEN_COLLECTED' && (
                    <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'IN_PROGRESS'); }}
                      className="px-3 py-1.5 text-xs glass-btn">Proses</button>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {order.items?.map((item: any) => (
                  <span key={item.id} className="text-xs bg-white/[0.05] border border-white/10 rounded-lg px-2 py-0.5 text-slate-400">
                    {item.pemeriksaan} {item.results?.length > 0 ? '✓' : ''}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail + Input Hasil Modal */}
      {selectedOrder && (
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)}
          title={`Lab Order ${selectedOrder.noOrder}`} size="xl">
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-white font-medium">{selectedOrder.patient?.namaLengkap}</p>
                <p className="text-xs text-slate-500">{selectedOrder.patient?.noRm} | {selectedOrder.encounter?.noRawat}</p>
              </div>
              <StatusBadge status={STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}
                variant={STATUS_MAP[selectedOrder.status]?.variant || 'default'} />
            </div>

            {/* Items + Results */}
            {selectedOrder.items?.map((item: any) => (
              <div key={item.id} className="bg-white/[0.02] rounded-xl p-4">
                <p className="text-white font-medium text-sm mb-2">{item.pemeriksaan}</p>

                {/* Existing results */}
                {item.results?.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {item.results.map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between text-sm bg-white/[0.02] rounded-lg px-3 py-1.5">
                        <span className="text-slate-400">{r.parameter}</span>
                        <div className="flex items-center gap-3">
                          <span className={`font-medium ${r.flag === 'HIGH' || r.flag === 'CRITICAL_HIGH' ? 'text-red-400' : r.flag === 'LOW' || r.flag === 'CRITICAL_LOW' ? 'text-blue-400' : 'text-white'}`}>
                            {r.hasil} {r.satuan}
                          </span>
                          <span className="text-xs text-slate-500">({r.nilaiNormal || '-'})</span>
                          {r.flag && <StatusBadge status={r.flag} variant={r.flag.includes('CRITICAL') ? 'danger' : r.flag === 'HIGH' || r.flag === 'LOW' ? 'warning' : 'success'} />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input new results */}
                {!item.results?.length && selectedOrder.status !== 'COMPLETED' && (
                  <div className="space-y-2">
                    {(resultInputs[item.id] || []).map((r: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-5 gap-2">
                        <input value={r.parameter} onChange={(e) => {
                          const n = { ...resultInputs }; n[item.id][idx].parameter = e.target.value; setResultInputs(n);
                        }} className="glass-input px-2 py-1.5 text-xs" placeholder="Parameter" />
                        <input value={r.hasil} onChange={(e) => {
                          const n = { ...resultInputs }; n[item.id][idx].hasil = e.target.value; setResultInputs(n);
                        }} className="glass-input px-2 py-1.5 text-xs" placeholder="Hasil" />
                        <input value={r.satuan} onChange={(e) => {
                          const n = { ...resultInputs }; n[item.id][idx].satuan = e.target.value; setResultInputs(n);
                        }} className="glass-input px-2 py-1.5 text-xs" placeholder="Satuan" />
                        <input value={r.nilaiNormal} onChange={(e) => {
                          const n = { ...resultInputs }; n[item.id][idx].nilaiNormal = e.target.value; setResultInputs(n);
                        }} className="glass-input px-2 py-1.5 text-xs" placeholder="Normal" />
                        <select value={r.flag} onChange={(e) => {
                          const n = { ...resultInputs }; n[item.id][idx].flag = e.target.value; setResultInputs(n);
                        }} className="glass-select px-2 py-1.5 text-xs">
                          <option value="">Normal</option>
                          <option value="HIGH">High</option>
                          <option value="LOW">Low</option>
                          <option value="CRITICAL_HIGH">Critical High</option>
                          <option value="CRITICAL_LOW">Critical Low</option>
                        </select>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button onClick={() => {
                        const n = { ...resultInputs };
                        n[item.id] = [...(n[item.id] || []), { parameter: '', hasil: '', satuan: '', nilaiNormal: '', flag: '' }];
                        setResultInputs(n);
                      }} className="text-xs text-indigo-400 hover:underline">+ Tambah Parameter</button>
                      <button onClick={() => handleInputResult(item.id)}
                        className="px-3 py-1 text-xs glass-btn">Simpan Hasil</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Validate */}
            {selectedOrder.status === 'IN_PROGRESS' && (
              <button onClick={() => handleValidate(selectedOrder.id)}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-medium">
                Validasi Semua Hasil
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
