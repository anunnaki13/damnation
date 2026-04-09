import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const patientSchema = z.object({
  namaLengkap: z.string().min(1, 'Nama wajib diisi').max(200),
  nik: z.string().length(16, 'NIK harus 16 digit').optional().or(z.literal('')),
  noBpjs: z.string().max(13).optional().or(z.literal('')),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenisKelamin: z.enum(['L', 'P'], { required_error: 'Jenis kelamin wajib dipilih' }),
  golonganDarah: z.enum(['A', 'B', 'AB', 'O', '-']).optional(),
  agama: z.string().optional(),
  statusNikah: z.enum(['BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI']).optional(),
  pekerjaan: z.string().optional(),
  alamat: z.string().optional(),
  rt: z.string().optional(),
  rw: z.string().optional(),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  kabupaten: z.string().optional(),
  provinsi: z.string().optional(),
  kodePos: z.string().optional(),
  noTelp: z.string().optional(),
  noHp: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  namaIbu: z.string().optional(),
  namaPj: z.string().optional(),
  hubunganPj: z.string().optional(),
  alamatPj: z.string().optional(),
  telpPj: z.string().optional(),
});

export const encounterSchema = z.object({
  patientId: z.number().min(1, 'Pasien wajib dipilih'),
  practitionerId: z.number().optional(),
  locationId: z.number().min(1, 'Lokasi wajib dipilih'),
  tipe: z.enum(['RAWAT_JALAN', 'IGD', 'RAWAT_INAP']),
  penjamin: z.enum(['UMUM', 'BPJS', 'ASURANSI', 'JAMKESDA', 'PERUSAHAAN']),
  kelasRawat: z.enum(['KELAS_1', 'KELAS_2', 'KELAS_3', 'VIP', 'VVIP']).optional(),
  noRujukan: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type EncounterInput = z.infer<typeof encounterSchema>;
