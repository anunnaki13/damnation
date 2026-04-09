import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate billing otomatis dari encounter
   * Mengumpulkan: registrasi, tindakan dr/pr, obat, lab, radiologi, kamar
   */
  async generateBill(encounterId: number) {
    const enc = await this.prisma.encounter.findUnique({
      where: { id: BigInt(encounterId) },
      include: {
        patient: { select: { id: true, noRm: true, namaLengkap: true } },
        location: true,
        procedures: true,
        prescriptions: { include: { items: { include: { medicine: true } } } },
        labOrders: { include: { items: true } },
        radiologyOrders: true,
        kamarInap: true,
      },
    });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    // Cek apakah sudah ada bill
    const existingBill = await this.prisma.bill.findFirst({
      where: { encounterId: BigInt(encounterId), status: { not: 'VOID' } },
    });
    if (existingBill) throw new BadRequestException('Billing sudah dibuat untuk kunjungan ini');

    const noInvoice = await this.generateInvoiceNo();
    const items: any[] = [];

    // 1. Biaya Registrasi
    if (enc.biayaReg && Number(enc.biayaReg) > 0) {
      items.push({
        kategori: 'REGISTRASI',
        deskripsi: `Biaya Registrasi - ${enc.sttsDaftar || 'Baru'}`,
        jumlah: 1,
        tarif: Number(enc.biayaReg),
        subtotal: Number(enc.biayaReg),
      });
    }

    // 2. Tindakan Dokter & Perawat
    for (const proc of enc.procedures) {
      items.push({
        kategori: Number(proc.tarifTindakanDr) > 0 ? 'JASA_DOKTER' : 'TINDAKAN',
        deskripsi: proc.nmPerawatan || proc.icd9cmDisplay || `Tindakan ${proc.kdJenisPerawatan || ''}`,
        jumlah: 1,
        tarif: Number(proc.biayaRawat),
        subtotal: Number(proc.biayaRawat),
        referenceType: 'procedure',
        referenceId: proc.id,
      });
    }

    // 3. Obat
    for (const rx of enc.prescriptions) {
      for (const item of rx.items) {
        const harga = Number(item.hargaSatuan) || 0;
        const qty = Number(item.jumlah);
        const embalase = Number(item.embalase) || 0;
        const tuslah = Number(item.tuslah) || 0;
        items.push({
          kategori: 'OBAT',
          deskripsi: item.medicine.namaGenerik || item.medicine.namaDagang || '',
          jumlah: qty,
          tarif: harga,
          tambahan: embalase + tuslah,
          subtotal: (harga * qty) + embalase + tuslah,
          referenceType: 'prescription_item',
          referenceId: item.id,
        });
      }
    }

    // 4. Lab
    for (const lab of enc.labOrders) {
      for (const labItem of lab.items) {
        if (Number(labItem.tarif) > 0) {
          items.push({
            kategori: 'LABORATORIUM',
            deskripsi: labItem.pemeriksaan,
            jumlah: 1,
            tarif: Number(labItem.tarif),
            subtotal: Number(labItem.tarif),
            referenceType: 'lab_order_item',
            referenceId: labItem.id,
          });
        }
      }
    }

    // 5. Radiologi
    for (const rad of enc.radiologyOrders) {
      if (Number(rad.biayaTotal) > 0) {
        items.push({
          kategori: 'RADIOLOGI',
          deskripsi: rad.jenisPemeriksaan,
          jumlah: 1,
          tarif: Number(rad.biayaTotal),
          subtotal: Number(rad.biayaTotal),
          referenceType: 'radiology_order',
          referenceId: rad.id,
        });
      }
    }

    // 6. Kamar (rawat inap)
    for (const ki of enc.kamarInap) {
      if (Number(ki.ttlBiaya) > 0) {
        items.push({
          kategori: 'KAMAR',
          deskripsi: `Kamar ${ki.lama || 1} hari`,
          jumlah: ki.lama || 1,
          tarif: Number(ki.tarifKamar),
          subtotal: Number(ki.ttlBiaya),
          referenceType: 'kamar_inap',
          referenceId: ki.id,
        });
      }
    }

    const totalTarif = items.reduce((s, i) => s + (i.subtotal || 0), 0);
    const penjaminMap: Record<string, string> = { BPJ: 'BPJS', UMU: 'UMUM' };
    const penjamin = penjaminMap[(enc.kdPj || '').trim()] || enc.penjamin || 'UMUM';

    const bill = await this.prisma.bill.create({
      data: {
        encounterId: BigInt(encounterId),
        patientId: enc.patientId,
        noInvoice,
        tanggal: new Date(),
        totalTarif,
        totalDiskon: 0,
        totalBayar: 0,
        sisaBayar: totalTarif,
        penjamin: penjamin as any,
        kdPj: enc.kdPj,
        status: 'OPEN',
        items: {
          create: items.map((i) => ({
            kategori: i.kategori as any,
            deskripsi: i.deskripsi,
            jumlah: i.jumlah,
            tarif: i.tarif,
            tambahan: i.tambahan || 0,
            diskon: 0,
            subtotal: i.subtotal,
            referenceType: i.referenceType || null,
            referenceId: i.referenceId ? BigInt(i.referenceId) : null,
          })),
        },
      },
      include: {
        items: true,
        patient: { select: { id: true, noRm: true, namaLengkap: true } },
      },
    });

    return this.fmtBill(bill);
  }

  /**
   * Daftar billing — worklist kasir
   */
  async getBills(filters: { status?: string; date?: string; penjamin?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.penjamin) where.penjamin = filters.penjamin;
    if (filters.date) {
      const d = new Date(filters.date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.tanggal = { gte: d, lt: next };
    }

    const [data, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, noRm: true, namaLengkap: true } },
          encounter: { select: { id: true, noRawat: true, tipe: true } },
          items: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bill.count({ where }),
    ]);

    return {
      data: data.map(this.fmtBill),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Detail billing
   */
  async getBillById(id: number) {
    const bill = await this.prisma.bill.findUnique({
      where: { id: BigInt(id) },
      include: {
        patient: true,
        encounter: { include: { practitioner: { select: { namaLengkap: true } }, location: { select: { nama: true } } } },
        items: true,
        payments: true,
      },
    });
    if (!bill) throw new NotFoundException('Billing tidak ditemukan');
    return this.fmtBill(bill);
  }

  /**
   * Tambah item manual ke billing
   */
  async addItem(billId: number, dto: { kategori: string; deskripsi: string; jumlah: number; tarif: number }) {
    const bill = await this.prisma.bill.findUnique({ where: { id: BigInt(billId) } });
    if (!bill) throw new NotFoundException('Billing tidak ditemukan');
    if (bill.status !== 'OPEN') throw new BadRequestException('Billing sudah ditutup');

    const subtotal = dto.jumlah * dto.tarif;
    await this.prisma.billItem.create({
      data: {
        billId: BigInt(billId),
        kategori: dto.kategori as any,
        deskripsi: dto.deskripsi,
        jumlah: dto.jumlah,
        tarif: dto.tarif,
        subtotal,
      },
    });

    // Recalculate total
    await this.recalculate(billId);
    return this.getBillById(billId);
  }

  /**
   * Void billing
   */
  async voidBill(billId: number) {
    await this.prisma.bill.update({
      where: { id: BigInt(billId) },
      data: { status: 'VOID' },
    });
    return { message: 'Billing dibatalkan' };
  }

  /**
   * Statistik kasir hari ini
   */
  async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const where = { tanggal: { gte: today, lt: tomorrow } };

    const [totalBills, openBills, closedBills, revenue, payments] = await Promise.all([
      this.prisma.bill.count({ where }),
      this.prisma.bill.count({ where: { ...where, status: 'OPEN' } }),
      this.prisma.bill.count({ where: { ...where, status: 'CLOSED' } }),
      this.prisma.bill.aggregate({ where: { ...where, status: 'CLOSED' }, _sum: { totalBayar: true } }),
      this.prisma.payment.aggregate({
        where: { tanggal: { gte: today, lt: tomorrow } },
        _sum: { jumlah: true },
        _count: true,
      }),
    ]);

    return {
      totalBills,
      openBills,
      closedBills,
      totalRevenue: Number(revenue._sum.totalBayar || 0),
      totalPayments: Number(payments._sum.jumlah || 0),
      paymentCount: payments._count,
    };
  }

  async recalculate(billId: number) {
    const items = await this.prisma.billItem.findMany({ where: { billId: BigInt(billId) } });
    const totalTarif = items.reduce((s, i) => s + Number(i.subtotal), 0);
    const totalDiskon = items.reduce((s, i) => s + Number(i.diskon), 0);

    const payments = await this.prisma.payment.findMany({ where: { billId: BigInt(billId) } });
    const totalBayar = payments.reduce((s, p) => s + Number(p.jumlah), 0);

    await this.prisma.bill.update({
      where: { id: BigInt(billId) },
      data: {
        totalTarif,
        totalDiskon,
        totalBayar,
        sisaBayar: totalTarif - totalDiskon - totalBayar,
        status: totalBayar >= (totalTarif - totalDiskon) ? 'CLOSED' : 'OPEN',
      },
    });
  }

  private async generateInvoiceNo(): Promise<string> {
    const now = new Date();
    const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const last = await this.prisma.bill.findFirst({
      where: { noInvoice: { startsWith: prefix } },
      orderBy: { noInvoice: 'desc' },
      select: { noInvoice: true },
    });
    let seq = 1;
    if (last?.noInvoice) seq = parseInt(last.noInvoice.slice(-4)) + 1;
    return `${prefix}-${String(seq).padStart(4, '0')}`;
  }

  private fmtBill(b: any) {
    return {
      ...b,
      id: Number(b.id),
      encounterId: Number(b.encounterId),
      patientId: Number(b.patientId),
      totalTarif: Number(b.totalTarif),
      totalDiskon: Number(b.totalDiskon),
      totalBayar: Number(b.totalBayar),
      sisaBayar: Number(b.sisaBayar),
      tarifInacbgs: Number(b.tarifInacbgs || 0),
      patient: b.patient ? { ...b.patient, id: Number(b.patient.id) } : undefined,
      encounter: b.encounter ? { ...b.encounter, id: Number(b.encounter.id) } : undefined,
      items: b.items?.map((i: any) => ({
        ...i, id: Number(i.id), billId: Number(i.billId),
        jumlah: Number(i.jumlah), tarif: Number(i.tarif),
        tambahan: Number(i.tambahan || 0), diskon: Number(i.diskon), subtotal: Number(i.subtotal),
      })),
      payments: b.payments?.map((p: any) => ({
        ...p, id: Number(p.id), billId: Number(p.billId), jumlah: Number(p.jumlah),
      })),
    };
  }
}
