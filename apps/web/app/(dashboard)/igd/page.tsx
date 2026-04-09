'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { formatDate } from '@/lib/utils';

const TRIASE_CONFIG: Record<string, { label: string; color: string; bgClass: string; desc: string }> = {
  ESI_1: { label: 'ESI 1', color: '#ef4444', bgClass: 'bg-red-500/20 border-red-500/30 text-red-300', desc: 'Resusitasi — Mengancam jiwa' },
  ESI_2: { label: 'ESI 2', color: '#f97316', bgClass: 'bg-orange-500/20 border-orange-500/30 text-orange-300', desc: 'Emergent — Risiko tinggi' },
  ESI_3: { label: 'ESI 3', color: '#eab308', bgClass: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300', desc: 'Urgent — Perlu evaluasi segera' },
  ESI_4: { label: 'ESI 4', color: '#22c55e', bgClass: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300', desc: 'Less Urgent' },
  ESI_5: { label: 'ESI 5', color: '#3b82f6', bgClass: 'bg-blue-500/20 border-blue-500/30 text-blue-300', desc: 'Non-Urgent' },
};

export default function IgdPage() {
  const [worklist, setWorklist] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showTriase, setShowTriase] = useState<any>(null);
  const [showDisposisi, setShowDisposisi] = useState<any>(null);

  // Quick register form
  const [regForm, setRegForm] = useState({ patientId: '', namaLengkap: '', jenisKelamin: 'L', triaseLevel: 'ESI_3', penjamin: 'UMUM', caraMasuk: 'SENDIRI' });

  // Triase form
  const [triaseForm, setTriaseForm] = useState({
    practitionerId: 1, triaseLevel: 'ESI_3', keluhanUtama: '', primarySurvey: '', secondarySurvey: '',
    mekanismeCedera: '', kesimpulan: '', tindakanAwal: '',
    tekananDarahSistolik: '', tekananDarahDiastolik: '', nadi: '', suhu: '', pernapasan: '', spo2: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [wl, st] = await Promise.all([
        apiClient.get('/emergency/worklist'),
        apiClient.get('/emergency/stats'),
      ]);
      setWorklist(wl.data);
      setStats(st.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh 15 detik
  useEffect(() => {
    const iv = setInterval(fetchData, 15000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const handleRegister = async () => {
    try {
      await apiClient.post('/emergency/register', {
        ...regForm,
        patientId: regForm.patientId ? Number(regForm.patientId) : undefined,
      });
      setShowRegister(false);
      setRegForm({ patientId: '', namaLengkap: '', jenisKelamin: 'L', triaseLevel: 'ESI_3', penjamin: 'UMUM', caraMasuk: 'SENDIRI' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal registrasi');
    }
  };

  const handleTriase = async () => {
    try {
      await apiClient.post(`/emergency/${showTriase.id}/triase`, {
        ...triaseForm,
        tekananDarahSistolik: triaseForm.tekananDarahSistolik ? Number(triaseForm.tekananDarahSistolik) : undefined,
        tekananDarahDiastolik: triaseForm.tekananDarahDiastolik ? Number(triaseForm.tekananDarahDiastolik) : undefined,
        nadi: triaseForm.nadi ? Number(triaseForm.nadi) : undefined,
        suhu: triaseForm.suhu ? Number(triaseForm.suhu) : undefined,
        pernapasan: triaseForm.pernapasan ? Number(triaseForm.pernapasan) : undefined,
        spo2: triaseForm.spo2 ? Number(triaseForm.spo2) : undefined,
      });
      setShowTriase(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal input triase');
    }
  };

  const handleDisposisi = async (disposisi: string) => {
    try {
      await apiClient.patch(`/emergency/${showDisposisi.id}/disposisi`, { disposisi });
      setShowDisposisi(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal disposisi');
    }
  };

  return (
    <div>
      <PageHeader title="Instalasi Gawat Darurat" description="Triase, asesmen, dan disposisi pasien IGD"
        action={
          <button onClick={() => setShowRegister(true)} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-xl shadow-lg font-medium">
            + Pasien IGD Baru
          </button>
        }
      />

      {/* Triase Summary — ESI Level Cards */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3 mb-6">
          <div className="glass-card p-4 text-center col-span-2 md:col-span-2">
            <p className="text-xs text-slate-500">Total Hari Ini</p>
            <p className="text-4xl font-bold text-white mt-1">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-1">{stats.active} aktif | {stats.finished} selesai</p>
          </div>
          {['ESI_1', 'ESI_2', 'ESI_3', 'ESI_4', 'ESI_5'].map((esi) => {
            const cfg = TRIASE_CONFIG[esi];
            const count = stats[esi.toLowerCase().replace('_', '')] || 0;
            return (
              <div key={esi} className={`rounded-xl border p-3 text-center ${cfg.bgClass}`}>
                <p className="text-xs opacity-80">{cfg.label}</p>
                <p className="text-2xl font-bold mt-0.5">{count}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Worklist */}
      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : worklist.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">Tidak ada pasien IGD hari ini</div>
      ) : (
        <div className="space-y-3">
          {worklist.map((enc) => {
            const triase = enc.triaseLevel ? TRIASE_CONFIG[enc.triaseLevel] : null;
            return (
              <div key={enc.id} className={`glass-card p-5 border-l-4`}
                style={{ borderLeftColor: triase?.color || '#64748b' }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Triase badge */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold ${
                      triase?.bgClass || 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {triase ? triase.label.replace('ESI ', '') : '?'}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{enc.patient?.namaLengkap}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {enc.patient?.noRm} | {enc.noRawat} | {enc.patient?.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        {enc.patient?.tanggalLahir && ` | ${formatDate(enc.patient.tanggalLahir)}`}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={enc.status === 'IN_PROGRESS' ? 'Ditangani' : enc.status === 'ARRIVED' ? 'Baru Datang' : enc.status}
                          variant={enc.status === 'IN_PROGRESS' ? 'success' : enc.status === 'ARRIVED' ? 'warning' : 'default'} />
                        <StatusBadge status={enc.penjamin} variant={enc.penjamin === 'BPJS' ? 'success' : 'info'} />
                        {enc.caraMasuk && <StatusBadge status={enc.caraMasuk} variant="default" />}
                        {enc.patient?.alergiObat && <StatusBadge status="ALERGI" variant="danger" />}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!enc.hasTriase && (
                      <button onClick={() => { setShowTriase(enc); setTriaseForm((f) => ({ ...f, triaseLevel: enc.triaseLevel || 'ESI_3' })); }}
                        className="px-3 py-1.5 text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl">
                        Triase
                      </button>
                    )}
                    {enc.hasTriase && !enc.hasAssessment && (
                      <button onClick={() => setShowTriase(enc)}
                        className="px-3 py-1.5 text-xs glass-btn">Asesmen</button>
                    )}
                    {enc.status !== 'FINISHED' && (
                      <button onClick={() => setShowDisposisi(enc)}
                        className="px-3 py-1.5 text-xs glass-btn-outline rounded-xl">Disposisi</button>
                    )}
                  </div>
                </div>

                {/* Time elapsed */}
                <div className="mt-3 text-xs text-slate-500">
                  Masuk: {new Date(enc.tanggalMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  {' | '}
                  Elapsed: {Math.round((Date.now() - new Date(enc.tanggalMasuk).getTime()) / 60000)} menit
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Register Modal */}
      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Registrasi Cepat IGD" size="lg">
        <div className="space-y-4">
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <p className="text-sm text-red-300 font-medium">Mode Cepat — Data pasien bisa dilengkapi nanti</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="ID Pasien (jika dikenal)">
              <input type="number" value={regForm.patientId} onChange={(e) => setRegForm({ ...regForm, patientId: e.target.value })}
                className="w-full px-3 py-2 glass-input text-sm" placeholder="Kosongkan jika belum dikenal" />
            </FormField>
            <FormField label="Nama (jika pasien baru)">
              <input type="text" value={regForm.namaLengkap} onChange={(e) => setRegForm({ ...regForm, namaLengkap: e.target.value })}
                className="w-full px-3 py-2 glass-input text-sm" />
            </FormField>
          </div>

          <FormField label="Triase Awal" required>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(TRIASE_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setRegForm({ ...regForm, triaseLevel: key })}
                  className={`py-3 rounded-xl text-sm font-bold border transition ${
                    regForm.triaseLevel === key ? cfg.bgClass + ' ring-2 ring-white/20' : 'bg-[rgba(255,255,255,0.03)] border-white/10 text-slate-400'
                  }`}>
                  <div>{cfg.label}</div>
                  <div className="text-[10px] font-normal mt-0.5 opacity-70">{cfg.desc.split('—')[0]}</div>
                </button>
              ))}
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Penjamin">
              <select value={regForm.penjamin} onChange={(e) => setRegForm({ ...regForm, penjamin: e.target.value })}
                className="w-full px-3 py-2 glass-select text-sm">
                <option value="UMUM">Umum</option>
                <option value="BPJS">BPJS</option>
                <option value="ASURANSI">Asuransi</option>
              </select>
            </FormField>
            <FormField label="Cara Masuk">
              <select value={regForm.caraMasuk} onChange={(e) => setRegForm({ ...regForm, caraMasuk: e.target.value })}
                className="w-full px-3 py-2 glass-select text-sm">
                <option value="SENDIRI">Datang Sendiri</option>
                <option value="RUJUKAN">Rujukan</option>
                <option value="PINDAHAN">Pindahan RS</option>
              </select>
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
            <button onClick={() => setShowRegister(false)} className="px-4 py-2 text-sm glass-btn-outline rounded-xl">Batal</button>
            <button onClick={handleRegister}
              className="px-6 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg">
              Daftarkan Pasien IGD
            </button>
          </div>
        </div>
      </Modal>

      {/* Triase Modal */}
      <Modal isOpen={!!showTriase} onClose={() => setShowTriase(null)}
        title={`Triase — ${showTriase?.patient?.namaLengkap || ''}`} size="xl">
        <div className="space-y-4">
          <FormField label="Level Triase ESI" required>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(TRIASE_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setTriaseForm({ ...triaseForm, triaseLevel: key })}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    triaseForm.triaseLevel === key ? cfg.bgClass + ' ring-2 ring-white/20' : 'bg-[rgba(255,255,255,0.03)] border-white/10 text-slate-400'
                  }`}>{cfg.label}</button>
              ))}
            </div>
          </FormField>

          <h4 className="text-sm font-medium text-slate-300 mt-2">Tanda Vital</h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { key: 'tekananDarahSistolik', label: 'TD Sis', unit: 'mmHg' },
              { key: 'tekananDarahDiastolik', label: 'TD Dia', unit: 'mmHg' },
              { key: 'nadi', label: 'Nadi', unit: '/m' },
              { key: 'suhu', label: 'Suhu', unit: 'C' },
              { key: 'pernapasan', label: 'RR', unit: '/m' },
              { key: 'spo2', label: 'SpO2', unit: '%' },
            ].map((v) => (
              <div key={v.key}>
                <label className="text-[10px] text-slate-500">{v.label} ({v.unit})</label>
                <input type="number" value={(triaseForm as any)[v.key]}
                  onChange={(e) => setTriaseForm({ ...triaseForm, [v.key]: e.target.value })}
                  className="w-full px-2 py-1.5 glass-input text-sm" />
              </div>
            ))}
          </div>

          <FormField label="Keluhan Utama">
            <textarea value={triaseForm.keluhanUtama} onChange={(e) => setTriaseForm({ ...triaseForm, keluhanUtama: e.target.value })}
              className="w-full px-3 py-2 glass-input text-sm" rows={2} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Primary Survey (ABCDE)">
              <textarea value={triaseForm.primarySurvey} onChange={(e) => setTriaseForm({ ...triaseForm, primarySurvey: e.target.value })}
                className="w-full px-3 py-2 glass-input text-sm" rows={3} placeholder="Airway: clear&#10;Breathing: spontan, RR 20&#10;Circulation: nadi kuat&#10;Disability: GCS 15&#10;Exposure: -" />
            </FormField>
            <FormField label="Secondary Survey">
              <textarea value={triaseForm.secondarySurvey} onChange={(e) => setTriaseForm({ ...triaseForm, secondarySurvey: e.target.value })}
                className="w-full px-3 py-2 glass-input text-sm" rows={3} />
            </FormField>
          </div>
          <FormField label="Tindakan Awal">
            <textarea value={triaseForm.tindakanAwal} onChange={(e) => setTriaseForm({ ...triaseForm, tindakanAwal: e.target.value })}
              className="w-full px-3 py-2 glass-input text-sm" rows={2} />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
            <button onClick={() => setShowTriase(null)} className="px-4 py-2 text-sm glass-btn-outline rounded-xl">Batal</button>
            <button onClick={handleTriase} className="px-6 py-2 text-sm glass-btn">Simpan Triase</button>
          </div>
        </div>
      </Modal>

      {/* Disposisi Modal */}
      <Modal isOpen={!!showDisposisi} onClose={() => setShowDisposisi(null)}
        title={`Disposisi — ${showDisposisi?.patient?.namaLengkap || ''}`} size="md">
        <div className="space-y-3">
          <p className="text-sm text-slate-400 mb-4">Pilih tindak lanjut untuk pasien ini:</p>
          {[
            { key: 'PULANG', label: 'Pulang', desc: 'Atas persetujuan dokter', gradient: 'from-emerald-500 to-emerald-600' },
            { key: 'RAWAT_INAP', label: 'Rawat Inap', desc: 'Pindah ke bangsal', gradient: 'from-blue-500 to-blue-600' },
            { key: 'RUJUK', label: 'Rujuk', desc: 'Rujuk ke RS lain', gradient: 'from-amber-500 to-amber-600' },
            { key: 'PULANG_PAKSA', label: 'Pulang Paksa', desc: 'APS — Atas Permintaan Sendiri', gradient: 'from-orange-500 to-orange-600' },
            { key: 'DOA', label: 'DOA / Meninggal', desc: 'Dead on Arrival', gradient: 'from-red-600 to-red-700' },
          ].map((d) => (
            <button key={d.key} onClick={() => handleDisposisi(d.key)}
              className={`w-full text-left bg-gradient-to-r ${d.gradient} text-white rounded-xl p-4 hover:opacity-90 transition shadow-lg`}>
              <p className="font-semibold">{d.label}</p>
              <p className="text-xs opacity-80 mt-0.5">{d.desc}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
