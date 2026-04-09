'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDateTime } from '@/lib/utils';

const STATUS_MAP: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'default' }> = {
  PLANNED: { label: 'Terdaftar', variant: 'info' },
  ARRIVED: { label: 'Hadir', variant: 'warning' },
  IN_PROGRESS: { label: 'Dilayani', variant: 'success' },
  FINISHED: { label: 'Selesai', variant: 'default' },
  CANCELLED: { label: 'Batal', variant: 'danger' },
};

export default function RegistrasiPage() {
  const [encounters, setEncounters] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<any[]>([]);
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [filterLoc, setFilterLoc] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [form, setForm] = useState({
    patientId: 0, practitionerId: 0, locationId: 0,
    tipe: 'RAWAT_JALAN', penjamin: 'UMUM', noRujukan: '',
    pJawab: '', alamatPj: '', hubunganPj: '',
  });

  // Load initial data
  useEffect(() => {
    apiClient.get('/locations', { params: { tipe: 'POLI' } }).then((r) => setLocations(r.data));
    apiClient.get('/practitioners', { params: { limit: 100 } }).then((r) => setPractitioners(r.data.data));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterLoc) params.locationId = filterLoc;
      const [encRes, statsRes] = await Promise.all([
        apiClient.get('/registration/today', { params }),
        apiClient.get('/registration/stats'),
      ]);
      setEncounters(encRes.data);
      setStats(statsRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filterLoc]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Search pasien
  const searchPatient = useCallback(async (keyword: string) => {
    if (keyword.length < 2) { setPatientResults([]); return; }
    try {
      const res = await apiClient.get('/patients/search', { params: { keyword, limit: 10 } });
      setPatientResults(res.data.data);
    } catch (e) { console.error(e); }
  }, []);

  const selectPatient = (p: any) => {
    setSelectedPatient(p);
    setForm((prev) => ({
      ...prev,
      patientId: p.id,
      pJawab: p.namaPj || '',
      alamatPj: p.alamatPj || '',
      hubunganPj: p.hubunganPj || '',
    }));
    setPatientResults([]);
    setPatientSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) { alert('Pilih pasien terlebih dahulu'); return; }
    if (!form.locationId) { alert('Pilih poli tujuan'); return; }
    try {
      const res = await apiClient.post('/registration/encounter', {
        ...form,
        practitionerId: form.practitionerId || undefined,
        noRujukan: form.noRujukan || undefined,
      });
      alert(`Berhasil! No. Rawat: ${res.data.encounter.noRawat}\nAntrean: ${res.data.queue.nomorAntrean}`);
      setShowForm(false);
      setSelectedPatient(null);
      setForm({ patientId: 0, practitionerId: 0, locationId: 0, tipe: 'RAWAT_JALAN', penjamin: 'UMUM', noRujukan: '', pJawab: '', alamatPj: '', hubunganPj: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mendaftarkan');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Batalkan kunjungan ini?')) return;
    await apiClient.patch(`/registration/encounter/${id}/cancel`);
    fetchData();
  };

  const columns = [
    { key: 'noReg', label: 'No', className: 'w-14 text-center font-mono font-bold' },
    { key: 'noRawat', label: 'No. Rawat', className: 'font-mono text-xs' },
    { key: 'patient', label: 'Pasien', render: (_: any, row: any) => (
      <div>
        <p className="font-medium">{row.patient?.namaLengkap}</p>
        <p className="text-xs text-gray-400">{row.patient?.noRm} | {row.patient?.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
      </div>
    )},
    { key: 'location', label: 'Poli', render: (_: any, row: any) => row.location?.nama || '-' },
    { key: 'practitioner', label: 'Dokter', render: (_: any, row: any) => row.practitioner?.namaLengkap || '-' },
    { key: 'penjamin', label: 'Penjamin', render: (v: string) => (
      <StatusBadge status={v} variant={v === 'BPJS' ? 'success' : v === 'UMUM' ? 'info' : 'warning'} />
    )},
    { key: 'status', label: 'Status', render: (v: string) => {
      const s = STATUS_MAP[v] || { label: v, variant: 'default' as const };
      return <StatusBadge status={s.label} variant={s.variant} />;
    }},
    { key: 'tanggalMasuk', label: 'Jam', render: (v: string) => v ? new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-' },
    { key: 'actions', label: '', render: (_: any, row: any) => (
      row.status !== 'CANCELLED' && row.status !== 'FINISHED' ? (
        <button onClick={(e) => { e.stopPropagation(); handleCancel(row.id); }}
          className="text-xs text-red-500 hover:underline">Batal</button>
      ) : null
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Registrasi & Admisi"
        description="Pendaftaran kunjungan pasien rawat jalan & IGD"
        action={
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">
            + Daftarkan Kunjungan
          </button>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-800' },
            { label: 'Rawat Jalan', value: stats.rawatJalan, color: 'text-blue-600' },
            { label: 'IGD', value: stats.igd, color: 'text-red-600' },
            { label: 'BPJS', value: stats.bpjs, color: 'text-green-600' },
            { label: 'Umum', value: stats.umum, color: 'text-orange-600' },
            { label: 'Selesai', value: stats.selesai, color: 'text-gray-500' },
            { label: 'Belum', value: stats.belumSelesai, color: 'text-purple-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter Poli */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={() => setFilterLoc('')}
          className={`px-3 py-1.5 text-sm rounded-lg border ${!filterLoc ? 'bg-primary-600 text-white border-primary-600' : 'hover:bg-gray-100'}`}>
          Semua Poli
        </button>
        {locations.map((loc) => (
          <button key={loc.id} onClick={() => setFilterLoc(loc.id)}
            className={`px-3 py-1.5 text-sm rounded-lg border ${String(filterLoc) === String(loc.id) ? 'bg-primary-600 text-white border-primary-600' : 'hover:bg-gray-100'}`}>
            {loc.nama}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={encounters}
        isLoading={loading}
        emptyMessage="Belum ada kunjungan terdaftar hari ini"
      />

      {/* Registration Form Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setSelectedPatient(null); }}
        title="Daftarkan Kunjungan Baru" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Search */}
          <div className="bg-gray-50 rounded-lg p-4">
            <FormField label="Cari Pasien" required>
              <input type="text" value={patientSearch}
                onChange={(e) => { setPatientSearch(e.target.value); searchPatient(e.target.value); }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Ketik No.RM, NIK, nama, atau No.BPJS..." />
            </FormField>

            {/* Search Results */}
            {patientResults.length > 0 && (
              <div className="mt-2 border rounded-lg bg-white max-h-48 overflow-y-auto">
                {patientResults.map((p) => (
                  <button key={p.id} type="button" onClick={() => selectPatient(p)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-0 text-sm">
                    <span className="font-mono text-primary-600">{p.noRm}</span>
                    <span className="mx-2">—</span>
                    <span className="font-medium">{p.namaLengkap}</span>
                    <span className="text-gray-400 ml-2">
                      {p.jenisKelamin === 'L' ? 'L' : 'P'} | {p.nik || '-'} | BPJS: {p.noBpjs || '-'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Patient Card */}
            {selectedPatient && (
              <div className="mt-3 bg-white border-2 border-primary-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">{selectedPatient.namaLengkap}</p>
                    <p className="text-sm text-gray-500">
                      {selectedPatient.noRm} | {selectedPatient.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      {selectedPatient.tanggalLahir && ` | ${new Date(selectedPatient.tanggalLahir).toLocaleDateString('id-ID')}`}
                    </p>
                    {selectedPatient.noBpjs && (
                      <p className="text-sm text-green-600 mt-1">BPJS: {selectedPatient.noBpjs}</p>
                    )}
                  </div>
                  <button type="button" onClick={() => { setSelectedPatient(null); setForm((f) => ({ ...f, patientId: 0 })); }}
                    className="text-xs text-red-500 hover:underline">Ganti</button>
                </div>
              </div>
            )}
          </div>

          {/* Encounter Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Tipe Kunjungan" required>
              <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="RAWAT_JALAN">Rawat Jalan</option>
                <option value="IGD">IGD</option>
              </select>
            </FormField>

            <FormField label="Penjamin" required>
              <select value={form.penjamin} onChange={(e) => setForm({ ...form, penjamin: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="UMUM">Umum</option>
                <option value="BPJS">BPJS Kesehatan</option>
                <option value="ASURANSI">Asuransi</option>
                <option value="JAMKESDA">Jamkesda</option>
                <option value="PERUSAHAAN">Perusahaan</option>
              </select>
            </FormField>

            <FormField label="Poli Tujuan" required>
              <select value={form.locationId} onChange={(e) => setForm({ ...form, locationId: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required>
                <option value={0}>-- Pilih Poli --</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.nama}</option>)}
              </select>
            </FormField>

            <FormField label="Dokter">
              <select value={form.practitionerId} onChange={(e) => setForm({ ...form, practitionerId: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value={0}>-- Pilih Dokter --</option>
                {practitioners.filter((p) => ['DOKTER_UMUM', 'DOKTER_SPESIALIS', 'DOKTER_GIGI'].includes(p.jenisNakes))
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.namaLengkap} {p.spesialisasi ? `(${p.spesialisasi})` : ''}</option>
                  ))}
              </select>
            </FormField>
          </div>

          {/* BPJS fields */}
          {form.penjamin === 'BPJS' && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-3">Data BPJS</h4>
              <FormField label="No. Rujukan">
                <input type="text" value={form.noRujukan} onChange={(e) => setForm({ ...form, noRujukan: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Masukkan no. rujukan FKTP" />
              </FormField>
              <p className="text-xs text-green-600 mt-2">* Penerbitan SEP otomatis setelah integrasi BPJS VClaim aktif</p>
            </div>
          )}

          {/* PJ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Penanggung Jawab">
              <input type="text" value={form.pJawab} onChange={(e) => setForm({ ...form, pJawab: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </FormField>
            <FormField label="Hubungan">
              <input type="text" value={form.hubunganPj} onChange={(e) => setForm({ ...form, hubunganPj: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </FormField>
            <FormField label="Alamat PJ">
              <input type="text" value={form.alamatPj} onChange={(e) => setForm({ ...form, alamatPj: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => { setShowForm(false); setSelectedPatient(null); }}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Batal</button>
            <button type="submit"
              className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Daftarkan Kunjungan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
