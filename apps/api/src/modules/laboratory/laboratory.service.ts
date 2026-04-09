import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class LaboratoryService {
  constructor(private prisma: PrismaService) {}

  /** Worklist lab — order masuk */
  async getWorklist(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    else where.status = { in: ['ORDERED', 'SPECIMEN_COLLECTED', 'IN_PROGRESS'] };

    const data = await this.prisma.labOrder.findMany({
      where,
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true, jenisKelamin: true, tanggalLahir: true } },
        requester: { select: { id: true, namaLengkap: true, spesialisasi: true } },
        encounter: { select: { id: true, noRawat: true, tipe: true } },
        items: { include: { results: true } },
      },
      orderBy: [{ prioritas: 'asc' }, { tanggalOrder: 'asc' }],
    });
    return data.map(this.fmt);
  }

  /** Update status order */
  async updateStatus(orderId: number, status: string) {
    const updated = await this.prisma.labOrder.update({
      where: { id: BigInt(orderId) },
      data: { status: status as any },
    });
    return { ...updated, id: Number(updated.id) };
  }

  /** Input hasil lab per parameter */
  async inputResult(labOrderItemId: number, results: Array<{
    parameter: string; hasil: string; satuan?: string; nilaiNormal?: string; flag?: string;
  }>) {
    const item = await this.prisma.labOrderItem.findUnique({ where: { id: BigInt(labOrderItemId) } });
    if (!item) throw new NotFoundException('Item order tidak ditemukan');

    const created = [];
    for (const r of results) {
      const result = await this.prisma.labResult.create({
        data: {
          labOrderItemId: BigInt(labOrderItemId),
          parameter: r.parameter,
          hasil: r.hasil,
          satuan: r.satuan,
          nilaiNormal: r.nilaiNormal,
          flag: r.flag as any,
        },
      });
      created.push({ ...result, id: Number(result.id) });
    }
    return created;
  }

  /** Validasi hasil lab */
  async validateResult(labOrderId: number, validatorId: number) {
    // Update semua results di order ini
    const items = await this.prisma.labOrderItem.findMany({
      where: { labOrderId: BigInt(labOrderId) },
    });

    for (const item of items) {
      await this.prisma.labResult.updateMany({
        where: { labOrderItemId: item.id },
        data: { validatorId: BigInt(validatorId), validatedAt: new Date() },
      });
    }

    await this.prisma.labOrder.update({
      where: { id: BigInt(labOrderId) },
      data: { status: 'COMPLETED' },
    });

    return { message: 'Hasil lab divalidasi' };
  }

  /** Detail order + results */
  async getOrderDetail(orderId: number) {
    const order = await this.prisma.labOrder.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        patient: true,
        requester: { select: { id: true, namaLengkap: true } },
        encounter: { select: { id: true, noRawat: true } },
        items: { include: { results: true } },
      },
    });
    if (!order) throw new NotFoundException('Order lab tidak ditemukan');
    return this.fmt(order);
  }

  /** Hasil lab per pasien */
  async getPatientLabHistory(patientId: number, limit = 10) {
    const data = await this.prisma.labOrder.findMany({
      where: { patientId: BigInt(patientId), status: 'COMPLETED' },
      include: { items: { include: { results: true } } },
      orderBy: { tanggalOrder: 'desc' },
      take: limit,
    });
    return data.map(this.fmt);
  }

  /** Statistik lab hari ini */
  async getTodayStats() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const w = { tanggalOrder: { gte: today, lt: tomorrow } };

    const [total, ordered, inProgress, completed] = await Promise.all([
      this.prisma.labOrder.count({ where: w }),
      this.prisma.labOrder.count({ where: { ...w, status: 'ORDERED' } }),
      this.prisma.labOrder.count({ where: { ...w, status: 'IN_PROGRESS' } }),
      this.prisma.labOrder.count({ where: { ...w, status: 'COMPLETED' } }),
    ]);
    return { total, ordered, inProgress, completed };
  }

  private fmt(o: any): any {
    return {
      ...o, id: Number(o.id), encounterId: Number(o.encounterId),
      patientId: Number(o.patientId), requesterId: Number(o.requesterId),
      patient: o.patient ? { ...o.patient, id: Number(o.patient.id) } : undefined,
      requester: o.requester ? { ...o.requester, id: Number(o.requester.id) } : undefined,
      encounter: o.encounter ? { ...o.encounter, id: Number(o.encounter.id) } : undefined,
      items: o.items?.map((i: any) => ({
        ...i, id: Number(i.id), labOrderId: Number(i.labOrderId),
        tarif: Number(i.tarif || 0),
        results: i.results?.map((r: any) => ({ ...r, id: Number(r.id), labOrderItemId: Number(r.labOrderItemId) })),
      })),
    };
  }
}
