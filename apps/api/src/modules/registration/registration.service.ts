import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { QueueService } from './queue.service';

@Injectable()
export class RegistrationService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  /**
   * Daftarkan kunjungan baru (rawat jalan / IGD)
   * Flow: cek pasien → generate no_rawat → buat encounter → buat antrean
   */
  async createEncounter(dto: CreateEncounterDto, createdBy?: number) {
    // 1. Validasi pasien
    const patient = await this.prisma.patient.findUnique({
      where: { id: BigInt(dto.patientId) },
    });
    if (!patient) throw new NotFoundException('Pasien tidak ditemukan');

    // 2. Validasi lokasi
    const location = await this.prisma.location.findUnique({
      where: { id: BigInt(dto.locationId) },
    });
    if (!location) throw new NotFoundException('Lokasi/poli tidak ditemukan');

    // 3. Validasi dokter (jika dipilih)
    if (dto.practitionerId) {
      const practitioner = await this.prisma.practitioner.findUnique({
        where: { id: BigInt(dto.practitionerId) },
      });
      if (!practitioner) throw new NotFoundException('Dokter tidak ditemukan');
    }

    // 4. Cek apakah pasien sudah terdaftar hari ini di poli yang sama
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingToday = await this.prisma.encounter.findFirst({
      where: {
        patientId: BigInt(dto.patientId),
        locationId: BigInt(dto.locationId),
        tanggalMasuk: { gte: today, lt: tomorrow },
        status: { notIn: ['CANCELLED', 'FINISHED'] },
      },
    });
    if (existingToday) {
      throw new BadRequestException(
        'Pasien sudah terdaftar di poli ini hari ini',
      );
    }

    // 5. Generate no_rawat (format Khanza: YYYY/MM/DD/NNNNNN)
    const noRawat = await this.generateNoRawat();

    // 6. Generate no_reg (urutan harian per poli)
    const noReg = await this.generateNoReg(BigInt(dto.locationId));

    // 7. Tentukan stts_daftar (Baru/Lama)
    const prevEncounter = await this.prisma.encounter.findFirst({
      where: { patientId: BigInt(dto.patientId) },
    });
    const sttsDaftar = prevEncounter ? 'Lama' : 'Baru';

    // 8. Hitung umur saat daftar
    const age = this.calculateAge(patient.tanggalLahir);

    // 9. Buat encounter
    const encounter = await this.prisma.encounter.create({
      data: {
        noRawat,
        noReg,
        patientId: BigInt(dto.patientId),
        practitionerId: dto.practitionerId ? BigInt(dto.practitionerId) : null,
        locationId: BigInt(dto.locationId),
        tipe: dto.tipe as any,
        penjamin: dto.penjamin as any,
        kdPj: dto.kdPj,
        tanggalMasuk: new Date(),
        status: 'PLANNED',
        biayaReg: location.biayaRegistrasiBaru
          ? (sttsDaftar === 'Baru'
              ? location.biayaRegistrasiBaru
              : location.biayaRegistrasiLama)
          : null,
        sttsDaftar,
        statusBayar: 'Belum Bayar',
        statusPoli: sttsDaftar,
        umurDaftar: age.years,
        sttsUmur: 'Th',
        pJawab: dto.pJawab || patient.namaPj,
        alamatPj: dto.alamatPj || patient.alamatPj,
        hubunganPj: dto.hubunganPj || patient.hubunganPj,
        noRujukan: dto.noRujukan,
        createdBy: createdBy ? BigInt(createdBy) : null,
      },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true, noBpjs: true } },
        practitioner: { select: { id: true, namaLengkap: true, spesialisasi: true } },
        location: { select: { id: true, nama: true, kode: true } },
      },
    });

    // 10. Buat antrean otomatis
    const queue = await this.queueService.createTicket({
      tanggal: new Date(),
      locationId: dto.locationId,
      patientId: dto.patientId,
      jenis: 'OFFLINE',
    });

    return {
      encounter: this.formatEncounter(encounter),
      queue: {
        nomorAntrean: queue.nomorAntrean,
        estimasiMenit: queue.estimasiMenit,
      },
    };
  }

  /**
   * Daftar kunjungan hari ini per poli (worklist registrasi)
   */
  async getTodayEncounters(locationId?: number, status?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = {
      tanggalMasuk: { gte: today, lt: tomorrow },
    };
    if (locationId) where.locationId = BigInt(locationId);
    if (status) where.status = status;

    const data = await this.prisma.encounter.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true, noRm: true, namaLengkap: true, jenisKelamin: true,
            tanggalLahir: true, noBpjs: true, noHp: true,
          },
        },
        practitioner: {
          select: { id: true, namaLengkap: true, spesialisasi: true },
        },
        location: { select: { id: true, nama: true, kode: true } },
      },
      orderBy: { noReg: 'asc' },
    });

    return data.map(this.formatEncounter);
  }

  /**
   * Detail encounter
   */
  async getEncounterById(id: number) {
    const enc = await this.prisma.encounter.findUnique({
      where: { id: BigInt(id) },
      include: {
        patient: true,
        practitioner: true,
        location: true,
        diagnoses: true,
        procedures: true,
        prescriptions: { include: { items: true } },
        bills: { include: { items: true, payments: true } },
        bridgingSep: true,
      },
    });
    if (!enc) throw new NotFoundException('Kunjungan tidak ditemukan');
    return this.formatEncounter(enc);
  }

  /**
   * Update status encounter
   */
  async updateStatus(id: number, status: string) {
    const enc = await this.prisma.encounter.findUnique({
      where: { id: BigInt(id) },
    });
    if (!enc) throw new NotFoundException('Kunjungan tidak ditemukan');

    const updated = await this.prisma.encounter.update({
      where: { id: BigInt(id) },
      data: {
        status: status as any,
        ...(status === 'FINISHED' ? { tanggalKeluar: new Date() } : {}),
        ...(status === 'FINISHED' ? { statusBayar: undefined } : {}),
      },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true } },
        location: { select: { id: true, nama: true } },
      },
    });

    return this.formatEncounter(updated);
  }

  /**
   * Batalkan kunjungan
   */
  async cancelEncounter(id: number) {
    return this.updateStatus(id, 'CANCELLED');
  }

  /**
   * Statistik registrasi hari ini
   */
  async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = { tanggalMasuk: { gte: today, lt: tomorrow } };

    const [total, ralanCount, igdCount, bpjsCount, umumCount, finishedCount] =
      await Promise.all([
        this.prisma.encounter.count({ where }),
        this.prisma.encounter.count({ where: { ...where, tipe: 'RAWAT_JALAN' } }),
        this.prisma.encounter.count({ where: { ...where, tipe: 'IGD' } }),
        this.prisma.encounter.count({ where: { ...where, penjamin: 'BPJS' } }),
        this.prisma.encounter.count({ where: { ...where, penjamin: 'UMUM' } }),
        this.prisma.encounter.count({ where: { ...where, status: 'FINISHED' } }),
      ]);

    return {
      total,
      rawatJalan: ralanCount,
      igd: igdCount,
      bpjs: bpjsCount,
      umum: umumCount,
      selesai: finishedCount,
      belumSelesai: total - finishedCount,
    };
  }

  // --- Helper methods ---

  private async generateNoRawat(): Promise<string> {
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;

    const lastToday = await this.prisma.encounter.findFirst({
      where: { noRawat: { startsWith: dateStr } },
      orderBy: { noRawat: 'desc' },
      select: { noRawat: true },
    });

    let seq = 1;
    if (lastToday?.noRawat) {
      const parts = lastToday.noRawat.split('/');
      seq = parseInt(parts[3] || '0') + 1;
    }

    return `${dateStr}/${String(seq).padStart(6, '0')}`;
  }

  private async generateNoReg(locationId: bigint): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await this.prisma.encounter.count({
      where: {
        locationId,
        tanggalMasuk: { gte: today, lt: tomorrow },
      },
    });

    return String(count + 1).padStart(3, '0');
  }

  private calculateAge(birthDate: Date): { years: number; months: number } {
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    if (months < 0) { years--; months += 12; }
    return { years, months };
  }

  private formatEncounter(enc: any) {
    return {
      ...enc,
      id: Number(enc.id),
      patientId: Number(enc.patientId),
      practitionerId: enc.practitionerId ? Number(enc.practitionerId) : null,
      locationId: Number(enc.locationId),
      bedId: enc.bedId ? Number(enc.bedId) : null,
      createdBy: enc.createdBy ? Number(enc.createdBy) : null,
      biayaReg: enc.biayaReg ? Number(enc.biayaReg) : null,
      patient: enc.patient ? { ...enc.patient, id: Number(enc.patient.id) } : undefined,
      practitioner: enc.practitioner ? { ...enc.practitioner, id: Number(enc.practitioner.id) } : undefined,
      location: enc.location ? { ...enc.location, id: Number(enc.location.id) } : undefined,
    };
  }
}
