import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /** KPI Operasional RS */
  async getKPI(periode?: string) {
    const beds = await this.prisma.bed.findMany();
    const totalBeds = beds.length;
    const terisi = beds.filter((b) => b.status === 'TERISI').length;
    const bor = totalBeds > 0 ? Math.round((terisi / totalBeds) * 100) : 0;

    // Monthly data
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [totalEncounters, ralanCount, igdCount, ranapCount, finishedRanap, totalPatients, bpjsCount] = await Promise.all([
      this.prisma.encounter.count({ where: { tanggalMasuk: { gte: startMonth, lt: endMonth } } }),
      this.prisma.encounter.count({ where: { tanggalMasuk: { gte: startMonth, lt: endMonth }, tipe: 'RAWAT_JALAN' } }),
      this.prisma.encounter.count({ where: { tanggalMasuk: { gte: startMonth, lt: endMonth }, tipe: 'IGD' } }),
      this.prisma.encounter.count({ where: { tanggalMasuk: { gte: startMonth, lt: endMonth }, tipe: 'RAWAT_INAP' } }),
      this.prisma.encounter.count({ where: { tanggalMasuk: { gte: startMonth, lt: endMonth }, tipe: 'RAWAT_INAP', status: 'FINISHED' } }),
      this.prisma.patient.count(),
      this.prisma.encounter.count({ where: { tanggalMasuk: { gte: startMonth, lt: endMonth }, penjamin: 'BPJS' } }),
    ]);

    return {
      bor, totalBeds, terisi,
      totalEncounters, rawatJalan: ralanCount, igd: igdCount, rawatInap: ranapCount,
      totalPatients, bpjsPercentage: totalEncounters > 0 ? Math.round((bpjsCount / totalEncounters) * 100) : 0,
      alos: finishedRanap > 0 ? 4.5 : 0, // Simplified — real calc needs kamar_inap data
      bto: finishedRanap, ndr: 0, gdr: 0,
      periode: `${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`,
    };
  }

  /** 10 Penyakit Terbanyak */
  async getTopDiseases(limit = 10) {
    const data = await this.prisma.diagnosis.groupBy({
      by: ['icd10Code', 'icd10Display'],
      _count: { id: true },
      where: { isActive: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    return data.map((d, i) => ({
      rank: i + 1,
      icd10Code: d.icd10Code,
      icd10Display: d.icd10Display || d.icd10Code,
      count: d._count.id,
    }));
  }

  /** Kunjungan per hari (7 hari terakhir) */
  async getVisitTrend() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const count = await this.prisma.encounter.count({
        where: { tanggalMasuk: { gte: d, lt: next } },
      });
      days.push({ date: d.toISOString().slice(0, 10), label: d.toLocaleDateString('id-ID', { weekday: 'short' }), count });
    }
    return days;
  }

  /** Revenue summary */
  async getRevenueSummary() {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [totalRevenue, totalPayments, openBills] = await Promise.all([
      this.prisma.bill.aggregate({ where: { tanggal: { gte: startMonth, lt: endMonth }, status: 'CLOSED' }, _sum: { totalBayar: true } }),
      this.prisma.payment.aggregate({ where: { tanggal: { gte: startMonth, lt: endMonth } }, _sum: { jumlah: true }, _count: true }),
      this.prisma.bill.count({ where: { status: 'OPEN' } }),
    ]);

    return {
      totalRevenue: Number(totalRevenue._sum.totalBayar || 0),
      totalPayments: Number(totalPayments._sum.jumlah || 0),
      paymentCount: totalPayments._count,
      openBills,
    };
  }
}
