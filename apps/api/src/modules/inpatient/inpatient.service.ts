import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class InpatientService {
  constructor(private prisma: PrismaService) {}

  /**
   * Admisi rawat inap — assign bed
   */
  async admitPatient(dto: {
    patientId: number; bedId: number; practitionerId?: number;
    penjamin?: string; kdPj?: string; diagnosaAwal?: string;
  }, createdBy?: number) {
    const patient = await this.prisma.patient.findUnique({ where: { id: BigInt(dto.patientId) } });
    if (!patient) throw new NotFoundException('Pasien tidak ditemukan');

    const bed = await this.prisma.bed.findUnique({
      where: { id: BigInt(dto.bedId) },
      include: { location: true },
    });
    if (!bed) throw new NotFoundException('Bed tidak ditemukan');
    if (bed.status !== 'TERSEDIA') throw new BadRequestException('Bed tidak tersedia');

    const noRawat = await this.generateNoRawat();

    // Create encounter
    const encounter = await this.prisma.encounter.create({
      data: {
        noRawat,
        patientId: BigInt(dto.patientId),
        practitionerId: dto.practitionerId ? BigInt(dto.practitionerId) : null,
        locationId: bed.locationId,
        tipe: 'RAWAT_INAP',
        kelasRawat: bed.kelas.replace('KELAS_', 'KELAS_') as any,
        status: 'IN_PROGRESS',
        penjamin: (dto.penjamin || 'UMUM') as any,
        kdPj: dto.kdPj,
        tanggalMasuk: new Date(),
        bedId: bed.id,
        sttsDaftar: 'Baru',
        createdBy: createdBy ? BigInt(createdBy) : null,
      },
    });

    // Create kamar_inap record
    await this.prisma.kamarInap.create({
      data: {
        encounterId: encounter.id,
        bedId: bed.id,
        tarifKamar: bed.tarifPerHari,
        diagnosaAwal: dto.diagnosaAwal,
        tglMasuk: new Date(),
        jamMasuk: new Date(),
      },
    });

    // Update bed status
    await this.prisma.bed.update({
      where: { id: bed.id },
      data: { status: 'TERISI' },
    });

    return { encounterId: Number(encounter.id), noRawat, bed: bed.nomorBed, bangsal: bed.location.nama };
  }

  /**
   * Worklist rawat inap — semua pasien yang sedang dirawat
   */
  async getWorklist(locationId?: number) {
    const where: any = { tipe: 'RAWAT_INAP', status: 'IN_PROGRESS' };
    if (locationId) where.locationId = BigInt(locationId);

    const data = await this.prisma.encounter.findMany({
      where,
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true, jenisKelamin: true, tanggalLahir: true, alergiObat: true } },
        practitioner: { select: { id: true, namaLengkap: true, spesialisasi: true } },
        location: { select: { id: true, nama: true } },
        bed: { select: { id: true, nomorBed: true, kelas: true } },
        kamarInap: { orderBy: { tglMasuk: 'desc' }, take: 1 },
        diagnoses: { where: { isActive: true } },
        medicalRecords: { where: { tipe: 'CPPT' }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: [{ location: { nama: 'asc' } }, { tanggalMasuk: 'asc' }],
    });

    return data.map((enc) => {
      const ki = enc.kamarInap[0];
      const hariRawat = ki ? Math.ceil((Date.now() - new Date(ki.tglMasuk).getTime()) / 86400000) : 0;
      return {
        ...this.fmt(enc),
        hariRawat,
        hasCPPT: enc.medicalRecords.length > 0,
        lastCPPT: enc.medicalRecords[0]?.createdAt || null,
      };
    });
  }

  /**
   * Input CPPT (Catatan Perkembangan Pasien Terintegrasi)
   */
  async addCPPT(dto: {
    encounterId: number; practitionerId: number;
    subjective: string; objective: string; assessment: string; plan: string;
    instruksi?: string;
  }) {
    const enc = await this.prisma.encounter.findUnique({ where: { id: BigInt(dto.encounterId) } });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    const record = await this.prisma.medicalRecord.create({
      data: {
        encounterId: BigInt(dto.encounterId),
        patientId: enc.patientId,
        practitionerId: BigInt(dto.practitionerId),
        tipe: 'CPPT',
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        plan: dto.plan,
      },
    });

    return { ...record, id: Number(record.id) };
  }

  /**
   * Riwayat CPPT per encounter
   */
  async getCPPTHistory(encounterId: number) {
    const data = await this.prisma.medicalRecord.findMany({
      where: { encounterId: BigInt(encounterId), tipe: 'CPPT' },
      include: { practitioner: { select: { id: true, namaLengkap: true, spesialisasi: true, jenisNakes: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return data.map((r) => ({
      ...r, id: Number(r.id), encounterId: Number(r.encounterId),
      patientId: Number(r.patientId), practitionerId: Number(r.practitionerId),
      practitioner: r.practitioner ? { ...r.practitioner, id: Number(r.practitioner.id) } : undefined,
    }));
  }

  /**
   * Transfer kamar/bed
   */
  async transferBed(encounterId: number, newBedId: number, alasan?: string) {
    const enc = await this.prisma.encounter.findUnique({
      where: { id: BigInt(encounterId) },
      include: { kamarInap: { orderBy: { tglMasuk: 'desc' }, take: 1 } },
    });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    const newBed = await this.prisma.bed.findUnique({ where: { id: BigInt(newBedId) }, include: { location: true } });
    if (!newBed) throw new NotFoundException('Bed tujuan tidak ditemukan');
    if (newBed.status !== 'TERSEDIA') throw new BadRequestException('Bed tujuan tidak tersedia');

    // Close current kamar_inap
    const currentKI = enc.kamarInap[0];
    if (currentKI) {
      const lama = Math.ceil((Date.now() - new Date(currentKI.tglMasuk).getTime()) / 86400000);
      await this.prisma.kamarInap.update({
        where: { id: currentKI.id },
        data: {
          tglKeluar: new Date(), jamKeluar: new Date(),
          lama, ttlBiaya: lama * Number(currentKI.tarifKamar),
          sttsPulang: 'Pindah Kamar',
        },
      });
    }

    // Free old bed
    if (enc.bedId) {
      await this.prisma.bed.update({ where: { id: enc.bedId }, data: { status: 'TERSEDIA' } });
    }

    // Create new kamar_inap
    await this.prisma.kamarInap.create({
      data: {
        encounterId: enc.id, bedId: newBed.id,
        tarifKamar: newBed.tarifPerHari,
        tglMasuk: new Date(), jamMasuk: new Date(),
      },
    });

    // Update encounter & new bed
    await this.prisma.encounter.update({
      where: { id: enc.id },
      data: { bedId: newBed.id, locationId: newBed.locationId },
    });
    await this.prisma.bed.update({ where: { id: newBed.id }, data: { status: 'TERISI' } });

    return { message: 'Transfer berhasil', newBed: newBed.nomorBed, bangsal: newBed.location.nama };
  }

  /**
   * Discharge / pulang
   */
  async discharge(encounterId: number, dto: { caraKeluar: string; diagnosaAkhir?: string }) {
    const enc = await this.prisma.encounter.findUnique({
      where: { id: BigInt(encounterId) },
      include: { kamarInap: { orderBy: { tglMasuk: 'desc' }, take: 1 } },
    });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    // Close kamar_inap
    const ki = enc.kamarInap[0];
    if (ki) {
      const lama = Math.max(1, Math.ceil((Date.now() - new Date(ki.tglMasuk).getTime()) / 86400000));
      await this.prisma.kamarInap.update({
        where: { id: ki.id },
        data: {
          tglKeluar: new Date(), jamKeluar: new Date(),
          lama, ttlBiaya: lama * Number(ki.tarifKamar),
          diagnosaAkhir: dto.diagnosaAkhir,
          sttsPulang: dto.caraKeluar === 'ATAS_PERSETUJUAN' ? 'Atas Persetujuan Dokter' : dto.caraKeluar,
        },
      });
    }

    // Free bed
    if (enc.bedId) {
      await this.prisma.bed.update({ where: { id: enc.bedId }, data: { status: 'TERSEDIA' } });
    }

    // Finish encounter
    await this.prisma.encounter.update({
      where: { id: enc.id },
      data: { status: 'FINISHED', tanggalKeluar: new Date(), caraKeluar: dto.caraKeluar as any },
    });

    return { message: 'Pasien berhasil dipulangkan' };
  }

  /**
   * Statistik rawat inap
   */
  async getStats() {
    const active = await this.prisma.encounter.count({ where: { tipe: 'RAWAT_INAP', status: 'IN_PROGRESS' } });
    const beds = await this.prisma.bed.findMany();
    const totalBeds = beds.length;
    const terisi = beds.filter((b) => b.status === 'TERISI').length;
    const bor = totalBeds > 0 ? Math.round((terisi / totalBeds) * 100) : 0;

    return { activePatients: active, totalBeds, terisi, tersedia: totalBeds - terisi, bor };
  }

  private async generateNoRawat(): Promise<string> {
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    const last = await this.prisma.encounter.findFirst({
      where: { noRawat: { startsWith: dateStr } }, orderBy: { noRawat: 'desc' }, select: { noRawat: true },
    });
    let seq = 1;
    if (last?.noRawat) { const p = last.noRawat.split('/'); seq = parseInt(p[3] || '0') + 1; }
    return `${dateStr}/${String(seq).padStart(6, '0')}`;
  }

  private fmt(enc: any): any {
    return {
      ...enc, id: Number(enc.id), patientId: Number(enc.patientId),
      practitionerId: enc.practitionerId ? Number(enc.practitionerId) : null,
      locationId: Number(enc.locationId), bedId: enc.bedId ? Number(enc.bedId) : null,
      patient: enc.patient ? { ...enc.patient, id: Number(enc.patient.id) } : undefined,
      practitioner: enc.practitioner ? { ...enc.practitioner, id: Number(enc.practitioner.id) } : undefined,
      location: enc.location ? { ...enc.location, id: Number(enc.location.id) } : undefined,
      bed: enc.bed ? { ...enc.bed, id: Number(enc.bed.id) } : undefined,
    };
  }
}
