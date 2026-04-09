export interface Patient {
  id: number;
  noRm: string;
  nik?: string | null;
  noBpjs?: string | null;
  satusehatId?: string | null;
  namaLengkap: string;
  tempatLahir?: string | null;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  golonganDarah?: 'A' | 'B' | 'AB' | 'O' | '-' | null;
  agama?: string | null;
  statusNikah?: 'BELUM_KAWIN' | 'KAWIN' | 'CERAI_HIDUP' | 'CERAI_MATI' | null;
  pekerjaan?: string | null;
  alamat?: string | null;
  noHp?: string | null;
  email?: string | null;
  isActive: boolean;
}

export interface PatientSearchParams {
  keyword?: string;
  page?: number;
  limit?: number;
}
