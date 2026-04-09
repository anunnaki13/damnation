import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  /**
   * Penerimaan barang — tambah stok
   */
  async receiveStock(dto: { medicineId: number; locationId: number; batchNumber: string; noFaktur?: string; expiredDate?: string; jumlah: number; hargaBeli?: number }) {
    const medicine = await this.prisma.medicine.findUnique({ where: { id: BigInt(dto.medicineId) } });
    if (!medicine) throw new NotFoundException('Obat tidak ditemukan');

    const stock = await this.prisma.medicineStock.create({
      data: {
        medicineId: BigInt(dto.medicineId),
        locationId: BigInt(dto.locationId),
        batchNumber: dto.batchNumber,
        noFaktur: dto.noFaktur,
        expiredDate: dto.expiredDate ? new Date(dto.expiredDate) : null,
        stok: dto.jumlah,
      },
      include: {
        medicine: { select: { kode: true, namaGenerik: true } },
        location: { select: { nama: true } },
      },
    });

    // Update harga beli jika diberikan
    if (dto.hargaBeli) {
      await this.prisma.medicine.update({
        where: { id: BigInt(dto.medicineId) },
        data: { hargaBeli: dto.hargaBeli },
      });
    }

    return { ...stock, id: Number(stock.id), medicineId: Number(stock.medicineId), locationId: Number(stock.locationId) };
  }

  /**
   * Stok opname — koreksi stok
   */
  async adjustStock(stockId: number, newStok: number, alasan: string) {
    const stock = await this.prisma.medicineStock.findUnique({ where: { id: BigInt(stockId) } });
    if (!stock) throw new NotFoundException('Data stok tidak ditemukan');

    const updated = await this.prisma.medicineStock.update({
      where: { id: BigInt(stockId) },
      data: { stok: newStok },
      include: {
        medicine: { select: { kode: true, namaGenerik: true } },
        location: { select: { nama: true } },
      },
    });

    return {
      ...updated,
      id: Number(updated.id),
      previousStok: stock.stok,
      newStok,
      selisih: newStok - stock.stok,
      alasan,
    };
  }

  /**
   * Kartu stok — history per obat
   */
  async getStockByMedicine(medicineId: number) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id: BigInt(medicineId) },
    });
    if (!medicine) throw new NotFoundException('Obat tidak ditemukan');

    const stocks = await this.prisma.medicineStock.findMany({
      where: { medicineId: BigInt(medicineId) },
      include: { location: { select: { id: true, nama: true, kode: true } } },
      orderBy: { expiredDate: 'asc' },
    });

    const totalStok = stocks.reduce((sum, s) => sum + s.stok, 0);

    return {
      medicine: { ...medicine, id: Number(medicine.id) },
      totalStok,
      isLow: totalStok <= medicine.stokMinimum,
      stocks: stocks.map((s) => ({
        ...s,
        id: Number(s.id),
        medicineId: Number(s.medicineId),
        locationId: Number(s.locationId),
        location: { ...s.location, id: Number(s.location.id) },
      })),
    };
  }

  /**
   * Dashboard stok — ringkasan
   */
  async getStockDashboard() {
    const [totalItems, totalWithStock, lowStock, expiringSoon] = await Promise.all([
      this.prisma.medicine.count({ where: { isActive: true } }),
      this.prisma.medicine.count({
        where: { isActive: true, stocks: { some: { stok: { gt: 0 } } } },
      }),
      // Low stock
      this.prisma.$queryRaw`
        SELECT COUNT(DISTINCT m.id) as count
        FROM medicines m
        JOIN medicine_stocks ms ON m.id = ms.medicine_id
        WHERE m.is_active = 1
        GROUP BY m.id
        HAVING SUM(ms.stok) <= m.stok_minimum AND SUM(ms.stok) > 0
      `.then((r: any) => r.length),
      // Expiring in 90 days
      this.prisma.medicineStock.count({
        where: {
          stok: { gt: 0 },
          expiredDate: { lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return { totalItems, totalWithStock, lowStock, expiringSoon };
  }
}
