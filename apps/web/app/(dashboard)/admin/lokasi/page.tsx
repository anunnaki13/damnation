'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';

const TIPE_LOKASI = [
  'POLI', 'BANGSAL', 'IGD', 'OK', 'ICU', 'PERINATOLOGI',
  'LABORATORIUM', 'RADIOLOGI', 'FARMASI', 'GIZI', 'ADMIN', 'GUDANG', 'LAINNYA',
];

const TIPE_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
  POLI: 'info', BANGSAL: 'success', IGD: 'danger', OK: 'warning', ICU: 'danger',
};

export default function LokasiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterTipe, setFilterTipe] = useState('');
  const [form, setForm] = useState({ kode: '', nama: '', tipe: 'POLI', lantai: '', gedung: '', kapasitasBed: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/locations', { params: filterTipe ? { tipe: filterTipe } : {} });
      setData(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filterTipe]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/locations', form);
      setShowForm(false);
      setForm({ kode: '', nama: '', tipe: 'POLI', lantai: '', gedung: '', kapasitasBed: 0 });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const columns = [
    { key: 'kode', label: 'Kode', sortable: true, className: 'font-mono font-medium' },
    { key: 'nama', label: 'Nama Lokasi', sortable: true },
    { key: 'tipe', label: 'Tipe', render: (v: string) => (
      <StatusBadge status={v} variant={TIPE_VARIANT[v] || 'default'} />
    )},
    { key: 'lantai', label: 'Lantai', render: (v: string) => v || '-' },
    { key: 'gedung', label: 'Gedung', render: (v: string) => v || '-' },
    { key: 'kapasitasBed', label: 'Kapasitas Bed', render: (v: number) => v > 0 ? v : '-' },
  ];

  return (
    <div>
      <PageHeader
        title="Master Lokasi / Unit"
        description={`Total: ${data.length} lokasi aktif`}
        action={
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">
            + Tambah Lokasi
          </button>
        }
      />

      <div className="mb-4">
        <select value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Semua Tipe</option>
          {TIPE_LOKASI.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tambah Lokasi" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Kode Lokasi" required>
            <input type="text" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border rounded-lg text-sm" required placeholder="POLI-KULIT" />
          </FormField>
          <FormField label="Nama Lokasi" required>
            <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </FormField>
          <FormField label="Tipe" required>
            <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              {TIPE_LOKASI.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Lantai">
              <input type="text" value={form.lantai} onChange={(e) => setForm({ ...form, lantai: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </FormField>
            <FormField label="Gedung">
              <input type="text" value={form.gedung} onChange={(e) => setForm({ ...form, gedung: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </FormField>
          </div>
          <FormField label="Kapasitas Bed">
            <input type="number" value={form.kapasitasBed} onChange={(e) => setForm({ ...form, kapasitasBed: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg text-sm" min={0} />
          </FormField>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Batal</button>
            <button type="submit"
              className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
