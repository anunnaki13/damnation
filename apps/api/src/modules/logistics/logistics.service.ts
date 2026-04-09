import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}
  async findAll(page = 1, limit = 20, kategori?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (kategori) where.kategori = kategori;
    const [data, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({ where, skip, take: limit, orderBy: { nama: 'asc' } }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    return { data: data.map((i) => ({ ...i, id: Number(i.id), hargaSatuan: Number(i.hargaSatuan) })), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
  async create(dto: any) {
    const item = await this.prisma.inventoryItem.create({ data: { kode: dto.kode, nama: dto.nama, kategori: dto.kategori, satuan: dto.satuan, stok: dto.stok || 0, stokMinimum: dto.stokMinimum || 5, hargaSatuan: dto.hargaSatuan || 0 } });
    return { ...item, id: Number(item.id) };
  }
  async getStats() {
    const [total, lowStock] = await Promise.all([
      this.prisma.inventoryItem.count(),
      this.prisma.$queryRaw`SELECT COUNT(*) as c FROM inventory_items WHERE stok <= stok_minimum AND stok > 0`.then((r: any) => Number(r[0]?.c || 0)),
    ]);
    return { total, lowStock };
  }
}
