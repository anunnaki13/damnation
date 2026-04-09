import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface TimelineEvent {
  id: string;
  type: 'encounter' | 'diagnosis' | 'prescription' | 'lab' | 'radiology' | 'procedure' | 'bill' | 'vital';
  date: Date;
  title: string;
  subtitle: string;
  detail?: string;
  status?: string;
  color: string;
}

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async getPatientTimeline(patientId: number, limit = 50): Promise<TimelineEvent[]> {
    const pid = BigInt(patientId);
    const patient = await this.prisma.patient.findUnique({ where: { id: pid } });
    if (!patient) throw new NotFoundException('Pasien tidak ditemukan');

    const events: TimelineEvent[] = [];

    // Encounters
    const encounters = await this.prisma.encounter.findMany({
      where: { patientId: pid },
      include: { location: { select: { nama: true } }, practitioner: { select: { namaLengkap: true } } },
      orderBy: { tanggalMasuk: 'desc' }, take: limit,
    });
    encounters.forEach((e) => events.push({
      id: `enc-${e.id}`, type: 'encounter', date: e.tanggalMasuk,
      title: `Kunjungan ${e.tipe.replace('_', ' ')}`, subtitle: `${e.location.nama} — ${e.practitioner?.namaLengkap || '-'}`,
      detail: e.noRawat, status: e.status, color: e.tipe === 'IGD' ? 'var(--rose)' : e.tipe === 'RAWAT_INAP' ? 'var(--amber)' : 'var(--primary)',
    }));

    // Diagnoses
    const diagnoses = await this.prisma.diagnosis.findMany({
      where: { patientId: pid, isActive: true }, orderBy: { createdAt: 'desc' }, take: limit,
    });
    diagnoses.forEach((d) => events.push({
      id: `dx-${d.id}`, type: 'diagnosis', date: d.createdAt,
      title: `Diagnosis: ${d.icd10Code}`, subtitle: d.icd10Display || '', detail: d.tipe, color: 'var(--amber)',
    }));

    // Prescriptions
    const prescriptions = await this.prisma.prescription.findMany({
      where: { patientId: pid }, include: { items: { include: { medicine: { select: { namaGenerik: true } } } } },
      orderBy: { createdAt: 'desc' }, take: limit,
    });
    prescriptions.forEach((rx) => events.push({
      id: `rx-${rx.id}`, type: 'prescription', date: rx.createdAt,
      title: `Resep: ${rx.noResep}`, subtitle: rx.items.map((i) => i.medicine.namaGenerik).join(', '),
      status: rx.status, color: 'var(--teal)',
    }));

    // Lab Orders
    const labs = await this.prisma.labOrder.findMany({
      where: { patientId: pid }, include: { items: true },
      orderBy: { tanggalOrder: 'desc' }, take: limit,
    });
    labs.forEach((l) => events.push({
      id: `lab-${l.id}`, type: 'lab', date: l.tanggalOrder,
      title: `Lab: ${l.noOrder}`, subtitle: l.items.map((i) => i.pemeriksaan).join(', '),
      status: l.status, color: 'var(--sky)',
    }));

    // Radiology
    const rads = await this.prisma.radiologyOrder.findMany({
      where: { patientId: pid }, orderBy: { createdAt: 'desc' }, take: limit,
    });
    rads.forEach((r) => events.push({
      id: `rad-${r.id}`, type: 'radiology', date: r.createdAt,
      title: `Radiologi: ${r.modalitas}`, subtitle: r.jenisPemeriksaan,
      detail: r.kesan || undefined, status: r.status, color: 'var(--primary-soft)',
    }));

    // Bills
    const bills = await this.prisma.bill.findMany({
      where: { patientId: pid }, orderBy: { createdAt: 'desc' }, take: limit,
    });
    bills.forEach((b) => events.push({
      id: `bill-${b.id}`, type: 'bill', date: b.createdAt,
      title: `Billing: ${b.noInvoice}`, subtitle: `Rp ${Number(b.totalTarif).toLocaleString('id-ID')}`,
      status: b.status, color: b.status === 'CLOSED' ? 'var(--teal)' : 'var(--amber)',
    }));

    // Sort all by date descending
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return events.slice(0, limit);
  }
}
