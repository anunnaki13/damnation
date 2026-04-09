import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMedicineDto) {
    const existing = await this.prisma.medicine.findUnique({ where: { kode: dto.kode } });
    if (existing) throw new ConflictException(`Kode obat ${dto.kode} sudah ada`);

    const medicine = await this.prisma.medicine.create({
      data: {
        kode: dto.kode,
        namaGenerik: dto.namaGenerik,
        namaDagang: dto.namaDagang,
        satuan: dto.satuan,
        kategori: dto.kategori as any,
        golongan: dto.golongan as any,
        hargaBeli: dto.hargaBeli ?? 0,
        hargaJual: dto.hargaJual ?? 0,
        stokMinimum: dto.stokMinimum ?? 10,
        isFormularium: dto.isFormularium ?? true,
      },
    });
    return this.format(medicine);
  }

  async findAll(page = 1, limit = 20, keyword?: string, kategori?: string) {
    const skip = (page - 1) * limit;
    const where = {
      isActive: true,
      ...(kategori ? { kategori: kategori as any } : {}),
      ...(keyword ? {
        OR: [
          { kode: { contains: keyword } },
          { namaGenerik: { contains: keyword } },
          { namaDagang: { contains: keyword } },
        ],
      } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { namaGenerik: 'asc' },
        include: {
          stocks: {
            include: { location: { select: { id: true, nama: true, kode: true } } },
          },
        },
      }),
      this.prisma.medicine.count({ where }),
    ]);

    return {
      data: data.map(this.format),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const med = await this.prisma.medicine.findUnique({
      where: { id: BigInt(id) },
      include: {
        stocks: {
          include: { location: { select: { id: true, nama: true, kode: true } } },
          orderBy: { expiredDate: 'asc' },
        },
      },
    });
    if (!med) throw new NotFoundException('Obat tidak ditemukan');
    return this.format(med);
  }

  async update(id: number, dto: UpdateMedicineDto) {
    await this.findById(id);
    const updated = await this.prisma.medicine.update({
      where: { id: BigInt(id) },
      data: {
        namaGenerik: dto.namaGenerik,
        namaDagang: dto.namaDagang,
        satuan: dto.satuan,
        kategori: dto.kategori as any,
        golongan: dto.golongan as any,
        hargaBeli: dto.hargaBeli,
        hargaJual: dto.hargaJual,
        stokMinimum: dto.stokMinimum,
        isFormularium: dto.isFormularium,
        isActive: dto.isActive,
      },
    });
    return this.format(updated);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.prisma.medicine.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { message: 'Obat berhasil dinonaktifkan' };
  }

  async getStockSummary() {
    const lowStock = await this.prisma.medicine.findMany({
      where: {
        isActive: true,
        stocks: { some: {} },
      },
      include: {
        stocks: true,
      },
    });

    const alerts = lowStock
      .map((med) => {
        const totalStok = med.stocks.reduce((sum, s) => sum + s.stok, 0);
        return { ...this.format(med), totalStok, isLow: totalStok <= med.stokMinimum };
      })
      .filter((m) => m.isLow);

    return { lowStockCount: alerts.length, items: alerts };
  }

  async getExpiringSoon(days = 90) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);

    const stocks = await this.prisma.medicineStock.findMany({
      where: {
        expiredDate: { lte: deadline },
        stok: { gt: 0 },
      },
      include: {
        medicine: { select: { id: true, kode: true, namaGenerik: true } },
        location: { select: { id: true, nama: true } },
      },
      orderBy: { expiredDate: 'asc' },
    });

    return stocks.map((s) => ({
      ...s,
      id: Number(s.id),
      medicineId: Number(s.medicineId),
      locationId: Number(s.locationId),
      medicine: { ...s.medicine, id: Number(s.medicine.id) },
      location: { ...s.location, id: Number(s.location.id) },
    }));
  }

  private format(med: any) {
    return {
      ...med,
      id: Number(med.id),
      hargaBeli: med.hargaBeli ? Number(med.hargaBeli) : 0,
      hargaJual: med.hargaJual ? Number(med.hargaJual) : 0,
      stocks: med.stocks?.map((s: any) => ({
        ...s,
        id: Number(s.id),
        medicineId: Number(s.medicineId),
        locationId: Number(s.locationId),
        location: s.location ? { ...s.location, id: Number(s.location.id) } : undefined,
      })),
    };
  }
}
