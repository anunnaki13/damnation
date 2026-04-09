'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';

export default function RekamMedisPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [encounters, setEncounters] = useState<any[]>([]);

  const fetchPatients = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/patients/search', { params: { keyword, page, limit: 20 } });
      setPatients(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [keyword]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const viewHistory = async (patient: any) => {
    setSelectedPatient(patient);
    try {
      const res = await apiClient.get(`/patients/${patient.id}`);
      setEncounters(res.data.encounters || []);
    } catch (e) { console.error(e); }
  };

  const columns = [
    { key: 'noRm', label: 'No. RM', sortable: true, className: 'font-mono text-[var(--primary-soft)]' },
    { key: 'namaLengkap', label: 'Nama Pasien', sortable: true, render: (v: string) => <span className="font-medium" style={{ color: 'var(--text-1)' }}>{v}</span> },
    { key: 'nik', label: 'NIK', render: (v: string) => <span className="font-mono text-[12px]">{v || '-'}</span> },
    { key: 'jenisKelamin', label: 'L/P', render: (v: string) => <StatusBadge status={v === 'L' ? 'Laki-laki' : 'Perempuan'} variant={v === 'L' ? 'info' : 'warning'} /> },
    { key: 'tanggalLahir', label: 'Tgl Lahir', render: (v: string) => v ? formatDate(v) : '-' },
    { key: 'noBpjs', label: 'No. BPJS', render: (v: string) => v ? <span className="font-mono text-[12px]">{v}</span> : '-' },
    { key: 'actions', label: '', render: (_: any, row: any) => (
      <button onClick={(e) => { e.stopPropagation(); viewHistory(row); }} className="btn btn-ghost btn-xs">Riwayat</button>
    )},
  ];

  return (
    <div>
      <PageHeader title="Rekam Medis" description={`${meta.total} pasien terdaftar — Cari dan lihat riwayat medis`} />

      <div className="mb-5">
        <SearchInput placeholder="Cari No.RM, NIK, nama, No.BPJS..." onSearch={setKeyword} />
      </div>

      <DataTable columns={columns} data={patients} isLoading={loading}
        totalPages={meta.totalPages} currentPage={meta.page}
        onPageChange={fetchPatients} onRowClick={viewHistory} />

      {/* Patient History Panel */}
      {selectedPatient && (
        <div className="fixed inset-y-0 right-0 w-[480px] z-40 border-l flex flex-col"
          style={{ background: 'rgba(9,9,15,0.95)', backdropFilter: 'blur(32px)', borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <div>
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>{selectedPatient.namaLengkap}</h3>
              <p className="text-[12px] font-mono" style={{ color: 'var(--text-3)' }}>{selectedPatient.noRm}</p>
            </div>
            <button onClick={() => setSelectedPatient(null)} className="btn btn-ghost btn-xs">Tutup</button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <p className="overline mb-2">Riwayat Kunjungan</p>
            {encounters.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Belum ada riwayat kunjungan</p>
            ) : encounters.map((enc: any) => (
              <div key={enc.id} className="card-flat p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[12px]" style={{ color: 'var(--primary-soft)' }}>{enc.noRawat}</span>
                  <StatusBadge status={enc.status} variant={enc.status === 'FINISHED' ? 'success' : 'warning'} />
                </div>
                <p className="text-[12px]" style={{ color: 'var(--text-2)' }}>
                  {enc.tanggalMasuk ? formatDate(enc.tanggalMasuk) : '-'} — {enc.tipe}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
