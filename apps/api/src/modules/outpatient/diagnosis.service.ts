import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';

@Injectable()
export class DiagnosisService {
  constructor(private prisma: PrismaService) {}

  async addDiagnosis(dto: CreateDiagnosisDto) {
    const enc = await this.prisma.encounter.findUnique({ where: { id: BigInt(dto.encounterId) } });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    const diagnosis = await this.prisma.diagnosis.create({
      data: {
        encounterId: BigInt(dto.encounterId),
        patientId: enc.patientId,
        icd10Code: dto.icd10Code,
        icd10Display: dto.icd10Display,
        tipe: dto.tipe as any || 'PRIMER',
        rankOrder: dto.rankOrder || 1,
        statusRawat: 'Ralan',
        statusPenyakit: dto.statusPenyakit || 'Baru',
        createdBy: dto.createdBy ? BigInt(dto.createdBy) : null,
      },
    });
    return { ...diagnosis, id: Number(diagnosis.id) };
  }

  async removeDiagnosis(id: number) {
    await this.prisma.diagnosis.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { message: 'Diagnosis dihapus' };
  }

  /**
   * Search ICD-10 codes (dari tabel penyakit Khanza)
   */
  async searchIcd10(keyword: string, limit = 20) {
    const data = await this.prisma.penyakit.findMany({
      where: {
        OR: [
          { kdPenyakit: { contains: keyword } },
          { nmPenyakit: { contains: keyword } },
        ],
      },
      take: limit,
      orderBy: { kdPenyakit: 'asc' },
    });
    return data;
  }
}
