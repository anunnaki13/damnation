'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

export default function LogistikPage() {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ kode: '', nama: '', kategori: 'ATK', satuan: '', stok: 0, stokMinimum: 5, hargaSatuan: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [res, st] = await Promise.all([apiClient.get('/logistics'), apiClient.get('/logistics/stats')]);
      setItems(res.data.data); setMeta(res.data.meta); setStats(st.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await apiClient.post('/logistics', form); setShowForm(false); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || 'Gagal simpan'); }
  };

  const columns = [
    { key: 'kode', label: 'Kode', className: 'font-mono text-[var(--primary-soft)]' },
    { key: 'nama', label: 'Nama Item', sortable: true },
    { key: 'kategori', label: 'Kategori', render: (v: string) => <StatusBadge status={v || '-'} variant="primary" /> },
    { key: 'satuan', label: 'Satuan' },
    { key: 'stok', label: 'Stok', render: (v: number, row: any) => (
      <span style={{ color: v <= row.stokMinimum ? 'var(--rose)' : 'var(--text-1)' }} className="font-semibold">{v}</span>
    )},
    { key: 'stokMinimum', label: 'Min', render: (v: number) => v },
  ];

  return (
    <div>
      <PageHeader title="Logistik & Inventaris" description={`${stats?.total || 0} item terdaftar`}
        action={<button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">+ Tambah Item</button>} />

      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="stat-card"><p className="stat-label">Total Item</p><p className="stat-value mt-2" style={{ color: 'var(--text-1)' }}>{stats.total}</p></div>
          <div className="stat-card" style={{ '--stat-color': 'var(--amber)' } as any}><p className="stat-label">Stok Rendah</p><p className="stat-value mt-2" style={{ color: 'var(--amber)' }}>{stats.lowStock}</p></div>
        </div>
      )}

      <DataTable columns={columns} data={items} isLoading={loading} totalPages={meta.totalPages} currentPage={meta.page} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tambah Item Inventaris" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Kode" required><input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} className="input" required /></FormField>
            <FormField label="Nama" required><input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="input" required /></FormField>
            <FormField label="Kategori"><select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="select">
              {['ATK', 'LINEN', 'ALKES', 'RT', 'LAINNYA'].map((k) => <option key={k} value={k}>{k}</option>)}
            </select></FormField>
            <FormField label="Satuan"><input value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} className="input" placeholder="pcs, box, rim" /></FormField>
            <FormField label="Stok Awal"><input type="number" value={form.stok} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} className="input" min={0} /></FormField>
            <FormField label="Stok Minimum"><input type="number" value={form.stokMinimum} onChange={(e) => setForm({ ...form, stokMinimum: Number(e.target.value) })} className="input" min={0} /></FormField>
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
