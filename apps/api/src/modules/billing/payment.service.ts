import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { BillingService } from './billing.service';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {}

  /**
   * Proses pembayaran
   */
  async processPayment(dto: {
    billId: number;
    jumlah: number;
    metode: string;
    namaBayar?: string;
    referensi?: string;
    kasirId?: number;
  }) {
    const bill = await this.prisma.bill.findUnique({ where: { id: BigInt(dto.billId) } });
    if (!bill) throw new NotFoundException('Billing tidak ditemukan');
    if (bill.status === 'CLOSED') throw new BadRequestException('Billing sudah lunas');
    if (bill.status === 'VOID') throw new BadRequestException('Billing sudah dibatalkan');

    const payment = await this.prisma.payment.create({
      data: {
        billId: BigInt(dto.billId),
        tanggal: new Date(),
        jumlah: dto.jumlah,
        metode: dto.metode as any,
        namaBayar: dto.namaBayar,
        referensi: dto.referensi,
        kasirId: dto.kasirId ? BigInt(dto.kasirId) : null,
      },
    });

    // Recalculate bill
    await this.billingService.recalculate(dto.billId);

    const updatedBill = await this.billingService.getBillById(dto.billId);

    return {
      payment: { ...payment, id: Number(payment.id), jumlah: Number(payment.jumlah) },
      bill: updatedBill,
      kembalian: dto.jumlah > Number(bill.sisaBayar) ? dto.jumlah - Number(bill.sisaBayar) : 0,
    };
  }

  /**
   * Riwayat pembayaran per bill
   */
  async getPaymentsByBill(billId: number) {
    const data = await this.prisma.payment.findMany({
      where: { billId: BigInt(billId) },
      orderBy: { tanggal: 'desc' },
    });
    return data.map((p) => ({
      ...p, id: Number(p.id), billId: Number(p.billId), jumlah: Number(p.jumlah),
      kasirId: p.kasirId ? Number(p.kasirId) : null,
    }));
  }
}
