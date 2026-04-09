'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function PendaftaranOnlinePage() {
  return (
    <div>
      <PageHeader title="Pendaftaran Online" description="Portal pendaftaran pasien via web & Mobile JKN" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8">
          <div className="card-flat p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--primary-dim)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--primary-soft)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <h2 className="text-[18px] font-bold" style={{ color: 'var(--text-1)' }}>Portal Pendaftaran Online</h2>
            <p className="text-[13px] mt-2 max-w-md mx-auto" style={{ color: 'var(--text-2)' }}>
              Pasien dapat mendaftar kunjungan rawat jalan melalui portal web atau aplikasi Mobile JKN.
              Antrean otomatis terintegrasi dengan BPJS Antrol.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-8 max-w-lg mx-auto">
              {[
                { step: '1', label: 'Pilih Poli & Dokter', desc: 'Lihat jadwal & kuota' },
                { step: '2', label: 'Isi Data', desc: 'No. RM atau data baru' },
                { step: '3', label: 'Kode Booking', desc: 'QR Code antrean' },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-[14px] font-bold"
                    style={{ background: 'var(--primary-dim)', color: 'var(--primary-soft)' }}>{s.step}</div>
                  <p className="text-[12px] font-semibold mt-2" style={{ color: 'var(--text-1)' }}>{s.label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{s.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] mt-8" style={{ color: 'var(--text-3)' }}>
              Integrasi BPJS Antrol aktif setelah credentials dikonfigurasi
            </p>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 space-y-4">
          <div className="card-flat p-5">
            <p className="overline mb-3">Status Integrasi</p>
            <div className="space-y-2">
              {[
                { label: 'Portal Web', status: 'Aktif', variant: 'success' as const },
                { label: 'Mobile JKN', status: 'Konfigurasi', variant: 'warning' as const },
                { label: 'BPJS Antrol', status: 'Konfigurasi', variant: 'warning' as const },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1">
                  <span className="text-[13px]" style={{ color: 'var(--text-2)' }}>{s.label}</span>
                  <span className={`badge badge-${s.variant}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-flat p-5">
            <p className="overline mb-3">Statistik Hari Ini</p>
            <div className="space-y-3">
              <div><p className="stat-value" style={{ color: 'var(--primary-soft)' }}>0</p><p className="stat-label">Pendaftaran Online</p></div>
              <div><p className="stat-value" style={{ color: 'var(--teal)' }}>0</p><p className="stat-label">Dari Mobile JKN</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
