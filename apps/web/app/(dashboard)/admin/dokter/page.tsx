'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';

const JENIS_NAKES = [
  'DOKTER_UMUM', 'DOKTER_SPESIALIS', 'DOKTER_GIGI', 'PERAWAT', 'BIDAN',
  'APOTEKER', 'NUTRISIONIS', 'RADIOGRAFER', 'ANALIS_LAB', 'FISIOTERAPIS', 'LAINNYA',
];

const NAKES_LABELS: Record<string, string> = {
  DOKTER_UMUM: 'Dokter Umum', DOKTER_SPESIALIS: 'Dokter Spesialis', DOKTER_GIGI: 'Dokter Gigi',
  PERAWAT: 'Perawat', BIDAN: 'Bidan', APOTEKER: 'Apoteker', NUTRISIONIS: 'Nutrisionis',
  RADIOGRAFER: 'Radiografer', ANALIS_LAB: 'Analis Lab', FISIOTERAPIS: 'Fisioterapis', LAINNYA: 'Lainnya',
};

export default function DokterPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    namaLengkap: '', nip: '', nik: '', sipNumber: '', strNumber: '',
    gelarDepan: '', gelarBelakang: '', jenisKelamin: 'L',
    spesialisasi: '', jenisNakes: 'DOKTER_UMUM', noHp: '', email: '',
  });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/practitioners', { params: { page, limit: 20 } });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/practitioners', form);
      setShowForm(false);
      setForm({ namaLengkap: '', nip: '', nik: '', sipNumber: '', strNumber: '',
        gelarDepan: '', gelarBelakang: '', jenisKelamin: 'L',
        spesialisasi: '', jenisNakes: 'DOKTER_UMUM', noHp: '', email: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const columns = [
    { key: 'namaLengkap', label: 'Nama Lengkap', sortable: true },
    { key: 'jenisNakes', label: 'Jenis Nakes', render: (v: string) => (
      <StatusBadge status={NAKES_LABELS[v] || v} variant="info" />
    )},
    { key: 'spesialisasi', label: 'Spesialisasi', render: (v: string) => v || '-' },
    { key: 'sipNumber', label: 'No. SIP', render: (v: string) => v || '-' },
    { key: 'nip', label: 'NIP', render: (v: string) => v || '-' },
    { key: 'noHp', label: 'No. HP', render: (v: string) => v || '-' },
  ];

  return (
    <div>
      <PageHeader
        title="Master Dokter & Nakes"
        description={`Total: ${meta.total} tenaga kesehatan`}
        action={
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">
            + Tambah Nakes
          </button>
        }
      />

      <DataTable columns={columns} data={data} isLoading={loading}
        totalPages={meta.totalPages} currentPage={meta.page} onPageChange={fetchData} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tambah Dokter/Nakes" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nama Lengkap" required>
              <input type="text" value={form.namaLengkap} onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </FormField>
            <FormField label="Jenis Nakes" required>
              <select value={form.jenisNakes} onChange={(e) => setForm({ ...form, jenisNakes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                {JENIS_NAKES.map((j) => <option key={j} value={j}>{NAKES_LABELS[j]}</option>)}
              </select>
            </FormField>
            <FormField label="Jenis Kelamin" required>
              <select value={form.jenisKelamin} onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </FormField>
            <FormField label="Spesialisasi">
              <input type="text" value={form.spesialisasi} onChange={(e) => setForm({ ...form, spesialisasi: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </FormField>
            <FormField label="NIP">
              <input type="text" value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </FormField>
            <FormField label="No. SIP">
              <input type="text" value={form.sipNumber} onChange={(e) => setForm({ ...form, sipNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </FormField>
            <FormField label="No. STR">
              <input type="text" value={form.strNumber} onChange={(e) => setForm({ ...form, strNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </FormField>
            <FormField label="No. HP">
              <input type="text" value={form.noHp} onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </FormField>
          </div>
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
