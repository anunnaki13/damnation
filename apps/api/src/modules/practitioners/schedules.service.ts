import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateScheduleDto) {
    const schedule = await this.prisma.practitionerSchedule.create({
      data: {
        practitionerId: BigInt(dto.practitionerId),
        locationId: BigInt(dto.locationId),
        hari: dto.hari as any,
        jamMulai: new Date(`1970-01-01T${dto.jamMulai}:00`),
        jamSelesai: new Date(`1970-01-01T${dto.jamSelesai}:00`),
        kuotaPasien: dto.kuotaPasien ?? 30,
      },
      include: {
        practitioner: { select: { id: true, namaLengkap: true, spesialisasi: true } },
        location: { select: { id: true, nama: true, kode: true } },
      },
    });
    return this.format(schedule);
  }

  async findByLocation(locationId: number, hari?: string) {
    const where = {
      locationId: BigInt(locationId),
      isActive: true,
      ...(hari ? { hari: hari as any } : {}),
    };

    const data = await this.prisma.practitionerSchedule.findMany({
      where,
      include: {
        practitioner: { select: { id: true, namaLengkap: true, spesialisasi: true, gelarDepan: true, gelarBelakang: true } },
        location: { select: { id: true, nama: true, kode: true } },
      },
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
    });

    return data.map(this.format);
  }

  async findByPractitioner(practitionerId: number) {
    const data = await this.prisma.practitionerSchedule.findMany({
      where: { practitionerId: BigInt(practitionerId), isActive: true },
      include: {
        location: { select: { id: true, nama: true, kode: true } },
      },
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
    });
    return data.map(this.format);
  }

  async update(id: number, dto: Partial<CreateScheduleDto> & { isActive?: boolean }) {
    const updated = await this.prisma.practitionerSchedule.update({
      where: { id: BigInt(id) },
      data: {
        hari: dto.hari as any,
        jamMulai: dto.jamMulai ? new Date(`1970-01-01T${dto.jamMulai}:00`) : undefined,
        jamSelesai: dto.jamSelesai ? new Date(`1970-01-01T${dto.jamSelesai}:00`) : undefined,
        kuotaPasien: dto.kuotaPasien,
        isActive: dto.isActive,
      },
      include: {
        practitioner: { select: { id: true, namaLengkap: true, spesialisasi: true } },
        location: { select: { id: true, nama: true, kode: true } },
      },
    });
    return this.format(updated);
  }

  async delete(id: number) {
    await this.prisma.practitionerSchedule.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { message: 'Jadwal berhasil dinonaktifkan' };
  }

  private format(s: any) {
    return {
      ...s,
      id: Number(s.id),
      practitionerId: Number(s.practitionerId),
      locationId: Number(s.locationId),
      jamMulai: s.jamMulai instanceof Date ? s.jamMulai.toISOString().slice(11, 16) : s.jamMulai,
      jamSelesai: s.jamSelesai instanceof Date ? s.jamSelesai.toISOString().slice(11, 16) : s.jamSelesai,
      practitioner: s.practitioner ? { ...s.practitioner, id: Number(s.practitioner.id) } : undefined,
      location: s.location ? { ...s.location, id: Number(s.location.id) } : undefined,
    };
  }
}
