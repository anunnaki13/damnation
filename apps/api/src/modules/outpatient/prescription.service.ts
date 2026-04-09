import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionService {
  constructor(private prisma: PrismaService) {}

  async createPrescription(dto: CreatePrescriptionDto) {
    const enc = await this.prisma.encounter.findUnique({ where: { id: BigInt(dto.encounterId) } });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    // Generate no_resep: RYYYYMMDDNNNN
    const noResep = await this.generateNoResep();

    const prescription = await this.prisma.prescription.create({
      data: {
        encounterId: BigInt(dto.encounterId),
        patientId: enc.patientId,
        prescriberId: BigInt(dto.prescriberId),
        noResep,
        status: 'SUBMITTED',
        jenis: dto.jenis as any || 'NON_RACIKAN',
        statusRawat: 'Ralan',
        tglPeresepan: new Date(),
        jamPeresepan: new Date(),
        catatan: dto.catatan,
        items: {
          create: dto.items.map((item) => ({
            medicineId: BigInt(item.medicineId),
            jumlah: item.jumlah,
            dosis: item.dosis,
            rute: item.rute || 'oral',
            frekuensi: item.frekuensi,
            durasiHari: item.durasiHari,
            aturanPakai: item.aturanPakai,
            hargaSatuan: item.hargaSatuan,
            subtotal: item.hargaSatuan ? item.hargaSatuan * item.jumlah : null,
          })),
        },
      },
      include: {
        items: {
          include: {
            medicine: { select: { id: true, kode: true, namaGenerik: true, namaDagang: true, satuan: true } },
          },
        },
      },
    });

    return this.fmt(prescription);
  }

  async getPrescriptionsByEncounter(encounterId: number) {
    const data = await this.prisma.prescription.findMany({
      where: { encounterId: BigInt(encounterId) },
      include: {
        items: {
          include: { medicine: { select: { id: true, kode: true, namaGenerik: true, namaDagang: true, satuan: true } } },
        },
        prescriber: { select: { id: true, namaLengkap: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return data.map(this.fmt);
  }

  /**
   * Search obat untuk autocomplete e-resep
   */
  async searchMedicine(keyword: string, limit = 20) {
    return this.prisma.medicine.findMany({
      where: {
        isActive: true,
        OR: [
          { kode: { contains: keyword } },
          { namaGenerik: { contains: keyword } },
          { namaDagang: { contains: keyword } },
        ],
      },
      select: {
        id: true, kode: true, namaGenerik: true, namaDagang: true,
        satuan: true, hargaJualRalan: true, golongan: true, kategori: true,
      },
      take: limit,
    });
  }

  private async generateNoResep(): Promise<string> {
    const now = new Date();
    const prefix = `R${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    const last = await this.prisma.prescription.findFirst({
      where: { noResep: { startsWith: prefix } },
      orderBy: { noResep: 'desc' },
      select: { noResep: true },
    });

    let seq = 1;
    if (last?.noResep) {
      seq = parseInt(last.noResep.slice(-4)) + 1;
    }
    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  private fmt(p: any) {
    return {
      ...p,
      id: Number(p.id),
      encounterId: Number(p.encounterId),
      patientId: Number(p.patientId),
      prescriberId: Number(p.prescriberId),
      items: p.items?.map((i: any) => ({
        ...i, id: Number(i.id),
        medicineId: Number(i.medicineId),
        prescriptionId: Number(i.prescriptionId),
        jumlah: Number(i.jumlah),
        hargaSatuan: i.hargaSatuan ? Number(i.hargaSatuan) : null,
        subtotal: i.subtotal ? Number(i.subtotal) : null,
        medicine: i.medicine ? { ...i.medicine, id: Number(i.medicine.id), hargaJualRalan: i.medicine.hargaJualRalan ? Number(i.medicine.hargaJualRalan) : 0 } : undefined,
      })),
    };
  }
}
