import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { TriaseDto } from './dto/triase.dto';

@Injectable()
export class EmergencyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registrasi cepat IGD — bisa tanpa data lengkap (pasien tak dikenal)
   */
  async quickRegister(dto: CreateEmergencyDto, createdBy?: number) {
    let patientId: bigint;

    if (dto.patientId) {
      // Pasien sudah dikenal
      const patient = await this.prisma.patient.findUnique({ where: { id: BigInt(dto.patientId) } });
      if (!patient) throw new NotFoundException('Pasien tidak ditemukan');
      patientId = patient.id;
    } else {
      // Pasien tak dikenal — buat record minimal
      const noRm = await this.generateNoRM();
      const patient = await this.prisma.patient.create({
        data: {
          noRm,
          namaLengkap: dto.namaLengkap || 'PASIEN IGD - BELUM DIIDENTIFIKASI',
          tanggalLahir: dto.tanggalLahir ? new Date(dto.tanggalLahir) : new Date('1970-01-01'),
          jenisKelamin: (dto.jenisKelamin || 'L') as any,
          alamat: dto.alamat,
          noHp: dto.noHp,
          createdBy: createdBy ? BigInt(createdBy) : null,
        },
      });
      patientId = patient.id;
    }

    // Generate no_rawat
    const noRawat = await this.generateNoRawat();

    // Cari lokasi IGD
    const igdLocation = await this.prisma.location.findFirst({
      where: { tipe: 'IGD', isActive: true },
    });
    if (!igdLocation) throw new BadRequestException('Lokasi IGD belum dikonfigurasi');

    const encounter = await this.prisma.encounter.create({
      data: {
        noRawat,
        patientId,
        practitionerId: dto.practitionerId ? BigInt(dto.practitionerId) : null,
        locationId: igdLocation.id,
        tipe: 'IGD',
        status: 'ARRIVED',
        penjamin: (dto.penjamin || 'UMUM') as any,
        kdPj: dto.kdPj,
        tanggalMasuk: new Date(),
        triaseLevel: dto.triaseLevel as any,
        caraMasuk: (dto.caraMasuk || 'SENDIRI') as any,
        sttsDaftar: 'Baru',
        createdBy: createdBy ? BigInt(createdBy) : null,
      },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true, jenisKelamin: true, tanggalLahir: true } },
        practitioner: { select: { id: true, namaLengkap: true } },
        location: { select: { id: true, nama: true } },
      },
    });

    return this.fmt(encounter);
  }

  /**
   * Input/update triase ESI
   */
  async setTriase(encounterId: number, dto: TriaseDto) {
    const enc = await this.prisma.encounter.findUnique({ where: { id: BigInt(encounterId) } });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    // Simpan triase sebagai medical record
    await this.prisma.medicalRecord.create({
      data: {
        encounterId: BigInt(encounterId),
        patientId: enc.patientId,
        practitionerId: BigInt(dto.practitionerId),
        tipe: 'ASESMEN_AWAL',
        subjective: dto.keluhanUtama,
        objective: [
          dto.primarySurvey ? `Primary Survey: ${dto.primarySurvey}` : '',
          dto.secondarySurvey ? `Secondary Survey: ${dto.secondarySurvey}` : '',
          dto.mekanismeCedera ? `Mekanisme Cedera: ${dto.mekanismeCedera}` : '',
        ].filter(Boolean).join('\n'),
        assessment: `Triase ESI Level ${dto.triaseLevel?.replace('ESI_', '')} — ${dto.kesimpulan || ''}`,
        plan: dto.tindakanAwal,
        tekananDarahSistolik: dto.tekananDarahSistolik,
        tekananDarahDiastolik: dto.tekananDarahDiastolik,
        nadi: dto.nadi,
        suhu: dto.suhu,
        pernapasan: dto.pernapasan,
        spo2: dto.spo2,
      },
    });

    // Update triase level di encounter
    const updated = await this.prisma.encounter.update({
      where: { id: BigInt(encounterId) },
      data: {
        triaseLevel: dto.triaseLevel as any,
        status: 'IN_PROGRESS',
      },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true } },
        location: { select: { id: true, nama: true } },
      },
    });

    return this.fmt(updated);
  }

  /**
   * Worklist IGD — urut by triase level
   */
  async getWorklist(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const data = await this.prisma.encounter.findMany({
      where: {
        tipe: 'IGD',
        tanggalMasuk: { gte: targetDate, lt: nextDay },
        status: { notIn: ['CANCELLED'] },
      },
      include: {
        patient: {
          select: { id: true, noRm: true, namaLengkap: true, jenisKelamin: true, tanggalLahir: true, noBpjs: true, alergiObat: true },
        },
        practitioner: { select: { id: true, namaLengkap: true } },
        location: { select: { id: true, nama: true } },
        medicalRecords: { where: { tipe: 'ASESMEN_AWAL' }, take: 1 },
        diagnoses: true,
      },
      orderBy: [
        { triaseLevel: 'asc' }, // ESI_1 first
        { tanggalMasuk: 'asc' },
      ],
    });

    return data.map((enc) => ({
      ...this.fmt(enc),
      hasTriase: !!enc.triaseLevel,
      hasAssessment: enc.medicalRecords.length > 0,
      hasDiagnosis: enc.diagnoses.length > 0,
    }));
  }

  /**
   * Disposisi pasien IGD
   */
  async disposisi(encounterId: number, dto: { disposisi: string; catatan?: string; rujukKe?: string }) {
    const enc = await this.prisma.encounter.findUnique({ where: { id: BigInt(encounterId) } });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    const caraKeluarMap: Record<string, string> = {
      'PULANG': 'ATAS_PERSETUJUAN',
      'RAWAT_INAP': 'ATAS_PERSETUJUAN',
      'RUJUK': 'DIRUJUK',
      'PULANG_PAKSA': 'PULANG_PAKSA',
      'DOA': 'MENINGGAL',
      'MENINGGAL': 'MENINGGAL',
    };

    const updated = await this.prisma.encounter.update({
      where: { id: BigInt(encounterId) },
      data: {
        status: 'FINISHED',
        tanggalKeluar: new Date(),
        caraKeluar: (caraKeluarMap[dto.disposisi] || 'ATAS_PERSETUJUAN') as any,
      },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true } },
      },
    });

    return {
      ...this.fmt(updated),
      disposisi: dto.disposisi,
      catatan: dto.catatan,
    };
  }

  /**
   * Statistik IGD hari ini
   */
  async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const where = { tipe: 'IGD' as any, tanggalMasuk: { gte: today, lt: tomorrow } };

    const [total, esi1, esi2, esi3, esi4, esi5, finished] = await Promise.all([
      this.prisma.encounter.count({ where }),
      this.prisma.encounter.count({ where: { ...where, triaseLevel: 'ESI_1' } }),
      this.prisma.encounter.count({ where: { ...where, triaseLevel: 'ESI_2' } }),
      this.prisma.encounter.count({ where: { ...where, triaseLevel: 'ESI_3' } }),
      this.prisma.encounter.count({ where: { ...where, triaseLevel: 'ESI_4' } }),
      this.prisma.encounter.count({ where: { ...where, triaseLevel: 'ESI_5' } }),
      this.prisma.encounter.count({ where: { ...where, status: 'FINISHED' } }),
    ]);

    return { total, esi1, esi2, esi3, esi4, esi5, active: total - finished, finished };
  }

  // --- Helpers ---

  private async generateNoRM(): Promise<string> {
    const last = await this.prisma.patient.findFirst({ orderBy: { id: 'desc' }, select: { noRm: true } });
    let num = 1;
    if (last?.noRm) { const m = last.noRm.match(/(\d+)/); if (m) num = parseInt(m[1]) + 1; }
    return `PB-${num.toString().padStart(6, '0')}`;
  }

  private async generateNoRawat(): Promise<string> {
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    const last = await this.prisma.encounter.findFirst({
      where: { noRawat: { startsWith: dateStr } },
      orderBy: { noRawat: 'desc' },
      select: { noRawat: true },
    });
    let seq = 1;
    if (last?.noRawat) { const p = last.noRawat.split('/'); seq = parseInt(p[3] || '0') + 1; }
    return `${dateStr}/${String(seq).padStart(6, '0')}`;
  }

  private fmt(enc: any): any {
    return {
      ...enc,
      id: Number(enc.id),
      patientId: Number(enc.patientId),
      practitionerId: enc.practitionerId ? Number(enc.practitionerId) : null,
      locationId: Number(enc.locationId),
      biayaReg: enc.biayaReg ? Number(enc.biayaReg) : null,
      patient: enc.patient ? { ...enc.patient, id: Number(enc.patient.id) } : undefined,
      practitioner: enc.practitioner ? { ...enc.practitioner, id: Number(enc.practitioner.id) } : undefined,
      location: enc.location ? { ...enc.location, id: Number(enc.location.id) } : undefined,
    };
  }
}
