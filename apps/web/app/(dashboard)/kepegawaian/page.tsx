'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';

export default function KepegawaianPage() {
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/practitioners', { params: { page, limit: 50 } });
      setPractitioners(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const NAKES: Record<string, string> = {
    DOKTER_UMUM: 'Dokter Umum', DOKTER_SPESIALIS: 'Dokter Spesialis', DOKTER_GIGI: 'Dokter Gigi',
    PERAWAT: 'Perawat', BIDAN: 'Bidan', APOTEKER: 'Apoteker', NUTRISIONIS: 'Nutrisionis',
    RADIOGRAFER: 'Radiografer', ANALIS_LAB: 'Analis Lab', FISIOTERAPIS: 'Fisioterapis',
  };

  const columns = [
    { key: 'namaLengkap', label: 'Nama', sortable: true, render: (v: string) => <span className="font-medium" style={{ color: 'var(--text-1)' }}>{v}</span> },
    { key: 'jenisNakes', label: 'Jenis', render: (v: string) => <StatusBadge status={NAKES[v] || v} variant="primary" /> },
    { key: 'spesialisasi', label: 'Spesialisasi', render: (v: string) => v || '-' },
    { key: 'nip', label: 'NIP', render: (v: string) => v ? <span className="font-mono text-[12px]">{v}</span> : '-' },
    { key: 'sipNumber', label: 'No. SIP', render: (v: string) => v ? <span className="text-[12px]">{v}</span> : '-' },
    { key: 'isActive', label: 'Status', render: (v: boolean) => <StatusBadge status={v ? 'Aktif' : 'Nonaktif'} variant={v ? 'success' : 'default'} /> },
  ];

  return (
    <div>
      <PageHeader title="Kepegawaian / SDM" description={`${meta.total} tenaga kesehatan terdaftar`} />

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total SDM', value: meta.total },
          { label: 'Dokter', value: practitioners.filter((p) => p.jenisNakes?.includes('DOKTER')).length },
          { label: 'Perawat', value: practitioners.filter((p) => p.jenisNakes === 'PERAWAT').length },
          { label: 'Lainnya', value: practitioners.filter((p) => !p.jenisNakes?.includes('DOKTER') && p.jenisNakes !== 'PERAWAT').length },
        ].map((s) => (
          <div key={s.label} className="card-flat p-4 text-center">
            <p className="stat-value" style={{ color: 'var(--text-1)' }}>{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={practitioners} isLoading={loading}
        totalPages={meta.totalPages} currentPage={meta.page} onPageChange={fetchData} />
    </div>
  );
}
