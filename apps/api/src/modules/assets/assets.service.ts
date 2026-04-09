import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}
  async findAll(page = 1, limit = 20, kategori?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (kategori) where.kategori = kategori;
    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.asset.count({ where }),
    ]);
    return { data: data.map((a) => ({ ...a, id: Number(a.id), hargaPerolehan: a.hargaPerolehan ? Number(a.hargaPerolehan) : null })), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
  async create(dto: any) {
    const asset = await this.prisma.asset.create({ data: { kodeAset: dto.kodeAset, nama: dto.nama, kategori: dto.kategori, merk: dto.merk, serialNumber: dto.serialNumber, tahunPerolehan: dto.tahunPerolehan, hargaPerolehan: dto.hargaPerolehan, umurEkonomis: dto.umurEkonomis, lokasi: dto.lokasi, kondisi: dto.kondisi || 'BAIK' } });
    return { ...asset, id: Number(asset.id) };
  }
  async getStats() {
    const [total, baik, rusak, dihapuskan] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.asset.count({ where: { kondisi: 'BAIK' } }),
      this.prisma.asset.count({ where: { kondisi: { in: ['RUSAK_RINGAN', 'RUSAK_BERAT'] } } }),
      this.prisma.asset.count({ where: { kondisi: 'DIHAPUSKAN' } }),
    ]);
    return { total, baik, rusak, dihapuskan };
  }
}
