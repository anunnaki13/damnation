import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}
  async getEmployees(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({ skip, take: limit, include: { practitioner: { select: { namaLengkap: true, jenisNakes: true, spesialisasi: true } } }, orderBy: { namaLengkap: 'asc' } }),
      this.prisma.employee.count(),
    ]);
    return { data: data.map((e) => ({ ...e, id: Number(e.id), practitionerId: e.practitionerId ? Number(e.practitionerId) : null, gapok: e.gapok ? Number(e.gapok) : null })), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
  async getStats() {
    const [total, aktif, pns, kontrak] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { isActive: true } }),
      this.prisma.employee.count({ where: { statusPegawai: 'PNS' } }),
      this.prisma.employee.count({ where: { statusPegawai: 'KONTRAK' } }),
    ]);
    return { total, aktif, pns, kontrak, honorer: total - pns - kontrak };
  }
}
