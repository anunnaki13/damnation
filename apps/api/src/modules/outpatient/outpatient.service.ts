import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class OutpatientService {
  constructor(private prisma: PrismaService) {}

  /**
   * Worklist rawat jalan per dokter atau per poli
   */
  async getWorklist(filters: { practitionerId?: number; locationId?: number; date?: string }) {
    const targetDate = filters.date ? new Date(filters.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const where: any = {
      tipe: 'RAWAT_JALAN',
      tanggalMasuk: { gte: targetDate, lt: nextDay },
      status: { notIn: ['CANCELLED'] },
    };
    if (filters.practitionerId) where.practitionerId = BigInt(filters.practitionerId);
    if (filters.locationId) where.locationId = BigInt(filters.locationId);

    const data = await this.prisma.encounter.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true, noRm: true, namaLengkap: true, jenisKelamin: true,
            tanggalLahir: true, noBpjs: true, alergiObat: true, noHp: true,
          },
        },
        practitioner: { select: { id: true, namaLengkap: true, spesialisasi: true } },
        location: { select: { id: true, nama: true, kode: true } },
        medicalRecords: { where: { tipe: 'SOAP' }, take: 1 },
        diagnoses: true,
        prescriptions: { take: 1 },
      },
      orderBy: { noReg: 'asc' },
    });

    return data.map((enc) => ({
      ...this.fmt(enc),
      hasSOAP: enc.medicalRecords.length > 0,
      hasDiagnosis: enc.diagnoses.length > 0,
      hasPrescription: enc.prescriptions.length > 0,
    }));
  }

  /**
   * Detail encounter lengkap untuk layar poliklinik
   */
  async getEncounterDetail(id: number) {
    const enc = await this.prisma.encounter.findUnique({
      where: { id: BigInt(id) },
      include: {
        patient: true,
        practitioner: true,
        location: true,
        medicalRecords: { orderBy: { createdAt: 'desc' } },
        diagnoses: { orderBy: { rankOrder: 'asc' } },
        procedures: { orderBy: { tanggal: 'desc' } },
        observations: { orderBy: { effectiveAt: 'desc' } },
        prescriptions: {
          include: { items: { include: { medicine: { select: { id: true, kode: true, namaGenerik: true, namaDagang: true, satuan: true } } } } },
          orderBy: { createdAt: 'desc' },
        },
        labOrders: { include: { items: { include: { results: true } } }, orderBy: { createdAt: 'desc' } },
        radiologyOrders: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!enc) throw new NotFoundException('Kunjungan tidak ditemukan');

    // Riwayat kunjungan sebelumnya
    const history = await this.prisma.encounter.findMany({
      where: {
        patientId: enc.patientId,
        id: { not: enc.id },
        status: 'FINISHED',
      },
      include: {
        diagnoses: true,
        location: { select: { nama: true } },
        practitioner: { select: { namaLengkap: true } },
      },
      orderBy: { tanggalMasuk: 'desc' },
      take: 5,
    });

    return {
      ...this.fmt(enc),
      history: history.map(this.fmt),
    };
  }

  /**
   * Update status encounter ke IN_PROGRESS (mulai periksa)
   */
  async startExamination(id: number) {
    return this.prisma.encounter.update({
      where: { id: BigInt(id) },
      data: { status: 'IN_PROGRESS' },
    });
  }

  /**
   * Selesaikan kunjungan rawat jalan
   */
  async finishEncounter(id: number) {
    return this.prisma.encounter.update({
      where: { id: BigInt(id) },
      data: { status: 'FINISHED', tanggalKeluar: new Date() },
    });
  }

  private fmt(enc: any): any {
    return {
      ...enc,
      id: Number(enc.id),
      patientId: Number(enc.patientId),
      practitionerId: enc.practitionerId ? Number(enc.practitionerId) : null,
      locationId: Number(enc.locationId),
      createdBy: enc.createdBy ? Number(enc.createdBy) : null,
      biayaReg: enc.biayaReg ? Number(enc.biayaReg) : null,
      patient: enc.patient ? { ...enc.patient, id: Number(enc.patient.id) } : undefined,
      practitioner: enc.practitioner ? { ...enc.practitioner, id: Number(enc.practitioner.id) } : undefined,
      location: enc.location ? { ...enc.location, id: Number(enc.location.id) } : undefined,
    };
  }
}
