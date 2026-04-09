'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';

const STATUS_MAP: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'default' }> = {
  PLANNED: { label: 'Menunggu', variant: 'info' },
  ARRIVED: { label: 'Hadir', variant: 'warning' },
  IN_PROGRESS: { label: 'Diperiksa', variant: 'success' },
  FINISHED: { label: 'Selesai', variant: 'default' },
  CANCELLED: { label: 'Batal', variant: 'danger' },
};

export default function RawatJalanPage() {
  const [worklist, setWorklist] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoc, setFilterLoc] = useState('');
  const [selectedEncounter, setSelectedEncounter] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get('/locations', { params: { tipe: 'POLI' } }).then((r) => setLocations(r.data));
  }, []);

  const fetchWorklist = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterLoc) params.locationId = filterLoc;
      const res = await apiClient.get('/outpatient/worklist', { params });
      setWorklist(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filterLoc]);

  useEffect(() => { fetchWorklist(); }, [fetchWorklist]);

  const handleStart = async (id: number) => {
    await apiClient.patch(`/outpatient/encounter/${id}/start`);
    fetchWorklist();
  };

  const handleFinish = async (id: number) => {
    if (!confirm('Selesaikan kunjungan ini?')) return;
    await apiClient.patch(`/outpatient/encounter/${id}/finish`);
    fetchWorklist();
  };

  const columns = [
    { key: 'noReg', label: 'No', className: 'w-12 text-center font-mono font-bold' },
    { key: 'patient', label: 'Pasien', render: (_: any, row: any) => (
      <div>
        <p className="font-medium">{row.patient?.namaLengkap}</p>
        <p className="text-xs text-gray-400">{row.patient?.noRm} | {row.patient?.jenisKelamin === 'L' ? 'L' : 'P'} | {row.patient?.tanggalLahir ? formatDate(row.patient.tanggalLahir) : ''}</p>
      </div>
    )},
    { key: 'location', label: 'Poli', render: (_: any, row: any) => row.location?.nama },
    { key: 'practitioner', label: 'Dokter', render: (_: any, row: any) => (
      <div>
        <p className="text-sm">{row.practitioner?.namaLengkap || '-'}</p>
        <p className="text-xs text-gray-400">{row.practitioner?.spesialisasi || ''}</p>
      </div>
    )},
    { key: 'penjamin', label: 'Penjamin', render: (v: string) => (
      <StatusBadge status={v} variant={v === 'BPJS' ? 'success' : 'info'} />
    )},
    { key: 'progress', label: 'Progress', render: (_: any, row: any) => (
      <div className="flex gap-1">
        <span className={`w-2 h-2 rounded-full mt-1 ${row.hasSOAP ? 'bg-green-500' : 'bg-gray-300'}`} title="SOAP" />
        <span className={`w-2 h-2 rounded-full mt-1 ${row.hasDiagnosis ? 'bg-green-500' : 'bg-gray-300'}`} title="Diagnosis" />
        <span className={`w-2 h-2 rounded-full mt-1 ${row.hasPrescription ? 'bg-green-500' : 'bg-gray-300'}`} title="Resep" />
      </div>
    )},
    { key: 'status', label: 'Status', render: (v: string) => {
      const s = STATUS_MAP[v] || { label: v, variant: 'default' as const };
      return <StatusBadge status={s.label} variant={s.variant} />;
    }},
    { key: 'actions', label: 'Aksi', render: (_: any, row: any) => (
      <div className="flex gap-1">
        {row.status === 'PLANNED' && (
          <button onClick={(e) => { e.stopPropagation(); handleStart(row.id); }}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
            Mulai Periksa
          </button>
        )}
        {row.status === 'IN_PROGRESS' && (
          <button onClick={(e) => { e.stopPropagation(); handleFinish(row.id); }}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
            Selesai
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); setSelectedEncounter(row.id); }}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
          Periksa
        </button>
      </div>
    )},
  ];

  // Jika encounter dipilih, tampilkan layar klinik
  if (selectedEncounter) {
    return <ClinicalScreen encounterId={selectedEncounter} onBack={() => { setSelectedEncounter(null); fetchWorklist(); }} />;
  }

  return (
    <div>
      <PageHeader title="Rawat Jalan" description="Worklist pasien poliklinik hari ini" />

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

      <DataTable columns={columns} data={worklist} isLoading={loading}
        emptyMessage="Belum ada pasien rawat jalan hari ini"
        onRowClick={(row) => setSelectedEncounter(row.id)} />
    </div>
  );
}

