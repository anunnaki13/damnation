import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
@Injectable()
export class SirsService {
  constructor(private prisma: PrismaService) {}
  async getRL1(year?: number) {
    const y = year || new Date().getFullYear();
    const [totalPatients, totalEncounters, ralanCount, ranapCount] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.encounter.count({ where: { tanggalMasuk: { gte: new Date(y, 0, 1), lt: new Date(y + 1, 0, 1) } } }),
      this.prisma.encounter.count({ where: { tipe: 'RAWAT_JALAN', tanggalMasuk: { gte: new Date(y, 0, 1), lt: new Date(y + 1, 0, 1) } } }),
      this.prisma.encounter.count({ where: { tipe: 'RAWAT_INAP', tanggalMasuk: { gte: new Date(y, 0, 1), lt: new Date(y + 1, 0, 1) } } }),
    ]);
    return { tahun: y, totalPasien: totalPatients, totalKunjungan: totalEncounters, rawatJalan: ralanCount, rawatInap: ranapCount };
  }
}
