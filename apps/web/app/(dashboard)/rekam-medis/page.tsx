'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  encounter: { icon: 'Kunjungan', color: 'var(--primary)' },
  diagnosis: { icon: 'Diagnosis', color: 'var(--amber)' },
  prescription: { icon: 'Resep', color: 'var(--teal)' },
  lab: { icon: 'Lab', color: 'var(--sky)' },
  radiology: { icon: 'Radiologi', color: 'var(--primary-soft)' },
  procedure: { icon: 'Tindakan', color: 'var(--rose)' },
  bill: { icon: 'Billing', color: 'var(--teal)' },
};

export default function RekamMedisPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const fetchPatients = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/patients/search', { params: { keyword, page, limit: 20 } });
      setPatients(res.data.data); setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [keyword]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const viewTimeline = async (patient: any) => {
    setSelectedPatient(patient);
    setTimelineLoading(true);
    try {
      const res = await apiClient.get(`/patients/${patient.id}/timeline`);
      setTimeline(res.data);
    } catch (e) { console.error(e); setTimeline([]); }
    setTimelineLoading(false);
  };

  const columns = [
    { key: 'noRm', label: 'No. RM', sortable: true, className: 'font-mono text-[var(--primary-soft)]' },
    { key: 'namaLengkap', label: 'Nama', sortable: true, render: (v: string) => <span className="font-medium" style={{ color: 'var(--text-1)' }}>{v}</span> },
    { key: 'nik', label: 'NIK', render: (v: string) => <span className="font-mono text-[12px]">{v || '-'}</span> },
    { key: 'jenisKelamin', label: 'L/P', render: (v: string) => <StatusBadge status={v === 'L' ? 'Laki-laki' : 'Perempuan'} variant={v === 'L' ? 'info' : 'warning'} /> },
    { key: 'tanggalLahir', label: 'Tgl Lahir', render: (v: string) => v ? formatDate(v) : '-' },
    { key: 'actions', label: '', render: (_: any, row: any) => (
      <button onClick={(e) => { e.stopPropagation(); viewTimeline(row); }} className="btn btn-primary btn-xs">Timeline</button>
    )},
  ];

  return (
    <div className="flex gap-6">
      {/* Left — Patient List */}
      <div className={`${selectedPatient ? 'flex-1' : 'w-full'} transition-all`}>
        <PageHeader title="Rekam Medis" description={`${meta.total} pasien — Klik untuk lihat timeline medis`} />
        <div className="mb-5"><SearchInput placeholder="Cari No.RM, NIK, nama, No.BPJS..." onSearch={setKeyword} /></div>
        <DataTable columns={columns} data={patients} isLoading={loading}
          totalPages={meta.totalPages} currentPage={meta.page}
          onPageChange={fetchPatients} onRowClick={viewTimeline} />
      </div>

      {/* Right — Patient Journey Timeline */}
      {selectedPatient && (
        <div className="w-[420px] flex-shrink-0">
          <div className="sticky top-0">
            <div className="card-flat p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>{selectedPatient.namaLengkap}</h3>
                  <p className="text-[12px] font-mono" style={{ color: 'var(--text-3)' }}>{selectedPatient.noRm}</p>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="btn btn-ghost btn-xs">Tutup</button>
              </div>
              <p className="overline mb-3">Patient Journey Timeline</p>

              {timelineLoading ? (
                <div className="py-12 text-center">
                  <div className="w-5 h-5 border-2 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mx-auto" />
                </div>
              ) : timeline.length === 0 ? (
                <p className="text-[13px] py-8 text-center" style={{ color: 'var(--text-3)' }}>Belum ada riwayat</p>
              ) : (
                <div className="space-y-0 max-h-[70vh] overflow-y-auto pr-1">
                  {timeline.map((event, idx) => {
                    const cfg = TYPE_ICONS[event.type] || { icon: event.type, color: 'var(--text-2)' };
                    return (
                      <div key={event.id} className="flex gap-3 relative">
                        {/* Timeline line */}
                        {idx < timeline.length - 1 && (
                          <div className="absolute left-[11px] top-[28px] w-[2px] h-[calc(100%)] rounded-full" style={{ background: 'var(--glass-border)' }} />
                        )}
                        {/* Dot */}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 z-10"
                          style={{ background: `${cfg.color}20`, border: `2px solid ${cfg.color}40` }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                        </div>
                        {/* Content */}
                        <div className="pb-4 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="badge badge-default text-[9px]">{cfg.icon}</span>
                            <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                              {new Date(event.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            {event.status && (
                              <StatusBadge status={event.status} variant={event.status === 'FINISHED' || event.status === 'COMPLETED' || event.status === 'CLOSED' || event.status === 'DISPENSED' ? 'success' : 'warning'} />
                            )}
                          </div>
                          <p className="text-[12px] font-medium mt-0.5" style={{ color: 'var(--text-1)' }}>{event.title}</p>
                          {event.subtitle && <p className="text-[11px] truncate" style={{ color: 'var(--text-2)' }}>{event.subtitle}</p>}
                          {event.detail && <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-3)' }}>{event.detail}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
