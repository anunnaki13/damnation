export const ROLES = {
  ADMIN: 'ADMIN',
  DOKTER: 'DOKTER',
  PERAWAT: 'PERAWAT',
  APOTEKER: 'APOTEKER',
  REGISTRASI: 'REGISTRASI',
  KASIR: 'KASIR',
  LAB_ANALIS: 'LAB_ANALIS',
  RADIOGRAFER: 'RADIOGRAFER',
  MANAJEMEN: 'MANAJEMEN',
  IT: 'IT',
} as const;

export const TRIASE_COLORS: Record<string, string> = {
  ESI_1: '#DC2626', // Merah — Resusitasi
  ESI_2: '#F97316', // Oranye — Emergent
  ESI_3: '#EAB308', // Kuning — Urgent
  ESI_4: '#22C55E', // Hijau — Less Urgent
  ESI_5: '#3B82F6', // Biru — Non-Urgent
};

export const ENCOUNTER_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Terdaftar',
  ARRIVED: 'Hadir',
  IN_PROGRESS: 'Sedang Dilayani',
  ON_LEAVE: 'Ditunda',
  FINISHED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

export const PENJAMIN_LABELS: Record<string, string> = {
  UMUM: 'Umum',
  BPJS: 'BPJS Kesehatan',
  ASURANSI: 'Asuransi',
  JAMKESDA: 'Jamkesda',
  PERUSAHAAN: 'Perusahaan',
};
