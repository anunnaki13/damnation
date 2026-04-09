'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';

const HARI = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'];
const HARI_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  SENIN: 'info', SELASA: 'info', RABU: 'info', KAMIS: 'info', JUMAT: 'success', SABTU: 'warning', MINGGU: 'warning',
};

export default function JadwalPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    practitionerId: 0, locationId: 0, hari: 'SENIN', jamMulai: '08:00', jamSelesai: '12:00', kuotaPasien: 30,
  });

  useEffect(() => {
    apiClient.get('/locations', { params: { tipe: 'POLI' } }).then((r) => setLocations(r.data));
    apiClient.get('/practitioners', { params: { limit: 100 } }).then((r) => setPractitioners(r.data.data));
  }, []);

  const fetchSchedules = useCallback(async (locId: number) => {
    setLoading(true);
    setSelectedLoc(locId);
    try {
      const res = await apiClient.get(`/schedules/location/${locId}`);
      setSchedules(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/schedules', form);
      setShowForm(false);
      if (selectedLoc) fetchSchedules(selectedLoc);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Nonaktifkan jadwal ini?')) return;
    await apiClient.delete(`/schedules/${id}`);
    if (selectedLoc) fetchSchedules(selectedLoc);
  };

  const columns = [
    { key: 'hari', label: 'Hari', render: (v: string) => (
      <StatusBadge status={v} variant={HARI_VARIANT[v] || 'default'} />
    )},
    { key: 'practitioner', label: 'Dokter', render: (_: any, row: any) => (
      <div>
        <p className="font-medium">{row.practitioner?.namaLengkap}</p>
        <p className="text-xs text-gray-400">{row.practitioner?.spesialisasi || '-'}</p>
      </div>
    )},
    { key: 'jamMulai', label: 'Jam Mulai' },
    { key: 'jamSelesai', label: 'Jam Selesai' },
    { key: 'kuotaPasien', label: 'Kuota' },
    { key: 'actions', label: '', render: (_: any, row: any) => (
      <button onClick={() => handleDelete(row.id)} className="text-xs text-red-500 hover:underline">Hapus</button>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Jadwal Praktik Dokter"
        description="Kelola jadwal dokter per poli"
        action={
          <button onClick={() => { setForm({ ...form, locationId: selectedLoc || 0 }); setShowForm(true); }}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">
            + Tambah Jadwal
          </button>
        }
      />

      <div className="mb-4 flex gap-2 flex-wrap">
        {locations.map((loc) => (
          <button key={loc.id} onClick={() => fetchSchedules(loc.id)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
              selectedLoc === loc.id ? 'bg-primary-600 text-white border-primary-600' : 'hover:bg-gray-100'
            }`}>
            {loc.nama}
          </button>
        ))}
      </div>

      {selectedLoc ? (
        <DataTable columns={columns} data={schedules} isLoading={loading}
          emptyMessage="Belum ada jadwal untuk poli ini" />
      ) : (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          Pilih poli untuk melihat jadwal dokter
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tambah Jadwal Praktik" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Dokter" required>
            <select value={form.practitionerId} onChange={(e) => setForm({ ...form, practitionerId: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg text-sm" required>
              <option value={0}>-- Pilih Dokter --</option>
              {practitioners.map((p) => (
                <option key={p.id} value={p.id}>{p.namaLengkap} {p.spesialisasi ? `(${p.spesialisasi})` : ''}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Poli / Lokasi" required>
            <select value={form.locationId} onChange={(e) => setForm({ ...form, locationId: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg text-sm" required>
              <option value={0}>-- Pilih Lokasi --</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.nama}</option>)}
            </select>
          </FormField>
          <FormField label="Hari" required>
            <select value={form.hari} onChange={(e) => setForm({ ...form, hari: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              {HARI.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Jam Mulai" required>
              <input type="time" value={form.jamMulai} onChange={(e) => setForm({ ...form, jamMulai: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </FormField>
            <FormField label="Jam Selesai" required>
              <input type="time" value={form.jamSelesai} onChange={(e) => setForm({ ...form, jamSelesai: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </FormField>
          </div>
          <FormField label="Kuota Pasien">
            <input type="number" value={form.kuotaPasien} onChange={(e) => setForm({ ...form, kuotaPasien: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg text-sm" min={1} />
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
