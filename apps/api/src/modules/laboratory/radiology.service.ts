import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class RadiologyService {
  constructor(private prisma: PrismaService) {}

  /** Worklist radiologi */
  async getWorklist(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    else where.status = { in: ['ORDERED', 'SCHEDULED', 'IN_PROGRESS'] };

    const data = await this.prisma.radiologyOrder.findMany({
      where,
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true, jenisKelamin: true, tanggalLahir: true } },
        encounter: { select: { id: true, noRawat: true, tipe: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return data.map(this.fmt);
  }

  /** Update status */
  async updateStatus(orderId: number, status: string) {
    const updated = await this.prisma.radiologyOrder.update({
      where: { id: BigInt(orderId) },
      data: {
        status: status as any,
        ...(status === 'IN_PROGRESS' ? { tanggalPemeriksaan: new Date() } : {}),
      },
    });
    return { ...updated, id: Number(updated.id) };
  }

  /** Input expertise / bacaan radiolog */
  async inputExpertise(orderId: number, dto: {
    hasilBacaan: string; kesan: string; radiologistId: number;
    proyeksi?: string; kV?: string; mAS?: string; dosis?: string;
  }) {
    const order = await this.prisma.radiologyOrder.findUnique({ where: { id: BigInt(orderId) } });
    if (!order) throw new NotFoundException('Order radiologi tidak ditemukan');

    const updated = await this.prisma.radiologyOrder.update({
      where: { id: BigInt(orderId) },
      data: {
        hasilBacaan: dto.hasilBacaan,
        kesan: dto.kesan,
        radiologistId: BigInt(dto.radiologistId),
        proyeksi: dto.proyeksi,
        kV: dto.kV,
        mAS: dto.mAS,
        dosis: dto.dosis,
        status: 'COMPLETED',
      },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true } },
      },
    });
    return this.fmt(updated);
  }

  /** Detail order */
  async getOrderDetail(orderId: number) {
    const order = await this.prisma.radiologyOrder.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        patient: true,
        encounter: { select: { id: true, noRawat: true, tipe: true } },
      },
    });
    if (!order) throw new NotFoundException('Order radiologi tidak ditemukan');
    return this.fmt(order);
  }

  /** Statistik radiologi hari ini */
  async getTodayStats() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const w = { createdAt: { gte: today, lt: tomorrow } };

    const [total, ordered, completed] = await Promise.all([
      this.prisma.radiologyOrder.count({ where: w }),
      this.prisma.radiologyOrder.count({ where: { ...w, status: 'ORDERED' } }),
      this.prisma.radiologyOrder.count({ where: { ...w, status: 'COMPLETED' } }),
    ]);
    return { total, ordered, inProgress: total - ordered - completed, completed };
  }

  private fmt(o: any): any {
    return {
      ...o, id: Number(o.id), encounterId: Number(o.encounterId),
      patientId: Number(o.patientId), requesterId: Number(o.requesterId),
      radiologistId: o.radiologistId ? Number(o.radiologistId) : null,
      bagianRs: Number(o.bagianRs || 0), bhp: Number(o.bhp || 0),
      biayaTotal: Number(o.biayaTotal || 0),
      patient: o.patient ? { ...o.patient, id: Number(o.patient.id) } : undefined,
      encounter: o.encounter ? { ...o.encounter, id: Number(o.encounter.id) } : undefined,
    };
  }
}
