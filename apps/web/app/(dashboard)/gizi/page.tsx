'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

export default function GiziPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showADIME, setShowADIME] = useState<any>(null);
  const [adimeForm, setAdimeForm] = useState({ assessment: '', diagnosis: '', intervention: '', monitoring: '', evaluation: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/nutrition/orders');
      setOrders(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const submitADIME = async () => {
    if (!showADIME) return;
    try {
      await apiClient.post('/nutrition/adime', { encounterId: showADIME.encounterId, practitionerId: 1, ...adimeForm });
      setShowADIME(null);
      setAdimeForm({ assessment: '', diagnosis: '', intervention: '', monitoring: '', evaluation: '' });
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || 'Gagal simpan'); }
  };

  return (
    <div>
      <PageHeader title="Instalasi Gizi" description="Asesmen gizi dan manajemen diet pasien rawat inap" />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-flat p-4 text-center"><p className="text-[28px] font-bold text-white">{orders.length}</p><p className="text-[11px] text-[#4a5268]">Pasien Dirawat</p></div>
        <div className="card-flat p-4 text-center"><p className="text-[28px] font-bold text-emerald-400">{orders.filter((o) => o.hasADIME).length}</p><p className="text-[11px] text-[#4a5268]">Sudah ADIME</p></div>
        <div className="card-flat p-4 text-center"><p className="text-[28px] font-bold text-amber-400">{orders.filter((o) => !o.hasADIME).length}</p><p className="text-[11px] text-[#4a5268]">Belum ADIME</p></div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="card-flat p-16 text-center"><div className="w-5 h-5 border-2 border-[#7c5cfc]/20 border-t-[#7c5cfc] rounded-full animate-spin mx-auto" /></div>
        ) : orders.length === 0 ? (
          <div className="card-flat p-16 text-center text-[#4a5268] text-[13px]">Tidak ada pasien rawat inap</div>
        ) : orders.map((o) => (
          <div key={o.encounterId} className="card-flat p-5 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{o.patient.namaLengkap}</p>
              <p className="text-[12px] text-[#8892a4]">{o.patient.noRm} | {o.bangsal} — Bed {o.bed || '-'}</p>
              {o.patient.alergiMakanan && <p className="text-[11px] text-red-400 mt-1">Alergi: {o.patient.alergiMakanan}</p>}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={o.hasADIME ? 'ADIME Done' : 'Belum ADIME'} variant={o.hasADIME ? 'success' : 'warning'} />
              <button onClick={() => setShowADIME(o)} className="btn btn-primary btn-xs">
                {o.hasADIME ? 'Update' : 'Input'} ADIME
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!showADIME} onClose={() => setShowADIME(null)} title={`ADIME — ${showADIME?.patient?.namaLengkap || ''}`} size="lg">
        <div className="space-y-4">
          {['assessment', 'diagnosis', 'intervention', 'monitoring', 'evaluation'].map((field) => (
            <FormField key={field} label={field.charAt(0).toUpperCase() + field.slice(1)}>
              <textarea value={(adimeForm as any)[field]} onChange={(e) => setAdimeForm({ ...adimeForm, [field]: e.target.value })}
                className="textarea" rows={2} placeholder={`${field === 'assessment' ? 'Status gizi, antropometri, biokimia, klinis, dietari' : field === 'diagnosis' ? 'Diagnosis gizi' : field === 'intervention' ? 'Intervensi gizi / diet' : field === 'monitoring' ? 'Parameter monitoring' : 'Evaluasi hasil intervensi'}...`} />
            </FormField>
          ))}
          <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.04]">
            <button onClick={() => setShowADIME(null)} className="btn btn-ghost btn-sm">Batal</button>
            <button onClick={submitADIME} className="btn btn-primary btn-sm">Simpan ADIME</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
