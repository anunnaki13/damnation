import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateLabOrderDto, CreateRadiologyOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createLabOrder(dto: CreateLabOrderDto) {
    const enc = await this.prisma.encounter.findUnique({ where: { id: BigInt(dto.encounterId) } });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    const noOrder = await this.generateOrderNo('LAB');

    const order = await this.prisma.labOrder.create({
      data: {
        encounterId: BigInt(dto.encounterId),
        patientId: enc.patientId,
        requesterId: BigInt(dto.requesterId),
        noOrder,
        tanggalOrder: new Date(),
        status: 'ORDERED',
        prioritas: dto.prioritas as any || 'ROUTINE',
        catatanKlinis: dto.catatanKlinis,
        statusRawat: 'Ralan',
        items: {
          create: dto.items.map((item) => ({
            pemeriksaan: item.pemeriksaan,
            loincCode: item.loincCode,
            tarif: item.tarif || 0,
          })),
        },
      },
      include: { items: true },
    });

    return { ...order, id: Number(order.id) };
  }

  async createRadiologyOrder(dto: CreateRadiologyOrderDto) {
    const enc = await this.prisma.encounter.findUnique({ where: { id: BigInt(dto.encounterId) } });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    const noOrder = await this.generateOrderNo('RAD');

    const order = await this.prisma.radiologyOrder.create({
      data: {
        encounterId: BigInt(dto.encounterId),
        patientId: enc.patientId,
        requesterId: BigInt(dto.requesterId),
        noOrder,
        jenisPemeriksaan: dto.jenisPemeriksaan,
        modalitas: dto.modalitas as any,
        status: 'ORDERED',
        catatanKlinis: dto.catatanKlinis,
        statusRawat: 'Ralan',
      },
    });

    return { ...order, id: Number(order.id) };
  }

  private async generateOrderNo(prefix: string): Promise<string> {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const full = `${prefix}-${dateStr}`;

    const last = prefix === 'LAB'
      ? await this.prisma.labOrder.findFirst({ where: { noOrder: { startsWith: full } }, orderBy: { noOrder: 'desc' }, select: { noOrder: true } })
      : await this.prisma.radiologyOrder.findFirst({ where: { noOrder: { startsWith: full } }, orderBy: { noOrder: 'desc' }, select: { noOrder: true } });

    let seq = 1;
    if (last?.noOrder) seq = parseInt(last.noOrder.slice(-4)) + 1;
    return `${full}-${String(seq).padStart(4, '0')}`;
  }
}
