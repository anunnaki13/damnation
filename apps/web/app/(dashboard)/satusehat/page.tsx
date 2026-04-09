'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

export default function SatusehatPage() {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        apiClient.get('/satusehat/stats'),
        apiClient.get('/satusehat/logs', { params: { status: filterStatus || undefined, limit: 50 } }),
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const [retrying, setRetrying] = useState(false);
  const handleRetryFailed = async () => {
    setRetrying(true);
    try {
      const res = await apiClient.post('/satusehat/retry-failed');
      alert(`${res.data.message}\n\nSuccess: ${res.data.success}\nFailed: ${res.data.failed}`);
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || 'Retry gagal'); }
    setRetrying(false);
  };

  return (
    <div>
      <PageHeader title="Integrasi SATUSEHAT" description="Monitor sinkronisasi HL7 FHIR R4 ke SATUSEHAT Kemenkes"
        action={
          <div className="flex gap-2">
            {(stats?.failed > 0 || stats?.unsyncedEncounters > 0) && (
              <button onClick={handleRetryFailed} disabled={retrying} className="btn btn-danger btn-sm">
                {retrying ? 'Retrying...' : `Retry Failed (${(stats?.failed || 0) + (stats?.unsyncedEncounters || 0)})`}
              </button>
            )}
          </div>
        }
      />

      {/* Connection Status */}
      <div className="glass-card-static p-6 mb-6 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${stats?.configured ? 'from-emerald-500/[0.06]' : 'from-amber-500/[0.06]'} to-transparent`} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stats?.configured ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
              <svg className={`w-6 h-6 ${stats?.configured ? 'text-emerald-400' : 'text-amber-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold">
                {stats?.configured ? 'SATUSEHAT API Terhubung' : 'Mode Simulasi — Credentials Belum Dikonfigurasi'}
              </p>
              <p className="text-xs text-slate-500 mt-1">FHIR R4 Implementation Guide — SATUSEHAT Kemenkes RI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`dot-pulse ${stats?.configured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <StatusBadge status={stats?.configured ? 'CONNECTED' : 'SIMULATION'}
              variant={stats?.configured ? 'success' : 'warning'} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Sync', value: stats.total, text: 'text-white', icon: '↗' },
            { label: 'Success', value: stats.success, text: 'text-emerald-400', icon: '✓' },
            { label: 'Failed', value: stats.failed, text: 'text-red-400', icon: '✗' },
            { label: 'Pending', value: stats.pending, text: 'text-amber-400', icon: '◷' },
            { label: 'Belum Sync', value: stats.unsyncedEncounters, text: 'text-indigo-400', icon: '⟳' },
          ].map((s) => (
            <div key={s.label} className="glass-card-static p-4 text-center">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`text-3xl font-bold ${s.text} mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* FHIR Resources info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { resource: 'Encounter', desc: 'Kunjungan pasien', color: 'indigo' },
          { resource: 'Condition', desc: 'Diagnosis ICD-10', color: 'cyan' },
          { resource: 'Observation', desc: 'Tanda vital (LOINC)', color: 'emerald' },
          { resource: 'Composition', desc: 'Resume medis', color: 'purple' },
        ].map((r) => (
          <div key={r.resource} className={`glass-card-static p-4 border-l-2 border-${r.color}-500/30`}>
            <p className={`text-${r.color}-400 font-semibold text-sm`}>{r.resource}</p>
            <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Filter & Logs */}
      <div className="flex gap-2 mb-4">
        {[{ key: '', label: 'Semua' }, { key: 'SUCCESS', label: 'Success' }, { key: 'FAILED', label: 'Failed' }].map((f) => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 text-sm rounded-xl ${filterStatus === f.key ? 'glass-btn' : 'glass-btn-outline'}`}>{f.label}</button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="glass-card-static p-12 text-center"><div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" /></div>
        ) : logs.length === 0 ? (
          <div className="glass-card-static p-12 text-center text-slate-500">Belum ada log sinkronisasi</div>
        ) : logs.map((log) => (
          <div key={log.id} className="glass-card-static p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={log.resourceType} variant="info" />
                <StatusBadge status={log.action} variant="default" />
                <span className="text-xs text-slate-400 font-mono">ID: {log.localId}</span>
                {log.satusehatId && <span className="text-xs text-slate-500">→ {log.satusehatId.substring(0, 20)}...</span>}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={log.status} variant={log.status === 'SUCCESS' ? 'success' : log.status === 'FAILED' ? 'danger' : 'warning'} />
                <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('id-ID')}</span>
              </div>
            </div>
            {log.errorMessage && <p className="text-xs text-red-400 mt-2">{log.errorMessage}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
