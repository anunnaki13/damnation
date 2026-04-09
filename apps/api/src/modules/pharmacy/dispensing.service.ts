import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class DispensingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Worklist resep masuk — semua resep SUBMITTED yang belum di-dispensing
   */
  async getWorklistResep(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    } else {
      where.status = { in: ['SUBMITTED', 'VERIFIED'] };
    }

    const data = await this.prisma.prescription.findMany({
      where,
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true, jenisKelamin: true, alergiObat: true } },
        prescriber: { select: { id: true, namaLengkap: true, spesialisasi: true } },
        encounter: { select: { id: true, noRawat: true, tipe: true, penjamin: true } },
        items: {
          include: {
            medicine: { select: { id: true, kode: true, namaGenerik: true, namaDagang: true, satuan: true, golongan: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return data.map(this.fmtPrescription);
  }

  /**
   * Telaah resep — verifikasi oleh apoteker
   */
  async verifyPrescription(prescriptionId: number) {
    const rx = await this.prisma.prescription.findUnique({
      where: { id: BigInt(prescriptionId) },
      include: {
        items: { include: { medicine: true } },
        patient: { select: { alergiObat: true, namaLengkap: true } },
      },
    });
    if (!rx) throw new NotFoundException('Resep tidak ditemukan');
    if (rx.status !== 'SUBMITTED') throw new BadRequestException('Resep sudah diverifikasi atau di-dispensing');

    // Cek alergi obat
    const warnings: string[] = [];
    if (rx.patient?.alergiObat) {
      const alergi = rx.patient.alergiObat.toLowerCase();
      for (const item of rx.items) {
        const namaObat = (item.medicine.namaGenerik || '').toLowerCase();
        if (alergi.includes(namaObat)) {
          warnings.push(`ALERGI: Pasien alergi terhadap ${item.medicine.namaGenerik}`);
        }
      }
    }

    // Cek stok
    for (const item of rx.items) {
      const totalStok = await this.prisma.medicineStock.aggregate({
        where: { medicineId: item.medicineId, stok: { gt: 0 } },
        _sum: { stok: true },
      });
      const stokTersedia = totalStok._sum.stok || 0;
      if (stokTersedia < Number(item.jumlah)) {
        warnings.push(`STOK KURANG: ${item.medicine.namaGenerik} — tersedia ${stokTersedia}, dibutuhkan ${item.jumlah}`);
      }
    }

    // Update status ke VERIFIED
    await this.prisma.prescription.update({
      where: { id: BigInt(prescriptionId) },
      data: { status: 'VERIFIED' },
    });

    return {
      message: 'Resep diverifikasi',
      prescriptionId,
      warnings,
      hasWarnings: warnings.length > 0,
    };
  }

  /**
   * Dispensing obat — penyerahan obat ke pasien
   */
  async dispensePrescription(prescriptionId: number) {
    const rx = await this.prisma.prescription.findUnique({
      where: { id: BigInt(prescriptionId) },
      include: { items: { include: { medicine: true } } },
    });
    if (!rx) throw new NotFoundException('Resep tidak ditemukan');
    if (!['SUBMITTED', 'VERIFIED'].includes(rx.status)) {
      throw new BadRequestException('Resep tidak dapat di-dispensing (status: ' + rx.status + ')');
    }

    // Kurangi stok per item (FEFO — First Expired First Out)
    const dispensedItems: any[] = [];
    for (const item of rx.items) {
      const jumlahNeeded = Number(item.jumlah);
      let remaining = jumlahNeeded;

      // Ambil stok FEFO
      const stocks = await this.prisma.medicineStock.findMany({
        where: { medicineId: item.medicineId, stok: { gt: 0 } },
        orderBy: { expiredDate: 'asc' },
      });

      for (const stock of stocks) {
        if (remaining <= 0) break;
        const deduct = Math.min(stock.stok, remaining);
        await this.prisma.medicineStock.update({
          where: { id: stock.id },
          data: { stok: stock.stok - deduct },
        });
        remaining -= deduct;

        // Update batch info di prescription item
        await this.prisma.prescriptionItem.update({
          where: { id: item.id },
          data: { noBatch: stock.batchNumber, noFaktur: stock.noFaktur },
        });
      }

      dispensedItems.push({
        medicine: item.medicine.namaGenerik,
        requested: jumlahNeeded,
        dispensed: jumlahNeeded - remaining,
        shortage: remaining,
      });
    }

    // Update status resep
    const allFulfilled = dispensedItems.every((d) => d.shortage === 0);
    await this.prisma.prescription.update({
      where: { id: BigInt(prescriptionId) },
      data: {
        status: allFulfilled ? 'DISPENSED' : 'PARTIALLY_DISPENSED',
        tglPenyerahan: new Date(),
        jamPenyerahan: new Date(),
      },
    });

    return {
      message: allFulfilled ? 'Semua obat berhasil di-dispensing' : 'Dispensing parsial — ada stok kurang',
      prescriptionId,
      items: dispensedItems,
    };
  }

  /**
   * Retur obat — kembalikan ke stok
   */
  async returnItem(prescriptionItemId: number, jumlahRetur: number, alasan: string) {
    const item = await this.prisma.prescriptionItem.findUnique({
      where: { id: BigInt(prescriptionItemId) },
      include: { prescription: true, medicine: true },
    });
    if (!item) throw new NotFoundException('Item resep tidak ditemukan');

    // Kembalikan stok
    const existingStock = await this.prisma.medicineStock.findFirst({
      where: { medicineId: item.medicineId, batchNumber: item.noBatch },
    });

    if (existingStock) {
      await this.prisma.medicineStock.update({
        where: { id: existingStock.id },
        data: { stok: existingStock.stok + jumlahRetur },
      });
    }

    return { message: `Retur ${jumlahRetur} ${item.medicine.satuan} ${item.medicine.namaGenerik} berhasil`, alasan };
  }

  /**
   * Riwayat dispensing per hari
   */
  async getDispensingHistory(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const data = await this.prisma.prescription.findMany({
      where: {
        status: { in: ['DISPENSED', 'PARTIALLY_DISPENSED'] },
        tglPenyerahan: { gte: targetDate, lt: nextDay },
      },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true } },
        prescriber: { select: { id: true, namaLengkap: true } },
        items: { include: { medicine: { select: { namaGenerik: true, satuan: true } } } },
      },
      orderBy: { tglPenyerahan: 'desc' },
    });

    return data.map(this.fmtPrescription);
  }

  private fmtPrescription(rx: any) {
    return {
      ...rx,
      id: Number(rx.id),
      encounterId: Number(rx.encounterId),
      patientId: Number(rx.patientId),
      prescriberId: Number(rx.prescriberId),
      patient: rx.patient ? { ...rx.patient, id: Number(rx.patient.id) } : undefined,
      prescriber: rx.prescriber ? { ...rx.prescriber, id: Number(rx.prescriber.id) } : undefined,
      encounter: rx.encounter ? { ...rx.encounter, id: Number(rx.encounter.id) } : undefined,
      items: rx.items?.map((i: any) => ({
        ...i,
        id: Number(i.id),
        medicineId: Number(i.medicineId),
        jumlah: Number(i.jumlah),
        hargaSatuan: i.hargaSatuan ? Number(i.hargaSatuan) : null,
        subtotal: i.subtotal ? Number(i.subtotal) : null,
        medicine: i.medicine ? { ...i.medicine, id: Number(i.medicine.id) } : undefined,
      })),
    };
  }
}
