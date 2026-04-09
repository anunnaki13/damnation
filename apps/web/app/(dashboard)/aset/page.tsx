'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

const KONDISI_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  BAIK: 'success', RUSAK_RINGAN: 'warning', RUSAK_BERAT: 'danger', DIHAPUSKAN: 'default',
};

export default function AsetPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ kodeAset: '', nama: '', kategori: 'ALAT_MEDIS', merk: '', lokasi: '', kondisi: 'BAIK', hargaPerolehan: 0 });

  useEffect(() => {
    apiClient.get('/assets/stats').then((r) => setStats(r.data)).catch(() => {});
    apiClient.get('/assets').then((r) => { setAssets(r.data.data); setMeta(r.data.meta); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/assets', form);
      setShowForm(false);
      const res = await apiClient.get('/assets');
      setAssets(res.data.data); setMeta(res.data.meta);
      apiClient.get('/assets/stats').then((r) => setStats(r.data));
    } catch (err: any) { alert(err.response?.data?.message || 'Gagal simpan'); }
  };

  const columns = [
    { key: 'kodeAset', label: 'Kode', className: 'font-mono text-[var(--primary-soft)]' },
    { key: 'nama', label: 'Nama Aset', sortable: true },
    { key: 'kategori', label: 'Kategori', render: (v: string) => <StatusBadge status={v?.replace('_', ' ') || '-'} variant="primary" /> },
    { key: 'merk', label: 'Merk', render: (v: string) => v || '-' },
    { key: 'lokasi', label: 'Lokasi', render: (v: string) => v || '-' },
    { key: 'kondisi', label: 'Kondisi', render: (v: string) => <StatusBadge status={v?.replace('_', ' ') || '-'} variant={KONDISI_VARIANT[v] || 'default'} /> },
  ];

  return (
    <div>
      <PageHeader title="Manajemen Aset" description={`${stats?.total || 0} aset terdaftar`}
        action={<button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">+ Tambah Aset</button>} />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Aset', value: stats.total, color: 'var(--text-1)' },
            { label: 'Kondisi Baik', value: stats.baik, color: 'var(--teal)' },
            { label: 'Rusak', value: stats.rusak, color: 'var(--amber)' },
            { label: 'Dihapuskan', value: stats.dihapuskan, color: 'var(--rose)' },
          ].map((s) => (
            <div key={s.label} className="stat-card" style={{ '--stat-color': s.color } as any}>
              <p className="stat-label">{s.label}</p>
              <p className="stat-value mt-2" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <DataTable columns={columns} data={assets} isLoading={loading} totalPages={meta.totalPages} currentPage={meta.page} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tambah Aset" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Kode Aset" required><input value={form.kodeAset} onChange={(e) => setForm({ ...form, kodeAset: e.target.value })} className="input" required /></FormField>
            <FormField label="Nama" required><input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="input" required /></FormField>
            <FormField label="Kategori"><select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="select">
              {['ALAT_MEDIS', 'KENDARAAN', 'BANGUNAN', 'MEUBELAIR', 'KOMPUTER', 'LAINNYA'].map((k) => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
            </select></FormField>
            <FormField label="Kondisi"><select value={form.kondisi} onChange={(e) => setForm({ ...form, kondisi: e.target.value })} className="select">
              {['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT'].map((k) => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
            </select></FormField>
            <FormField label="Merk"><input value={form.merk} onChange={(e) => setForm({ ...form, merk: e.target.value })} className="input" /></FormField>
            <FormField label="Lokasi"><input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} className="input" /></FormField>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--glass-border)]">
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">Batal</button>
            <button type="submit" className="btn btn-primary btn-sm">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
