import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';

@Injectable()
export class PractitionersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePractitionerDto) {
    const practitioner = await this.prisma.practitioner.create({
      data: {
        nip: dto.nip,
        nik: dto.nik,
        sipNumber: dto.sipNumber,
        strNumber: dto.strNumber,
        namaLengkap: dto.namaLengkap,
        gelarDepan: dto.gelarDepan,
        gelarBelakang: dto.gelarBelakang,
        jenisKelamin: dto.jenisKelamin,
        spesialisasi: dto.spesialisasi,
        jenisNakes: dto.jenisNakes as any,
        noHp: dto.noHp,
        email: dto.email,
      },
    });
    return this.format(practitioner);
  }

  async findAll(page = 1, limit = 20, spesialisasi?: string) {
    const skip = (page - 1) * limit;
    const where = {
      isActive: true,
      ...(spesialisasi ? { spesialisasi: { contains: spesialisasi } } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.practitioner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { namaLengkap: 'asc' },
        include: {
          schedules: { where: { isActive: true }, include: { location: true } },
        },
      }),
      this.prisma.practitioner.count({ where }),
    ]);

    return {
      data: data.map(this.format),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const p = await this.prisma.practitioner.findUnique({
      where: { id: BigInt(id) },
      include: {
        schedules: { where: { isActive: true }, include: { location: true } },
      },
    });
    if (!p) throw new NotFoundException('Dokter/Nakes tidak ditemukan');
    return this.format(p);
  }

  private format(p: any) {
    return {
      ...p,
      id: Number(p.id),
    };
  }
}
