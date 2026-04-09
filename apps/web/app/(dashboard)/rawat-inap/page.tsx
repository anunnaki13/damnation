'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { formatDate } from '@/lib/utils';

type Tab = 'bedmap' | 'worklist' | 'cppt';

const BED_STATUS_COLOR: Record<string, string> = {
  TERSEDIA: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30',
  TERISI: 'bg-red-500/20 border-red-500/30 text-red-300',
  MAINTENANCE: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  RESERVASI: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
};

const KELAS_LABEL: Record<string, string> = {
  KELAS_1: 'Kelas 1', KELAS_2: 'Kelas 2', KELAS_3: 'Kelas 3',
  VIP: 'VIP', VVIP: 'VVIP', ICU: 'ICU', NICU: 'NICU', PICU: 'PICU',
};

export default function RawatInapPage() {
  const [tab, setTab] = useState<Tab>('bedmap');
  const [bedMap, setBedMap] = useState<any[]>([]);
  const [worklist, setWorklist] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [showAdmit, setShowAdmit] = useState(false);
  const [showCPPT, setShowCPPT] = useState<any>(null);
  const [cpptHistory, setCpptHistory] = useState<any[]>([]);
  const [cpptForm, setCpptForm] = useState({ subjective: '', objective: '', assessment: '', plan: '' });

  const fetchBedMap = useCallback(async () => {
    setLoading(true);
    try {
      const [mapRes, statsRes] = await Promise.all([
        apiClient.get('/beds/map'),
        apiClient.get('/inpatient/stats'),
      ]);
      setBedMap(mapRes.data);
      setStats(statsRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const fetchWorklist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/inpatient/worklist');
      setWorklist(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBedMap();
    fetchWorklist();
  }, [fetchBedMap, fetchWorklist]);

  const openCPPT = async (enc: any) => {
    setShowCPPT(enc);
    try {
      const res = await apiClient.get(`/inpatient/${enc.id}/cppt`);
      setCpptHistory(res.data);
    } catch (e) { console.error(e); }
  };

  const submitCPPT = async () => {
    if (!showCPPT) return;
    try {
      await apiClient.post('/inpatient/cppt', {
        encounterId: showCPPT.id,
        practitionerId: showCPPT.practitioner?.id || 1,
        ...cpptForm,
      });
      setCpptForm({ subjective: '', objective: '', assessment: '', plan: '' });
      const res = await apiClient.get(`/inpatient/${showCPPT.id}/cppt`);
      setCpptHistory(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal simpan CPPT');
    }
  };

  const handleDischarge = async (encId: number) => {
    if (!confirm('Pulangkan pasien ini?')) return;
    try {
      await apiClient.patch(`/inpatient/${encId}/discharge`, { caraKeluar: 'ATAS_PERSETUJUAN' });
      fetchBedMap();
      fetchWorklist();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal discharge');
    }
  };

  const tabs = [
    { key: 'bedmap', label: 'Bed Map' },
    { key: 'worklist', label: `Pasien Dirawat (${worklist.length})` },
  ];

  return (
    <div>
      <PageHeader title="Rawat Inap" description="Bed management, CPPT, dan discharge"
        action={
          <button onClick={() => setShowAdmit(true)} className="px-4 py-2 glass-btn text-sm">+ Admisi Baru</button>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-slate-500">BOR</p>
            <p className={`text-3xl font-bold ${stats.bor >= 85 ? 'text-red-400' : stats.bor >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>{stats.bor}%</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-slate-500">Pasien Dirawat</p>
            <p className="text-3xl font-bold text-indigo-400">{stats.activePatients}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-slate-500">Total Bed</p>
            <p className="text-3xl font-bold text-white">{stats.totalBeds}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-slate-500">Terisi</p>
            <p className="text-3xl font-bold text-red-400">{stats.terisi}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-slate-500">Tersedia</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.tersedia}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-white/[0.06]">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as Tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* BED MAP */}
      {tab === 'bedmap' && (
        <div className="space-y-6">
          {bedMap.map((bangsal) => (
            <div key={bangsal.id} className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">{bangsal.nama}</h3>
                  <p className="text-xs text-slate-500">{bangsal.summary.terisi}/{bangsal.summary.total} terisi | {bangsal.summary.tersedia} tersedia</p>
                </div>
                <div className="h-2 w-32 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                    style={{ width: bangsal.summary.total ? `${(bangsal.summary.terisi / bangsal.summary.total) * 100}%` : '0%' }} />
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {bangsal.beds.map((bed: any) => (
                  <button key={bed.id} onClick={() => setSelectedBed(bed)}
                    className={`rounded-xl border p-3 text-center transition ${BED_STATUS_COLOR[bed.status]}`}>
                    <p className="text-sm font-bold">{bed.nomorBed}</p>
                    <p className="text-[10px] mt-0.5 opacity-70">{KELAS_LABEL[bed.kelas] || bed.kelas}</p>
                    {bed.patient && (
                      <p className="text-[10px] mt-1 truncate font-medium">{bed.patient.namaLengkap}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex gap-4 justify-center text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/40" /> Tersedia</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/40" /> Terisi</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/40" /> Maintenance</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/40" /> Reservasi</span>
          </div>
        </div>
      )}

      {/* WORKLIST */}
      {tab === 'worklist' && (
        <div className="space-y-3">
          {worklist.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500">Tidak ada pasien rawat inap aktif</div>
          ) : worklist.map((enc) => (
            <div key={enc.id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold">{enc.patient?.namaLengkap}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {enc.patient?.noRm} | {enc.noRawat} | {enc.location?.nama} — Bed {enc.bed?.nomorBed}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={`Hari ke-${enc.hariRawat}`} variant="info" />
                    <StatusBadge status={KELAS_LABEL[enc.bed?.kelas] || '-'} variant="default" />
                    <StatusBadge status={enc.penjamin} variant={enc.penjamin === 'BPJS' ? 'success' : 'info'} />
                    {enc.diagnoses?.map((d: any) => (
                      <StatusBadge key={d.id || d.icd10Code} status={d.icd10Code} variant="warning" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    DPJP: {enc.practitioner?.namaLengkap || '-'}
                    {enc.lastCPPT && ` | CPPT terakhir: ${new Date(enc.lastCPPT).toLocaleString('id-ID')}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openCPPT(enc)} className="px-3 py-1.5 text-xs glass-btn">CPPT</button>
                  <button onClick={() => handleDischarge(enc.id)}
                    className="px-3 py-1.5 text-xs glass-btn-outline rounded-xl">Pulangkan</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bed Detail Modal */}
      {selectedBed && (
        <Modal isOpen={!!selectedBed} onClose={() => setSelectedBed(null)}
          title={`Bed ${selectedBed.nomorBed}`} size="sm">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Kelas</span><span className="text-white">{KELAS_LABEL[selectedBed.kelas]}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Status</span>
              <StatusBadge status={selectedBed.status} variant={selectedBed.status === 'TERSEDIA' ? 'success' : selectedBed.status === 'TERISI' ? 'danger' : 'warning'} />
            </div>
            <div className="flex justify-between"><span className="text-slate-400">Tarif/Hari</span><span className="text-white">Rp {selectedBed.tarifPerHari?.toLocaleString()}</span></div>
            {selectedBed.patient && (
              <div className="mt-4 p-3 bg-[rgba(255,255,255,0.03)] rounded-xl">
                <p className="text-white font-medium">{selectedBed.patient.namaLengkap}</p>
                <p className="text-xs text-slate-500">{selectedBed.patient.noRm} | {selectedBed.patient.noRawat}</p>
                <p className="text-xs text-slate-500">Masuk: {selectedBed.patient.tanggalMasuk ? formatDate(selectedBed.patient.tanggalMasuk) : '-'}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* CPPT Modal */}
      {showCPPT && (
        <Modal isOpen={!!showCPPT} onClose={() => setShowCPPT(null)}
          title={`CPPT — ${showCPPT.patient?.namaLengkap}`} size="xl">
          <div className="space-y-4">
            {/* Input CPPT */}
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-medium text-indigo-400">Input CPPT Baru</h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="S — Subjective">
                  <textarea value={cpptForm.subjective} onChange={(e) => setCpptForm({ ...cpptForm, subjective: e.target.value })}
                    className="w-full px-3 py-2 glass-input text-sm" rows={2} />
                </FormField>
                <FormField label="O — Objective">
                  <textarea value={cpptForm.objective} onChange={(e) => setCpptForm({ ...cpptForm, objective: e.target.value })}
                    className="w-full px-3 py-2 glass-input text-sm" rows={2} />
                </FormField>
                <FormField label="A — Assessment">
                  <textarea value={cpptForm.assessment} onChange={(e) => setCpptForm({ ...cpptForm, assessment: e.target.value })}
                    className="w-full px-3 py-2 glass-input text-sm" rows={2} />
                </FormField>
                <FormField label="P — Plan">
                  <textarea value={cpptForm.plan} onChange={(e) => setCpptForm({ ...cpptForm, plan: e.target.value })}
                    className="w-full px-3 py-2 glass-input text-sm" rows={2} />
                </FormField>
              </div>
              <button onClick={submitCPPT} className="px-4 py-2 glass-btn text-sm">Simpan CPPT</button>
            </div>

            {/* History */}
            <div>
              <h4 className="text-sm text-slate-400 mb-2">Riwayat CPPT ({cpptHistory.length})</h4>
              {cpptHistory.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada catatan CPPT</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cpptHistory.map((c: any) => (
                    <div key={c.id} className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3 text-sm">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{c.practitioner?.namaLengkap} ({c.practitioner?.jenisNakes})</span>
                        <span>{new Date(c.createdAt).toLocaleString('id-ID')}</span>
                      </div>
                      {c.subjective && <p className="text-slate-300"><strong className="text-slate-400">S:</strong> {c.subjective}</p>}
                      {c.objective && <p className="text-slate-300"><strong className="text-slate-400">O:</strong> {c.objective}</p>}
                      {c.assessment && <p className="text-slate-300"><strong className="text-slate-400">A:</strong> {c.assessment}</p>}
                      {c.plan && <p className="text-slate-300"><strong className="text-slate-400">P:</strong> {c.plan}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
