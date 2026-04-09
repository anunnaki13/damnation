import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}
  async getSummary(month?: number, year?: number) {
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    const [revenue, payments, openBills, closedBills] = await Promise.all([
      this.prisma.bill.aggregate({ where: { tanggal: { gte: start, lt: end }, status: 'CLOSED' }, _sum: { totalBayar: true } }),
      this.prisma.payment.aggregate({ where: { tanggal: { gte: start, lt: end } }, _sum: { jumlah: true }, _count: true }),
      this.prisma.bill.count({ where: { tanggal: { gte: start, lt: end }, status: 'OPEN' } }),
      this.prisma.bill.count({ where: { tanggal: { gte: start, lt: end }, status: 'CLOSED' } }),
    ]);
    return { totalRevenue: Number(revenue._sum.totalBayar || 0), totalPayments: Number(payments._sum.jumlah || 0), paymentCount: payments._count, openBills, closedBills, periode: `${y}-${String(m).padStart(2, '0')}` };
  }
}
