import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

interface CreateTicketInput {
  tanggal: Date;
  locationId: number;
  patientId?: number;
  jenis: 'ONLINE' | 'OFFLINE';
  kodeBooking?: string;
}

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  /**
   * Buat tiket antrean baru
   */
  async createTicket(input: CreateTicketInput) {
    const today = new Date(input.tanggal);
    today.setHours(0, 0, 0, 0);

    // Hitung nomor antrean berikutnya untuk lokasi ini hari ini
    const lastTicket = await this.prisma.queueTicket.findFirst({
      where: {
        tanggal: today,
        locationId: BigInt(input.locationId),
      },
      orderBy: { nomorAntrean: 'desc' },
    });

    const nomorAntrean = (lastTicket?.nomorAntrean ?? 0) + 1;

    // Estimasi waktu (rata-rata 10 menit per pasien)
    const waitingCount = await this.prisma.queueTicket.count({
      where: {
        tanggal: today,
        locationId: BigInt(input.locationId),
        status: { in: ['WAITING', 'CALLED'] },
      },
    });
    const estimasiMenit = waitingCount * 10;

    const ticket = await this.prisma.queueTicket.create({
      data: {
        tanggal: today,
        locationId: BigInt(input.locationId),
        patientId: input.patientId ? BigInt(input.patientId) : null,
        nomorAntrean,
        kodeBooking: input.kodeBooking,
        jenis: input.jenis as any,
        status: 'WAITING',
        waktuDaftar: new Date(),
        estimasiMenit,
      },
      include: {
        location: { select: { id: true, nama: true, kode: true } },
        patient: { select: { id: true, noRm: true, namaLengkap: true } },
      },
    });

    return this.format(ticket);
  }

  /**
   * Daftar antrean hari ini per lokasi
   */
  async getTodayQueue(locationId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await this.prisma.queueTicket.findMany({
      where: {
        tanggal: today,
        locationId: BigInt(locationId),
      },
      include: {
        location: { select: { id: true, nama: true, kode: true } },
        patient: { select: { id: true, noRm: true, namaLengkap: true, jenisKelamin: true } },
      },
      orderBy: { nomorAntrean: 'asc' },
    });

    const waiting = data.filter((d) => d.status === 'WAITING').length;
    const serving = data.filter((d) => d.status === 'SERVING').length;
    const done = data.filter((d) => d.status === 'DONE').length;
    const current = data.find((d) => d.status === 'SERVING' || d.status === 'CALLED');

    return {
      tickets: data.map(this.format),
      summary: {
        total: data.length,
        waiting,
        serving,
        done,
        currentNumber: current?.nomorAntrean ?? null,
      },
    };
  }

  /**
   * Panggil pasien berikutnya
   */
  async callNext(locationId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Set current SERVING → DONE jika ada
    await this.prisma.queueTicket.updateMany({
      where: {
        tanggal: today,
        locationId: BigInt(locationId),
        status: 'SERVING',
      },
      data: {
        status: 'DONE',
        waktuSelesai: new Date(),
      },
    });

    // Set current CALLED → DONE juga
    await this.prisma.queueTicket.updateMany({
      where: {
        tanggal: today,
        locationId: BigInt(locationId),
        status: 'CALLED',
      },
      data: {
        status: 'DONE',
        waktuSelesai: new Date(),
      },
    });

    // Ambil WAITING berikutnya
    const next = await this.prisma.queueTicket.findFirst({
      where: {
        tanggal: today,
        locationId: BigInt(locationId),
        status: 'WAITING',
      },
      orderBy: { nomorAntrean: 'asc' },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true } },
        location: { select: { id: true, nama: true } },
      },
    });

    if (!next) return { message: 'Tidak ada antrean menunggu', ticket: null };

    const updated = await this.prisma.queueTicket.update({
      where: { id: next.id },
      data: {
        status: 'CALLED',
        waktuDipanggil: new Date(),
      },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true } },
        location: { select: { id: true, nama: true } },
      },
    });

    return { message: 'Pasien dipanggil', ticket: this.format(updated) };
  }

  /**
   * Set status CALLED → SERVING (pasien hadir)
   */
  async startServing(ticketId: number) {
    const ticket = await this.prisma.queueTicket.update({
      where: { id: BigInt(ticketId) },
      data: { status: 'SERVING' },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true } },
        location: { select: { id: true, nama: true } },
      },
    });
    return this.format(ticket);
  }

  /**
   * Skip / lewati antrean
   */
  async skipTicket(ticketId: number) {
    const ticket = await this.prisma.queueTicket.update({
      where: { id: BigInt(ticketId) },
      data: { status: 'CANCELLED' },
    });
    return this.format(ticket);
  }

  /**
   * Ringkasan antrean semua poli hari ini
   */
  async getAllQueueSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const locations = await this.prisma.location.findMany({
      where: { tipe: 'POLI', isActive: true },
      select: { id: true, nama: true, kode: true },
    });

    const summaries = await Promise.all(
      locations.map(async (loc) => {
        const [waiting, serving, done, total] = await Promise.all([
          this.prisma.queueTicket.count({
            where: { tanggal: today, locationId: loc.id, status: 'WAITING' },
          }),
          this.prisma.queueTicket.count({
            where: { tanggal: today, locationId: loc.id, status: { in: ['CALLED', 'SERVING'] } },
          }),
          this.prisma.queueTicket.count({
            where: { tanggal: today, locationId: loc.id, status: 'DONE' },
          }),
          this.prisma.queueTicket.count({
            where: { tanggal: today, locationId: loc.id },
          }),
        ]);

        const current = await this.prisma.queueTicket.findFirst({
          where: { tanggal: today, locationId: loc.id, status: { in: ['CALLED', 'SERVING'] } },
          select: { nomorAntrean: true },
        });

        return {
          location: { id: Number(loc.id), nama: loc.nama, kode: loc.kode },
          total,
          waiting,
          serving,
          done,
          currentNumber: current?.nomorAntrean ?? null,
        };
      }),
    );

    return summaries.filter((s) => s.total > 0 || true); // tampilkan semua poli
  }

  private format(t: any) {
    return {
      ...t,
      id: Number(t.id),
      locationId: Number(t.locationId),
      patientId: t.patientId ? Number(t.patientId) : null,
      patient: t.patient ? { ...t.patient, id: Number(t.patient.id) } : undefined,
      location: t.location ? { ...t.location, id: Number(t.location.id) } : undefined,
    };
  }
}
