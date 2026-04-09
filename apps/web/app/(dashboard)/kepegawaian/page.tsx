'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';

export default function KepegawaianPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [empRes, statsRes] = await Promise.all([
        apiClient.get('/hr/employees', { params: { page } }),
        apiClient.get('/hr/stats'),
      ]);
      setEmployees(empRes.data.data);
      setMeta(empRes.data.meta);
      setStats(statsRes.data);
    } catch (e) {
      // Fallback ke practitioners jika HR module belum ready
      try {
        const res = await apiClient.get('/practitioners', { params: { page, limit: 20 } });
        setEmployees(res.data.data);
        setMeta(res.data.meta);
        setStats({ total: res.data.meta.total, aktif: res.data.meta.total, pns: 0, kontrak: 0, honorer: 0 });
      } catch (e2) { console.error(e2); }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const NAKES: Record<string, string> = {
    DOKTER_UMUM: 'Dokter Umum', DOKTER_SPESIALIS: 'Spesialis', DOKTER_GIGI: 'Dokter Gigi',
    PERAWAT: 'Perawat', BIDAN: 'Bidan', APOTEKER: 'Apoteker',
  };

  const columns = [
    { key: 'namaLengkap', label: 'Nama', sortable: true, render: (v: string) => <span className="font-medium" style={{ color: 'var(--text-1)' }}>{v}</span> },
    { key: 'nip', label: 'NIP', render: (v: string) => v ? <span className="font-mono text-[12px]">{v}</span> : '-' },
    { key: 'jabatan', label: 'Jabatan', render: (v: string, row: any) => v || row.jenisNakes ? NAKES[row.jenisNakes] || row.jenisNakes : '-' },
    { key: 'departemen', label: 'Unit', render: (v: string, row: any) => v || row.spesialisasi || '-' },
    { key: 'statusPegawai', label: 'Status', render: (v: string, row: any) => {
      const s = v || (row.isActive ? 'AKTIF' : 'NONAKTIF');
      return <StatusBadge status={s} variant={s === 'PNS' ? 'success' : s === 'KONTRAK' ? 'warning' : 'default'} />;
    }},
    { key: 'isActive', label: '', render: (v: boolean) => <StatusBadge status={v !== false ? 'Aktif' : 'Nonaktif'} variant={v !== false ? 'success' : 'default'} /> },
  ];

  return (
    <div>
      <PageHeader title="Kepegawaian / SDM" description={`${stats?.total || meta.total} pegawai terdaftar`} />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'var(--text-1)' },
            { label: 'Aktif', value: stats.aktif, color: 'var(--teal)' },
            { label: 'PNS', value: stats.pns, color: 'var(--primary-soft)' },
            { label: 'Kontrak', value: stats.kontrak, color: 'var(--amber)' },
            { label: 'Honorer', value: stats.honorer, color: 'var(--text-2)' },
          ].map((s) => (
            <div key={s.label} className="card-flat p-4 text-center">
              <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <DataTable columns={columns} data={employees} isLoading={loading}
        totalPages={meta.totalPages} currentPage={meta.page} onPageChange={fetchData} />
    </div>
  );
}
