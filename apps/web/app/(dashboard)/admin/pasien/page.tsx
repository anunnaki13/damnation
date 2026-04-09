'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';

export default function PasienPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    namaLengkap: '', nik: '', noBpjs: '', tempatLahir: '', tanggalLahir: '',
    jenisKelamin: 'L', agama: '', pekerjaan: '', alamat: '', noHp: '', email: '',
    namaIbu: '', namaPj: '', hubunganPj: '', telpPj: '',
  });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/patients/search', { params: { keyword, page, limit: 20 } });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [keyword]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiClient.patch(`/patients/${editing.id}`, form);
      } else {
        await apiClient.post('/patients', form);
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      fetchData(meta.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({
      namaLengkap: row.namaLengkap || '', nik: row.nik || '', noBpjs: row.noBpjs || '',
      tempatLahir: row.tempatLahir || '',
      tanggalLahir: row.tanggalLahir ? row.tanggalLahir.slice(0, 10) : '',
      jenisKelamin: row.jenisKelamin || 'L', agama: row.agama || '',
      pekerjaan: row.pekerjaan || '', alamat: row.alamat || '',
      noHp: row.noHp || '', email: row.email || '', namaIbu: row.namaIbu || '',
      namaPj: row.namaPj || '', hubunganPj: row.hubunganPj || '', telpPj: row.telpPj || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      namaLengkap: '', nik: '', noBpjs: '', tempatLahir: '', tanggalLahir: '',
      jenisKelamin: 'L', agama: '', pekerjaan: '', alamat: '', noHp: '', email: '',
      namaIbu: '', namaPj: '', hubunganPj: '', telpPj: '',
    });
  };

  const columns = [
    { key: 'noRm', label: 'No. RM', sortable: true, className: 'font-mono font-medium text-primary-600' },
    { key: 'namaLengkap', label: 'Nama Lengkap', sortable: true },
    { key: 'nik', label: 'NIK', render: (v: string) => v || '-' },
    { key: 'jenisKelamin', label: 'L/P', render: (v: string) => (
      <StatusBadge status={v === 'L' ? 'Laki-laki' : 'Perempuan'} variant={v === 'L' ? 'info' : 'warning'} />
    )},
    { key: 'tanggalLahir', label: 'Tgl Lahir', render: (v: string) => v ? formatDate(v) : '-' },
    { key: 'noHp', label: 'No. HP', render: (v: string) => v || '-' },
    { key: 'noBpjs', label: 'No. BPJS', render: (v: string) => v || '-' },
    { key: 'actions', label: '', render: (_: any, row: any) => (
      <button onClick={(e) => { e.stopPropagation(); openEdit(row); }}
        className="text-xs text-primary-600 hover:underline">Edit</button>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Master Pasien"
        description={`Total: ${meta.total} pasien terdaftar`}
        action={
          <button
            onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}
            className="btn btn-primary btn-sm"
          >
            + Pasien Baru
          </button>
        }
      />

      <div className="mb-4">
        <SearchInput
          placeholder="Cari No.RM, NIK, nama, No.BPJS, No.HP..."
          onSearch={setKeyword}
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        totalPages={meta.totalPages}
        currentPage={meta.page}
        onPageChange={fetchData}
        onRowClick={openEdit}
        emptyMessage="Belum ada data pasien"
      />

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Edit Pasien' : 'Registrasi Pasien Baru'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nama Lengkap" required>
              <input type="text" value={form.namaLengkap} onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
                className="input" required />
            </FormField>
            <FormField label="NIK">
              <input type="text" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })}
                className="input" maxLength={16} />
            </FormField>
            <FormField label="No. BPJS">
              <input type="text" value={form.noBpjs} onChange={(e) => setForm({ ...form, noBpjs: e.target.value })}
                className="input" maxLength={13} />
            </FormField>
            <FormField label="Jenis Kelamin" required>
              <select value={form.jenisKelamin} onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value })}
                className="input">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </FormField>
            <FormField label="Tempat Lahir">
              <input type="text" value={form.tempatLahir} onChange={(e) => setForm({ ...form, tempatLahir: e.target.value })}
                className="input" />
            </FormField>
            <FormField label="Tanggal Lahir" required>
              <input type="date" value={form.tanggalLahir} onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
                className="input" required />
            </FormField>
            <FormField label="Agama">
              <select value={form.agama} onChange={(e) => setForm({ ...form, agama: e.target.value })}
                className="input">
                <option value="">-- Pilih --</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </FormField>
            <FormField label="Pekerjaan">
              <input type="text" value={form.pekerjaan} onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })}
                className="input" />
            </FormField>
            <FormField label="No. HP">
              <input type="text" value={form.noHp} onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                className="input" />
            </FormField>
            <FormField label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input" />
            </FormField>
          </div>

          <FormField label="Alamat">
            <textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="input" rows={2} />
          </FormField>

          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium text-[var(--text-1)] mb-3">Data Tambahan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nama Ibu Kandung">
                <input type="text" value={form.namaIbu} onChange={(e) => setForm({ ...form, namaIbu: e.target.value })}
                  className="input" />
              </FormField>
              <FormField label="Penanggung Jawab">
                <input type="text" value={form.namaPj} onChange={(e) => setForm({ ...form, namaPj: e.target.value })}
                  className="input" />
              </FormField>
              <FormField label="Hubungan PJ">
                <input type="text" value={form.hubunganPj} onChange={(e) => setForm({ ...form, hubunganPj: e.target.value })}
                  className="input" />
              </FormField>
              <FormField label="Telp PJ">
                <input type="text" value={form.telpPj} onChange={(e) => setForm({ ...form, telpPj: e.target.value })}
                  className="input" />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="btn btn-ghost btn-sm">Batal</button>
            <button type="submit"
              className="btn btn-primary btn-sm">
              {editing ? 'Simpan Perubahan' : 'Daftarkan Pasien'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
