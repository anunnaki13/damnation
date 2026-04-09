'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { formatDate } from '@/lib/utils';

export default function KamarOperasiPage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showReport, setShowReport] = useState<any>(null);
  const [reportForm, setReportForm] = useState({ laporanOperasi: '', diagnosaPasca: '', jenisAnestesi: '', jamMulai: '', jamSelesai: '' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/surgery/schedule', { params: { date: selectedDate } });
      setSchedule(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReport = async () => {
    if (!showReport) return;
    try {
      await apiClient.post(`/surgery/${showReport.id}/report`, reportForm);
      setShowReport(null);
      setReportForm({ laporanOperasi: '', diagnosaPasca: '', jenisAnestesi: '', jamMulai: '', jamSelesai: '' });
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || 'Gagal simpan'); }
  };

  return (
    <div>
      <PageHeader title="Kamar Operasi" description="Jadwal operasi dan laporan pembedahan"
        action={<button onClick={() => setShowSchedule(true)} className="btn btn-primary btn-sm">+ Jadwalkan Operasi</button>} />

      <div className="flex items-center gap-3 mb-6">
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="input w-auto" />
        <span className="text-[13px] text-[#8892a4]">{schedule.length} operasi dijadwalkan</span>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="card-flat p-16 text-center"><div className="w-5 h-5 border-2 border-[#7c5cfc]/20 border-t-[#7c5cfc] rounded-full animate-spin mx-auto" /></div>
        ) : schedule.length === 0 ? (
          <div className="card-flat p-16 text-center text-[#4a5268] text-[13px]">Tidak ada jadwal operasi</div>
        ) : schedule.map((op) => (
          <div key={op.id} className="card-flat p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-mono text-[#7c5cfc]">{new Date(op.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  <StatusBadge status={op.statusBayar === 'Sudah' ? 'Selesai' : 'Terjadwal'} variant={op.statusBayar === 'Sudah' ? 'success' : 'warning'} />
                </div>
                <p className="text-white font-semibold">{op.nmPerawatan || op.icd9cmDisplay}</p>
                <p className="text-[12px] text-[#8892a4] mt-1">Pasien: {op.encounter?.patient?.namaLengkap} ({op.encounter?.patient?.noRm})</p>
                <p className="text-[12px] text-[#4a5268]">Operator: {op.practitioner?.namaLengkap} | {op.practitioner?.spesialisasi || '-'}</p>
                {op.catatan && <p className="text-[11px] text-[#4a5268] mt-2 whitespace-pre-line bg-white/[0.02] rounded-xl p-3">{op.catatan}</p>}
              </div>
              {op.statusBayar !== 'Sudah' && (
                <button onClick={() => setShowReport(op)} className="btn btn-success btn-xs">Laporan</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      <Modal isOpen={!!showReport} onClose={() => setShowReport(null)} title="Laporan Operasi" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Jam Mulai"><input type="time" value={reportForm.jamMulai} onChange={(e) => setReportForm({ ...reportForm, jamMulai: e.target.value })} className="input" /></FormField>
            <FormField label="Jam Selesai"><input type="time" value={reportForm.jamSelesai} onChange={(e) => setReportForm({ ...reportForm, jamSelesai: e.target.value })} className="input" /></FormField>
            <FormField label="Jenis Anestesi"><input value={reportForm.jenisAnestesi} onChange={(e) => setReportForm({ ...reportForm, jenisAnestesi: e.target.value })} className="input" placeholder="GA / Spinal / Lokal" /></FormField>
          </div>
          <FormField label="Laporan Operasi" required>
            <textarea value={reportForm.laporanOperasi} onChange={(e) => setReportForm({ ...reportForm, laporanOperasi: e.target.value })} className="textarea" rows={6} placeholder="Deskripsi tindakan operasi..." />
          </FormField>
          <FormField label="Diagnosa Pasca Operasi">
            <input value={reportForm.diagnosaPasca} onChange={(e) => setReportForm({ ...reportForm, diagnosaPasca: e.target.value })} className="input" />
          </FormField>
          <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.04]">
            <button onClick={() => setShowReport(null)} className="btn btn-ghost btn-sm">Batal</button>
            <button onClick={handleReport} className="btn btn-primary btn-sm">Simpan Laporan</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
