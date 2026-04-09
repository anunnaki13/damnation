import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLocationDto) {
    const existing = await this.prisma.location.findUnique({ where: { kode: dto.kode } });
    if (existing) throw new ConflictException(`Kode lokasi ${dto.kode} sudah digunakan`);

    const location = await this.prisma.location.create({
      data: {
        kode: dto.kode,
        nama: dto.nama,
        tipe: dto.tipe as any,
        lantai: dto.lantai,
        gedung: dto.gedung,
        parentId: dto.parentId ? BigInt(dto.parentId) : null,
        kapasitasBed: dto.kapasitasBed ?? 0,
      },
      include: { parent: true },
    });
    return this.format(location);
  }

  async findAll(tipe?: string) {
    const where = {
      isActive: true,
      ...(tipe ? { tipe: tipe as any } : {}),
    };

    const data = await this.prisma.location.findMany({
      where,
      include: { parent: true, children: true },
      orderBy: { nama: 'asc' },
    });

    return data.map(this.format);
  }

  async findById(id: number) {
    const loc = await this.prisma.location.findUnique({
      where: { id: BigInt(id) },
      include: {
        parent: true,
        children: { where: { isActive: true } },
        beds: true,
        schedules: {
          where: { isActive: true },
          include: { practitioner: true },
        },
      },
    });
    if (!loc) throw new NotFoundException('Lokasi tidak ditemukan');
    return this.format(loc);
  }

  async update(id: number, dto: UpdateLocationDto) {
    await this.findById(id);
    const updated = await this.prisma.location.update({
      where: { id: BigInt(id) },
      data: {
        nama: dto.nama,
        tipe: dto.tipe as any,
        lantai: dto.lantai,
        gedung: dto.gedung,
        parentId: dto.parentId !== undefined ? (dto.parentId ? BigInt(dto.parentId) : null) : undefined,
        kapasitasBed: dto.kapasitasBed,
        isActive: dto.isActive,
      },
      include: { parent: true },
    });
    return this.format(updated);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.prisma.location.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { message: 'Lokasi berhasil dinonaktifkan' };
  }

  private format(loc: any) {
    return {
      ...loc,
      id: Number(loc.id),
      parentId: loc.parentId ? Number(loc.parentId) : null,
      parent: loc.parent ? { ...loc.parent, id: Number(loc.parent.id) } : undefined,
      children: loc.children?.map((c: any) => ({ ...c, id: Number(c.id) })),
      beds: loc.beds?.map((b: any) => ({ ...b, id: Number(b.id), locationId: Number(b.locationId) })),
      schedules: loc.schedules?.map((s: any) => ({
        ...s,
        id: Number(s.id),
        practitionerId: Number(s.practitionerId),
        locationId: Number(s.locationId),
        practitioner: s.practitioner ? { ...s.practitioner, id: Number(s.practitioner.id) } : undefined,
      })),
    };
  }
}
