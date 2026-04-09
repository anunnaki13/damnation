'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency } from '@/lib/utils';

const KATEGORI = ['OBAT', 'ALKES', 'BHP', 'LAINNYA'];
const GOLONGAN = ['BEBAS', 'BEBAS_TERBATAS', 'KERAS', 'NARKOTIKA', 'PSIKOTROPIKA'];
const GOLONGAN_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  BEBAS: 'success', BEBAS_TERBATAS: 'info', KERAS: 'warning', NARKOTIKA: 'danger', PSIKOTROPIKA: 'danger',
};

export default function ObatPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    kode: '', namaGenerik: '', namaDagang: '', satuan: '', kategori: 'OBAT',
    golongan: '', hargaBeli: 0, hargaJual: 0, stokMinimum: 10, isFormularium: true,
  });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/medicines', { params: { keyword, page, limit: 20 } });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [keyword]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/medicines', { ...form, golongan: form.golongan || undefined });
      setShowForm(false);
      setForm({ kode: '', namaGenerik: '', namaDagang: '', satuan: '', kategori: 'OBAT',
        golongan: '', hargaBeli: 0, hargaJual: 0, stokMinimum: 10, isFormularium: true });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const columns = [
    { key: 'kode', label: 'Kode', sortable: true, className: 'font-mono' },
    { key: 'namaGenerik', label: 'Nama Generik', sortable: true },
    { key: 'namaDagang', label: 'Nama Dagang', render: (v: string) => v || '-' },
    { key: 'kategori', label: 'Kategori', render: (v: string) => (
      <StatusBadge status={v} variant="info" />
    )},
    { key: 'golongan', label: 'Golongan', render: (v: string) => v ? (
      <StatusBadge status={v.replace('_', ' ')} variant={GOLONGAN_VARIANT[v] || 'default'} />
    ) : '-' },
    { key: 'satuan', label: 'Satuan' },
    { key: 'hargaJual', label: 'Harga Jual', render: (v: number) => formatCurrency(v), className: 'text-right' },
    { key: 'isFormularium', label: 'Formularium', render: (v: boolean) => (
      <StatusBadge status={v ? 'Ya' : 'Tidak'} variant={v ? 'success' : 'default'} />
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Master Obat & Alkes"
        description={`Total: ${meta.total} item`}
        action={
          <button onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm">
            + Tambah Obat
          </button>
        }
      />

      <div className="mb-4">
        <SearchInput placeholder="Cari kode, nama generik, nama dagang..." onSearch={setKeyword} />
      </div>

      <DataTable columns={columns} data={data} isLoading={loading}
        totalPages={meta.totalPages} currentPage={meta.page} onPageChange={fetchData} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tambah Obat/Alkes" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Kode Obat" required>
              <input type="text" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                className="input" required placeholder="OBT-001" />
            </FormField>
            <FormField label="Satuan" required>
              <input type="text" value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                className="input" required placeholder="tablet" />
            </FormField>
            <FormField label="Nama Generik" required>
              <input type="text" value={form.namaGenerik} onChange={(e) => setForm({ ...form, namaGenerik: e.target.value })}
                className="input" required />
            </FormField>
            <FormField label="Nama Dagang">
              <input type="text" value={form.namaDagang} onChange={(e) => setForm({ ...form, namaDagang: e.target.value })}
                className="input" />
            </FormField>
            <FormField label="Kategori">
              <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="input">
                {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </FormField>
            <FormField label="Golongan">
              <select value={form.golongan} onChange={(e) => setForm({ ...form, golongan: e.target.value })}
                className="input">
                <option value="">-- Pilih --</option>
                {GOLONGAN.map((g) => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
              </select>
            </FormField>
            <FormField label="Harga Beli (Rp)">
              <input type="number" value={form.hargaBeli} onChange={(e) => setForm({ ...form, hargaBeli: Number(e.target.value) })}
                className="input" min={0} />
            </FormField>
            <FormField label="Harga Jual (Rp)">
              <input type="number" value={form.hargaJual} onChange={(e) => setForm({ ...form, hargaJual: Number(e.target.value) })}
                className="input" min={0} />
            </FormField>
            <FormField label="Stok Minimum">
              <input type="number" value={form.stokMinimum} onChange={(e) => setForm({ ...form, stokMinimum: Number(e.target.value) })}
                className="input" min={0} />
            </FormField>
            <FormField label="Formularium RS">
              <select value={form.isFormularium ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, isFormularium: e.target.value === 'true' })}
                className="input">
                <option value="true">Ya</option>
                <option value="false">Tidak</option>
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowForm(false)}
              className="btn btn-ghost btn-sm">Batal</button>
            <button type="submit"
              className="btn btn-primary btn-sm">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
