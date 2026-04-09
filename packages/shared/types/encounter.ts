export type TipeEncounter = 'RAWAT_JALAN' | 'IGD' | 'RAWAT_INAP';
export type StatusEncounter = 'PLANNED' | 'ARRIVED' | 'IN_PROGRESS' | 'ON_LEAVE' | 'FINISHED' | 'CANCELLED';
export type Penjamin = 'UMUM' | 'BPJS' | 'ASURANSI' | 'JAMKESDA' | 'PERUSAHAAN';
export type KelasRawat = 'KELAS_1' | 'KELAS_2' | 'KELAS_3' | 'VIP' | 'VVIP';

export interface Encounter {
  id: number;
  noRawat: string;
  patientId: number;
  practitionerId?: number | null;
  locationId: number;
  tipe: TipeEncounter;
  kelasRawat?: KelasRawat | null;
  status: StatusEncounter;
  tanggalMasuk: string;
  tanggalKeluar?: string | null;
  penjamin: Penjamin;
  noSep?: string | null;
}
