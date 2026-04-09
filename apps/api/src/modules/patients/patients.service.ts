import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientDto } from './dto/search-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePatientDto, createdBy?: number) {
    // Check duplicate NIK
    if (dto.nik) {
      const existing = await this.prisma.patient.findUnique({
        where: { nik: dto.nik },
      });
      if (existing) {
        throw new ConflictException(`Pasien dengan NIK ${dto.nik} sudah terdaftar`);
      }
    }

    // Generate No. RM
    const noRm = await this.generateNoRM();

    const patient = await this.prisma.patient.create({
      data: {
        noRm,
        nik: dto.nik,
        noBpjs: dto.noBpjs,
        namaLengkap: dto.namaLengkap,
        tempatLahir: dto.tempatLahir,
        tanggalLahir: new Date(dto.tanggalLahir),
        jenisKelamin: dto.jenisKelamin,
        golonganDarah: dto.golonganDarah,
        agama: dto.agama,
        statusNikah: dto.statusNikah,
        pekerjaan: dto.pekerjaan,
        alamat: dto.alamat,
        rt: dto.rt,
        rw: dto.rw,
        kelurahan: dto.kelurahan,
        kecamatan: dto.kecamatan,
        kabupaten: dto.kabupaten,
        provinsi: dto.provinsi,
        kodePos: dto.kodePos,
        noTelp: dto.noTelp,
        noHp: dto.noHp,
        email: dto.email,
        namaIbu: dto.namaIbu,
        namaPj: dto.namaPj,
        hubunganPj: dto.hubunganPj,
        alamatPj: dto.alamatPj,
        telpPj: dto.telpPj,
        createdBy: createdBy ? BigInt(createdBy) : null,
      },
    });

    return this.formatPatient(patient);
  }

  async search(dto: SearchPatientDto) {
    const { keyword, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const where = keyword
      ? {
          OR: [
            { noRm: { contains: keyword } },
            { nik: { contains: keyword } },
            { noBpjs: { contains: keyword } },
            { namaLengkap: { contains: keyword } },
            { noHp: { contains: keyword } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: data.map(this.formatPatient),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: BigInt(id) },
      include: {
        encounters: {
          orderBy: { tanggalMasuk: 'desc' },
          take: 10,
        },
      },
    });
    if (!patient) throw new NotFoundException('Pasien tidak ditemukan');
    return this.formatPatient(patient);
  }

  async update(id: number, dto: UpdatePatientDto) {
    await this.findById(id);
    const updated = await this.prisma.patient.update({
      where: { id: BigInt(id) },
      data: {
        ...dto,
        tanggalLahir: dto.tanggalLahir ? new Date(dto.tanggalLahir) : undefined,
      },
    });
    return this.formatPatient(updated);
  }

  private async generateNoRM(): Promise<string> {
    const lastPatient = await this.prisma.patient.findFirst({
      orderBy: { id: 'desc' },
      select: { noRm: true },
    });

    let nextNum = 1;
    if (lastPatient?.noRm) {
      const match = lastPatient.noRm.match(/PB-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }

    return `PB-${nextNum.toString().padStart(6, '0')}`;
  }

  private formatPatient(patient: any) {
    return {
      ...patient,
      id: Number(patient.id),
      createdBy: patient.createdBy ? Number(patient.createdBy) : null,
    };
  }
}
