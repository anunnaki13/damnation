import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface StockPrediction {
  medicineId: number;
  kode: string;
  namaGenerik: string;
  currentStock: number;
  avgDailyUsage: number;
  daysUntilStockout: number | null;
  predictedStockoutDate: string | null;
  stokMinimum: number;
  isUrgent: boolean; // < 7 days
  isCritical: boolean; // < 3 days
}

@Injectable()
export class StockPredictionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Predict stockout dates for all active medicines
   */
  async getPredictions(daysThreshold = 7): Promise<{ predictions: StockPrediction[]; summary: any }> {
    // Get all medicines with current stock
    const medicines = await this.prisma.medicine.findMany({
      where: { isActive: true },
      include: { stocks: { where: { stok: { gt: 0 } } } },
    });

    // Get dispensing data for last 30 days to calculate avg usage
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dispensed = await this.prisma.prescriptionItem.groupBy({
      by: ['medicineId'],
      _sum: { jumlah: true },
      where: {
        prescription: { tglPenyerahan: { gte: thirtyDaysAgo } },
      },
    });

    const usageMap = new Map<bigint, number>();
    dispensed.forEach((d) => usageMap.set(d.medicineId, Number(d._sum.jumlah || 0)));

    const predictions: StockPrediction[] = [];

    for (const med of medicines) {
      const totalStock = med.stocks.reduce((s, st) => s + st.stok, 0);
      if (totalStock <= 0) continue;

      const totalUsed30d = usageMap.get(med.id) || 0;
      const avgDaily = totalUsed30d / 30;

      let daysUntilStockout: number | null = null;
      let predictedDate: string | null = null;

      if (avgDaily > 0) {
        daysUntilStockout = Math.floor(totalStock / avgDaily);
        const d = new Date();
        d.setDate(d.getDate() + daysUntilStockout);
        predictedDate = d.toISOString().slice(0, 10);
      }

      predictions.push({
        medicineId: Number(med.id),
        kode: med.kode,
        namaGenerik: med.namaGenerik,
        currentStock: totalStock,
        avgDailyUsage: Math.round(avgDaily * 10) / 10,
        daysUntilStockout,
        predictedStockoutDate: predictedDate,
        stokMinimum: med.stokMinimum,
        isUrgent: daysUntilStockout !== null && daysUntilStockout <= 7,
        isCritical: daysUntilStockout !== null && daysUntilStockout <= 3,
      });
    }

    // Sort: critical first, then urgent, then by days
    predictions.sort((a, b) => {
      if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
      if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
      return (a.daysUntilStockout ?? 999) - (b.daysUntilStockout ?? 999);
    });

    const urgent = predictions.filter((p) => p.isUrgent).length;
    const critical = predictions.filter((p) => p.isCritical).length;

    return {
      predictions: predictions.filter((p) => p.daysUntilStockout !== null && p.daysUntilStockout <= daysThreshold),
      summary: { totalTracked: predictions.length, urgent, critical, threshold: daysThreshold },
    };
  }
}
