'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

type Tab = 'peserta' | 'sep' | 'logs';

export default function BpjsPage() {
  const [tab, setTab] = useState<Tab>('peserta');
  const [bpjsStatus, setBpjsStatus] = useState<any>(null);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Cek Peserta
  const [noBpjs, setNoBpjs] = useState('');
  const [pesertaResult, setPesertaResult] = useState<any>(null);
  const [pesertaError, setPesertaError] = useState('');

  // SEP
  const [showSepForm, setShowSepForm] = useState(false);

  useEffect(() => {
    apiClient.get('/bpjs/status').then((r) => setBpjsStatus(r.data)).catch(() => {});
  }, []);

  const cekPeserta = async () => {
    if (!noBpjs) return;
    setLoading(true);
    setPesertaError('');
    setPesertaResult(null);
    try {
      const res = await apiClient.get(`/bpjs/peserta/${noBpjs}`);
      setPesertaResult(res.data);
    } catch (err: any) {
      setPesertaError(err.response?.data?.message || 'Gagal cek peserta');
    }
    setLoading(false);
  };

  const fetchLogs = useCallback(async () => {
    try {
      const res = await apiClient.get('/bpjs/sync-logs', { params: { limit: 50 } });
      setSyncLogs(res.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (tab === 'logs') fetchLogs();
  }, [tab, fetchLogs]);

  const tabs = [
    { key: 'peserta', label: 'Cek Peserta' },
    { key: 'sep', label: 'SEP' },
    { key: 'logs', label: 'Sync Log' },
  ];

  return (
    <div>
      <PageHeader title="Bridging BPJS Kesehatan" description="VClaim, SEP, Antrol, Aplicares" />

      {/* Status Card */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${bpjsStatus?.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <p className="text-white font-medium">
                {bpjsStatus?.configured ? 'BPJS API Terhubung' : 'Mode Simulasi — Credentials Belum Dikonfigurasi'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                VClaim: {bpjsStatus?.services?.vclaim?.url || '-'}
              </p>
            </div>
          </div>
          <StatusBadge status={bpjsStatus?.configured ? 'CONNECTED' : 'SIMULATION'}
            variant={bpjsStatus?.configured ? 'success' : 'warning'} />
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'VClaim', desc: 'Peserta, Rujukan, SEP', gradient: 'from-blue-500/20' },
          { label: 'Antrol', desc: 'Antrean Mobile JKN', gradient: 'from-emerald-500/20' },
          { label: 'Aplicares', desc: 'Ketersediaan Bed', gradient: 'from-purple-500/20' },
          { label: 'INA-CBGs', desc: 'Grouper Klaim', gradient: 'from-amber-500/20' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} to-transparent opacity-40`} />
            <div className="relative">
              <p className="text-white font-semibold">{s.label}</p>
              <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-white/[0.06]">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as Tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      {tab === 'peserta' && (
        <div>
          <div className="glass-card p-6 mb-4">
            <h3 className="text-white font-medium mb-4">Cek Kepesertaan BPJS</h3>
            <div className="flex gap-3">
              <input type="text" value={noBpjs} onChange={(e) => setNoBpjs(e.target.value)}
                className="flex-1 px-4 py-2.5 glass-input text-sm" placeholder="Masukkan No. Kartu BPJS (13 digit)"
                maxLength={13} onKeyDown={(e) => e.key === 'Enter' && cekPeserta()} />
              <button onClick={cekPeserta} disabled={loading || !noBpjs}
                className="px-6 py-2.5 glass-btn text-sm disabled:opacity-50">
                {loading ? 'Mencari...' : 'Cek Peserta'}
              </button>
            </div>
          </div>

          {pesertaError && (
            <div className="glass-card p-4 border-red-500/20 bg-red-500/5 mb-4">
              <p className="text-red-400 text-sm">{pesertaError}</p>
            </div>
          )}

          {pesertaResult?.response?.peserta && (
            <div className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Data Peserta BPJS</h3>
                <StatusBadge
                  status={pesertaResult.response.peserta.statusPeserta?.keterangan || 'AKTIF'}
                  variant={pesertaResult.response.peserta.statusPeserta?.kode === '0' ? 'success' : 'danger'}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Nama', value: pesertaResult.response.peserta.nama },
                  { label: 'No. Kartu', value: pesertaResult.response.peserta.noKartu },
                  { label: 'Tgl Lahir', value: pesertaResult.response.peserta.tglLahir },
                  { label: 'Jenis Kelamin', value: pesertaResult.response.peserta.kelamin === 'L' ? 'Laki-laki' : 'Perempuan' },
                  { label: 'Jenis Peserta', value: pesertaResult.response.peserta.jnsPeserta?.nama },
                  { label: 'Hak Kelas', value: `Kelas ${pesertaResult.response.peserta.hakKelas?.kode}` },
                  { label: 'FKTP', value: pesertaResult.response.peserta.provUmum?.nmProvider },
                  { label: 'Kode FKTP', value: pesertaResult.response.peserta.provUmum?.kdProvider },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-slate-500">{f.label}</p>
                    <p className="text-white text-sm mt-0.5">{f.value || '-'}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setShowSepForm(true)}
                  className="px-4 py-2 glass-btn text-sm">Buat SEP</button>
                <button onClick={async () => {
                  try {
                    const res = await apiClient.get(`/bpjs/rujukan/peserta/${noBpjs}`);
                    alert(JSON.stringify(res.data?.response || res.data, null, 2));
                  } catch (err: any) { alert(err.response?.data?.message || 'Gagal cek rujukan'); }
                }} className="btn btn-ghost btn-sm">
                  Cek Rujukan
                </button>
              </div>
            </div>
          )}

          {pesertaResult && !pesertaResult.response?.peserta && (
            <div className="glass-card p-6">
              <p className="text-slate-400 text-sm">
                {pesertaResult.metaData?.message || 'Tidak ada data peserta'}
              </p>
              {pesertaResult.response && (
                <pre className="mt-3 text-xs text-slate-500 bg-[rgba(255,255,255,0.03)] rounded-lg p-3 overflow-auto max-h-60">
                  {JSON.stringify(pesertaResult.response, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'sep' && (
        <div className="glass-card p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-white font-medium">Penerbitan SEP</p>
          <p className="text-sm text-slate-500 mt-2">SEP otomatis diterbitkan saat registrasi pasien BPJS.<br/>Cek peserta terlebih dahulu di tab "Cek Peserta".</p>
          <p className="text-xs text-slate-600 mt-4">Alur: Cek Peserta → Cek Rujukan → Buat SEP → Auto simpan ke bridging_sep</p>
        </div>
      )}

      {tab === 'logs' && (
        <div className="space-y-2">
          {syncLogs.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500">Belum ada log API BPJS</div>
          ) : (
            syncLogs.map((log) => (
              <div key={log.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={log.service} variant="info" />
                    <StatusBadge status={log.method} variant="default" />
                    <span className="text-xs text-slate-400 font-mono">{log.endpoint}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={log.status}
                      variant={log.status === 'SUCCESS' ? 'success' : 'danger'} />
                    <span className="text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                {log.errorMessage && (
                  <p className="text-xs text-red-400 mt-2">{log.errorMessage}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
