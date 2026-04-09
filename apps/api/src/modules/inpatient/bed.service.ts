import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class BedService {
  constructor(private prisma: PrismaService) {}

  /**
   * Bed map — semua bed per bangsal dengan status
   */
  async getBedMap() {
    const locations = await this.prisma.location.findMany({
      where: { tipe: { in: ['BANGSAL', 'ICU'] }, isActive: true },
      include: {
        beds: {
          include: {
            encounters: {
              where: { status: { in: ['IN_PROGRESS', 'ARRIVED'] }, tipe: 'RAWAT_INAP' },
              include: { patient: { select: { id: true, noRm: true, namaLengkap: true, jenisKelamin: true } } },
              take: 1,
            },
          },
          orderBy: { nomorBed: 'asc' },
        },
      },
      orderBy: { nama: 'asc' },
    });

    return locations.map((loc) => ({
      id: Number(loc.id),
      nama: loc.nama,
      kode: loc.kode,
      kapasitas: loc.kapasitasBed,
      beds: loc.beds.map((bed) => {
        const occupant = bed.encounters[0];
        return {
          id: Number(bed.id),
          nomorBed: bed.nomorBed,
          kelas: bed.kelas,
          status: bed.status,
          tarifPerHari: Number(bed.tarifPerHari),
          patient: occupant ? {
            id: Number(occupant.patient.id),
            noRm: occupant.patient.noRm,
            namaLengkap: occupant.patient.namaLengkap,
            jenisKelamin: occupant.patient.jenisKelamin,
            encounterId: Number(occupant.id),
            noRawat: occupant.noRawat,
            tanggalMasuk: occupant.tanggalMasuk,
          } : null,
        };
      }),
      summary: {
        total: loc.beds.length,
        tersedia: loc.beds.filter((b) => b.status === 'TERSEDIA').length,
        terisi: loc.beds.filter((b) => b.status === 'TERISI').length,
        maintenance: loc.beds.filter((b) => b.status === 'MAINTENANCE').length,
      },
    }));
  }

  /**
   * Bed tersedia per kelas
   */
  async getAvailableBeds(kelas?: string) {
    const where: any = { status: 'TERSEDIA' };
    if (kelas) where.kelas = kelas;

    const beds = await this.prisma.bed.findMany({
      where,
      include: { location: { select: { id: true, nama: true, kode: true } } },
      orderBy: [{ location: { nama: 'asc' } }, { nomorBed: 'asc' }],
    });

    return beds.map((b) => ({
      id: Number(b.id),
      nomorBed: b.nomorBed,
      kelas: b.kelas,
      tarifPerHari: Number(b.tarifPerHari),
      location: { id: Number(b.location.id), nama: b.location.nama },
    }));
  }

  /**
   * Ringkasan ketersediaan per kelas (untuk Aplicares BPJS)
   */
  async getAvailabilitySummary() {
    const beds = await this.prisma.bed.findMany({ include: { location: true } });

    const summary: Record<string, { total: number; tersedia: number; terisi: number }> = {};
    for (const bed of beds) {
      const kelas = bed.kelas;
      if (!summary[kelas]) summary[kelas] = { total: 0, tersedia: 0, terisi: 0 };
      summary[kelas].total++;
      if (bed.status === 'TERSEDIA') summary[kelas].tersedia++;
      if (bed.status === 'TERISI') summary[kelas].terisi++;
    }

    return Object.entries(summary).map(([kelas, data]) => ({ kelas, ...data }));
  }
}
