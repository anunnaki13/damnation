import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class NutritionService {
  constructor(private prisma: PrismaService) {}

  /** Order diet pasien rawat inap */
  async getActiveOrders() {
    const inpatients = await this.prisma.encounter.findMany({
      where: { tipe: 'RAWAT_INAP', status: 'IN_PROGRESS' },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true, alergiMakanan: true } },
        location: { select: { nama: true } },
        bed: { select: { nomorBed: true } },
        medicalRecords: { where: { tipe: 'ADIME' }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return inpatients.map((e) => ({
      encounterId: Number(e.id), noRawat: e.noRawat,
      patient: { id: Number(e.patient.id), noRm: e.patient.noRm, namaLengkap: e.patient.namaLengkap, alergiMakanan: e.patient.alergiMakanan },
      bangsal: e.location.nama, bed: e.bed?.nomorBed,
      hasADIME: e.medicalRecords.length > 0,
    }));
  }

  /** Input asesmen gizi ADIME */
  async inputADIME(dto: {
    encounterId: number; practitionerId: number;
    assessment: string; diagnosis: string; intervention: string; monitoring: string; evaluation: string;
  }) {
    const enc = await this.prisma.encounter.findUnique({ where: { id: BigInt(dto.encounterId) } });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    const record = await this.prisma.medicalRecord.create({
      data: {
        encounterId: BigInt(dto.encounterId),
        patientId: enc.patientId,
        practitionerId: BigInt(dto.practitionerId),
        tipe: 'ADIME',
        adimeAssessment: dto.assessment,
        adimeDiagnosis: dto.diagnosis,
        adimeIntervention: dto.intervention,
        adimeMonitoring: dto.monitoring,
        adimeEvaluation: dto.evaluation,
      },
    });
    return { ...record, id: Number(record.id) };
  }
}
