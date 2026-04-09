import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class SurgeryService {
  constructor(private prisma: PrismaService) {}

  async scheduleOperation(dto: {
    encounterId: number; tanggal: string; jamMulai: string;
    jenisTindakan: string; icd9cmCode?: string; operatorId: number;
    anestesiId?: number; diagnosaPra?: string;
  }) {
    const enc = await this.prisma.encounter.findUnique({ where: { id: BigInt(dto.encounterId) } });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    const proc = await this.prisma.procedure.create({
      data: {
        encounterId: BigInt(dto.encounterId),
        icd9cmCode: dto.icd9cmCode,
        icd9cmDisplay: dto.jenisTindakan,
        nmPerawatan: dto.jenisTindakan,
        tanggal: new Date(`${dto.tanggal}T${dto.jamMulai}`),
        practitionerId: BigInt(dto.operatorId),
        catatan: dto.diagnosaPra ? `Diagnosa Pra: ${dto.diagnosaPra}` : null,
        statusRawat: 'Ranap',
        statusBayar: 'Belum',
      },
    });
    return { ...proc, id: Number(proc.id) };
  }

  async getSchedule(date?: string) {
    const target = date ? new Date(date) : new Date();
    target.setHours(0, 0, 0, 0);
    const next = new Date(target); next.setDate(next.getDate() + 1);

    const data = await this.prisma.procedure.findMany({
      where: {
        tanggal: { gte: target, lt: next },
        nmPerawatan: { not: null },
        statusRawat: 'Ranap',
      },
      include: {
        encounter: {
          include: {
            patient: { select: { id: true, noRm: true, namaLengkap: true, jenisKelamin: true, tanggalLahir: true } },
            location: { select: { nama: true } },
          },
        },
        practitioner: { select: { id: true, namaLengkap: true, spesialisasi: true } },
      },
      orderBy: { tanggal: 'asc' },
    });

    return data.map((p) => ({
      ...p, id: Number(p.id), encounterId: Number(p.encounterId),
      practitionerId: p.practitionerId ? Number(p.practitionerId) : null,
      biayaRawat: Number(p.biayaRawat),
      encounter: p.encounter ? {
        ...p.encounter, id: Number(p.encounter.id),
        patient: p.encounter.patient ? { ...p.encounter.patient, id: Number(p.encounter.patient.id) } : undefined,
      } : undefined,
      practitioner: p.practitioner ? { ...p.practitioner, id: Number(p.practitioner.id) } : undefined,
    }));
  }

  async inputLaporanOperasi(procedureId: number, dto: {
    laporanOperasi: string; diagnosaPasca?: string;
    jamMulai?: string; jamSelesai?: string; jenisAnestesi?: string;
  }) {
    const updated = await this.prisma.procedure.update({
      where: { id: BigInt(procedureId) },
      data: {
        catatan: [
          dto.laporanOperasi,
          dto.diagnosaPasca ? `\nDiagnosa Pasca: ${dto.diagnosaPasca}` : '',
          dto.jenisAnestesi ? `\nAnestesi: ${dto.jenisAnestesi}` : '',
          dto.jamMulai ? `\nMulai: ${dto.jamMulai}` : '',
          dto.jamSelesai ? `\nSelesai: ${dto.jamSelesai}` : '',
        ].join(''),
        statusBayar: 'Sudah',
      },
    });
    return { ...updated, id: Number(updated.id) };
  }
}