// ==========================================
// CLINICAL SCREEN — layar periksa terintegrasi
// ==========================================

function ClinicalScreen({ encounterId, onBack }: { encounterId: number; onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('soap');
  const [loading, setLoading] = useState(true);

  // SOAP form
  const [soap, setSoap] = useState({
    subjective: '', objective: '', assessment: '', plan: '',
    tekananDarahSistolik: '', tekananDarahDiastolik: '', nadi: '',
    suhu: '', pernapasan: '', spo2: '', tinggiBadan: '', beratBadan: '',
  });

  // Diagnosis form
  const [diagSearch, setDiagSearch] = useState('');
  const [diagResults, setDiagResults] = useState<any[]>([]);

  // Prescription
  const [rxSearch, setRxSearch] = useState('');
  const [rxResults, setRxResults] = useState<any[]>([]);
  const [rxItems, setRxItems] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/outpatient/encounter/${encounterId}`);
      setData(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [encounterId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Search ICD-10
  const searchDiagnosis = async (q: string) => {
    setDiagSearch(q);
    if (q.length < 2) { setDiagResults([]); return; }
    const res = await apiClient.get('/outpatient/icd10/search', { params: { q } });
    setDiagResults(res.data);
  };

  const addDiagnosis = async (icd: any, tipe: string = 'PRIMER') => {
    await apiClient.post('/outpatient/diagnosis', {
      encounterId, icd10Code: icd.kdPenyakit, icd10Display: icd.nmPenyakit, tipe,
      rankOrder: (data?.diagnoses?.length || 0) + 1,
    });
    setDiagSearch(''); setDiagResults([]);
    fetchData();
  };

  const removeDiagnosis = async (id: number) => {
    await apiClient.delete(`/outpatient/diagnosis/${id}`);
    fetchData();
  };

  // Search medicine
  const searchMedicine = async (q: string) => {
    setRxSearch(q);
    if (q.length < 2) { setRxResults([]); return; }
    const res = await apiClient.get('/outpatient/medicine/search', { params: { q } });
    setRxResults(res.data);
  };

  const addRxItem = (med: any) => {
    setRxItems((prev) => [...prev, {
      medicineId: Number(med.id), nama: med.namaGenerik, satuan: med.satuan,
      jumlah: 1, dosis: '', frekuensi: '', aturanPakai: '',
      hargaSatuan: Number(med.hargaJualRalan) || 0,
    }]);
    setRxSearch(''); setRxResults([]);
  };

  const submitSOAP = async () => {
    if (!data?.practitioner?.id) { alert('Dokter belum ditentukan'); return; }
    await apiClient.post('/outpatient/soap', {
      encounterId, practitionerId: data.practitioner.id, tipe: 'SOAP',
      ...soap,
      tekananDarahSistolik: soap.tekananDarahSistolik ? Number(soap.tekananDarahSistolik) : undefined,
      tekananDarahDiastolik: soap.tekananDarahDiastolik ? Number(soap.tekananDarahDiastolik) : undefined,
      nadi: soap.nadi ? Number(soap.nadi) : undefined,
      suhu: soap.suhu ? Number(soap.suhu) : undefined,
      pernapasan: soap.pernapasan ? Number(soap.pernapasan) : undefined,
      spo2: soap.spo2 ? Number(soap.spo2) : undefined,
      tinggiBadan: soap.tinggiBadan ? Number(soap.tinggiBadan) : undefined,
      beratBadan: soap.beratBadan ? Number(soap.beratBadan) : undefined,
    });
    alert('SOAP berhasil disimpan');
    fetchData();
  };

  const submitPrescription = async () => {
    if (rxItems.length === 0) { alert('Tambahkan minimal 1 obat'); return; }
    await apiClient.post('/outpatient/prescription', {
      encounterId, prescriberId: data.practitioner.id,
      items: rxItems.map((i) => ({
        medicineId: i.medicineId, jumlah: i.jumlah, dosis: i.dosis,
        frekuensi: i.frekuensi, aturanPakai: i.aturanPakai, hargaSatuan: i.hargaSatuan,
      })),
    });
    alert('Resep berhasil dikirim ke farmasi');
    setRxItems([]);
    fetchData();
  };

  if (loading || !data) return <div className="p-8 text-center text-gray-400">Memuat data...</div>;

  const tabs = [
    { key: 'soap', label: 'SOAP & Vital' },
    { key: 'diagnosis', label: `Diagnosis (${data.diagnoses?.length || 0})` },
    { key: 'prescription', label: `E-Resep (${data.prescriptions?.length || 0})` },
    { key: 'orders', label: 'Order Lab/Rad' },
    { key: 'history', label: 'Riwayat' },
  ];

  return (
    <div>
      {/* Header with patient info */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">&larr; Kembali ke Worklist</button>
        <StatusBadge status={data.status === 'IN_PROGRESS' ? 'Sedang Diperiksa' : data.status} variant="success" />
      </div>

      <div className="bg-white rounded-xl border p-4 mb-4">
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-bold">{data.patient?.namaLengkap}</h2>
            <p className="text-sm text-gray-500">
              {data.patient?.noRm} | {data.patient?.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              | {data.patient?.tanggalLahir ? formatDate(data.patient.tanggalLahir) : ''}
              | {data.penjamin}
            </p>
            {data.patient?.alergiObat && (
              <p className="text-sm text-red-600 mt-1 font-medium">Alergi: {data.patient.alergiObat}</p>
            )}
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>No. Rawat: <span className="font-mono">{data.noRawat}</span></p>
            <p>{data.location?.nama} | {data.practitioner?.namaLengkap}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border p-6">
        {activeTab === 'soap' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-3">Tanda Vital</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'tekananDarahSistolik', label: 'TD Sistolik', unit: 'mmHg' },
                { key: 'tekananDarahDiastolik', label: 'TD Diastolik', unit: 'mmHg' },
                { key: 'nadi', label: 'Nadi', unit: '/mnt' },
                { key: 'suhu', label: 'Suhu', unit: 'C' },
                { key: 'pernapasan', label: 'RR', unit: '/mnt' },
                { key: 'spo2', label: 'SpO2', unit: '%' },
                { key: 'tinggiBadan', label: 'TB', unit: 'cm' },
                { key: 'beratBadan', label: 'BB', unit: 'kg' },
              ].map((v) => (
                <div key={v.key}>
                  <label className="text-xs text-gray-500">{v.label} ({v.unit})</label>
                  <input type="number" value={(soap as any)[v.key]}
                    onChange={(e) => setSoap({ ...soap, [v.key]: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm" step="any" />
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-gray-800 mt-6 mb-3">SOAP</h3>
            {[
              { key: 'subjective', label: 'S — Subjective (keluhan pasien)', rows: 3 },
              { key: 'objective', label: 'O — Objective (pemeriksaan fisik)', rows: 3 },
              { key: 'assessment', label: 'A — Assessment (penilaian/diagnosis)', rows: 2 },
              { key: 'plan', label: 'P — Plan (rencana terapi)', rows: 2 },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm font-medium text-gray-700">{f.label}</label>
                <textarea value={(soap as any)[f.key]}
                  onChange={(e) => setSoap({ ...soap, [f.key]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1" rows={f.rows} />
              </div>
            ))}

            <button onClick={submitSOAP}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
              Simpan SOAP
            </button>

            {/* Existing records */}
            {data.medicalRecords?.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Catatan Sebelumnya</h4>
                {data.medicalRecords.map((rec: any) => (
                  <div key={rec.id} className="bg-gray-50 rounded-lg p-3 mb-2 text-sm">
                    <p className="text-xs text-gray-400 mb-1">{rec.tipe} — {new Date(rec.createdAt).toLocaleString('id-ID')}</p>
                    {rec.subjective && <p><strong>S:</strong> {rec.subjective}</p>}
                    {rec.objective && <p><strong>O:</strong> {rec.objective}</p>}
                    {rec.assessment && <p><strong>A:</strong> {rec.assessment}</p>}
                    {rec.plan && <p><strong>P:</strong> {rec.plan}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'diagnosis' && (
          <div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Cari ICD-10</label>
              <input type="text" value={diagSearch} onChange={(e) => searchDiagnosis(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                placeholder="Ketik kode atau nama penyakit..." />
              {diagResults.length > 0 && (
                <div className="border rounded-lg mt-1 max-h-48 overflow-y-auto bg-white">
                  {diagResults.map((d) => (
                    <div key={d.kdPenyakit} className="px-3 py-2 hover:bg-blue-50 border-b last:border-0 flex justify-between items-center">
                      <div>
                        <span className="font-mono text-primary-600 text-sm">{d.kdPenyakit}</span>
                        <span className="ml-2 text-sm">{d.nmPenyakit}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => addDiagnosis(d, 'PRIMER')} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Primer</button>
                        <button onClick={() => addDiagnosis(d, 'SEKUNDER')} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Sekunder</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h4 className="text-sm font-medium text-gray-700 mb-2">Diagnosis Aktif</h4>
            {data.diagnoses?.filter((d: any) => d.isActive).length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada diagnosis</p>
            ) : (
              <div className="space-y-2">
                {data.diagnoses.filter((d: any) => d.isActive).map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                    <div>
                      <StatusBadge status={d.tipe} variant={d.tipe === 'PRIMER' ? 'info' : 'default'} />
                      <span className="ml-2 font-mono text-sm">{d.icd10Code}</span>
                      <span className="ml-2 text-sm">{d.icd10Display}</span>
                    </div>
                    <button onClick={() => removeDiagnosis(Number(d.id))} className="text-xs text-red-500 hover:underline">Hapus</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'prescription' && (
          <div>
            {/* Add new prescription */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Buat E-Resep</h4>
              <input type="text" value={rxSearch} onChange={(e) => searchMedicine(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Cari obat (kode atau nama)..." />
              {rxResults.length > 0 && (
                <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto bg-white">
                  {rxResults.map((m: any) => (
                    <button key={m.id} onClick={() => addRxItem(m)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-0 text-sm">
                      <span className="font-mono text-xs text-gray-400">{m.kode}</span>
                      <span className="ml-2">{m.namaGenerik}</span>
                      <span className="ml-2 text-gray-400">({m.satuan})</span>
                    </button>
                  ))}
                </div>
              )}

              {rxItems.length > 0 && (
                <div className="mt-3 space-y-2">
                  {rxItems.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm">{item.nama} ({item.satuan})</p>
                        <button onClick={() => setRxItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-xs text-red-500">Hapus</button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Jumlah</label>
                          <input type="number" value={item.jumlah} min={1}
                            onChange={(e) => { const n = [...rxItems]; n[idx].jumlah = Number(e.target.value); setRxItems(n); }}
                            className="w-full px-2 py-1 border rounded text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Dosis</label>
                          <input type="text" value={item.dosis} placeholder="3x1"
                            onChange={(e) => { const n = [...rxItems]; n[idx].dosis = e.target.value; setRxItems(n); }}
                            className="w-full px-2 py-1 border rounded text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Frekuensi</label>
                          <input type="text" value={item.frekuensi} placeholder="3x sehari"
                            onChange={(e) => { const n = [...rxItems]; n[idx].frekuensi = e.target.value; setRxItems(n); }}
                            className="w-full px-2 py-1 border rounded text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Aturan Pakai</label>
                          <input type="text" value={item.aturanPakai} placeholder="Sesudah makan"
                            onChange={(e) => { const n = [...rxItems]; n[idx].aturanPakai = e.target.value; setRxItems(n); }}
                            className="w-full px-2 py-1 border rounded text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={submitPrescription}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    Kirim Resep ke Farmasi
                  </button>
                </div>
              )}
            </div>

            {/* Existing prescriptions */}
            {data.prescriptions?.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Resep Terkirim</h4>
                {data.prescriptions.map((rx: any) => (
                  <div key={rx.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-mono">{rx.noResep}</span>
                      <StatusBadge status={rx.status} variant={rx.status === 'DISPENSED' ? 'success' : 'warning'} />
                    </div>
                    {rx.items?.map((item: any) => (
                      <p key={item.id} className="text-sm">
                        - {item.medicine?.namaGenerik} x{Number(item.jumlah)} ({item.aturanPakai || item.dosis || '-'})
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="text-sm text-gray-400">
            <p className="mb-4">Order lab dan radiologi akan ditambahkan setelah modul Lab & Radiologi dikembangkan (Step 10).</p>
            {data.labOrders?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Order Lab</h4>
                {data.labOrders.map((o: any) => (
                  <div key={o.id} className="bg-gray-50 rounded p-2 mb-1">
                    <span className="font-mono text-xs">{o.noOrder}</span> — {o.status}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Riwayat Kunjungan Sebelumnya</h4>
            {data.history?.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada riwayat</p>
            ) : (
              <div className="space-y-2">
                {data.history?.map((h: any) => (
                  <div key={h.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span>{h.tanggalMasuk ? formatDate(h.tanggalMasuk) : '-'} — {h.location?.nama}</span>
                      <span className="text-gray-400">{h.practitioner?.namaLengkap}</span>
                    </div>
                    {h.diagnoses?.map((d: any) => (
                      <p key={d.id} className="text-xs text-gray-500 mt-1">
                        {d.tipe}: {d.icd10Code} — {d.icd10Display}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
