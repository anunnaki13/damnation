import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface CriticalAlert {
  id: number;
  labOrderId: number;
  patientName: string;
  patientNoRm: string;
  parameter: string;
  hasil: string;
  satuan: string;
  nilaiNormal: string;
  flag: string;
  requesterId: number;
  requesterName: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt: Date | null;
  acknowledgedBy: number | null;
}

@Injectable()
export class CriticalAlertService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check for critical results and return alerts
   * Called after lab result input
   */
  async checkAndCreateAlerts(labOrderItemId: number): Promise<CriticalAlert[]> {
    const results = await this.prisma.labResult.findMany({
      where: {
        labOrderItemId: BigInt(labOrderItemId),
        flag: { in: ['CRITICAL_HIGH', 'CRITICAL_LOW'] },
      },
      include: {
        labOrderItem: {
          include: {
            labOrder: {
              include: {
                patient: { select: { id: true, noRm: true, namaLengkap: true } },
                requester: { select: { id: true, namaLengkap: true, noHp: true } },
              },
            },
          },
        },
      },
    });

    return results.map((r) => ({
      id: Number(r.id),
      labOrderId: Number(r.labOrderItem.labOrderId),
      patientName: r.labOrderItem.labOrder.patient.namaLengkap,
      patientNoRm: r.labOrderItem.labOrder.patient.noRm,
      parameter: r.parameter,
      hasil: r.hasil || '',
      satuan: r.satuan || '',
      nilaiNormal: r.nilaiNormal || '',
      flag: r.flag || '',
      requesterId: Number(r.labOrderItem.labOrder.requester.id),
      requesterName: r.labOrderItem.labOrder.requester.namaLengkap,
      timestamp: r.createdAt,
      acknowledged: false,
      acknowledgedAt: null,
      acknowledgedBy: null,
    }));
  }

  /**
   * Get all unacknowledged critical alerts
   */
  async getActiveAlerts(): Promise<CriticalAlert[]> {
    const results = await this.prisma.labResult.findMany({
      where: {
        flag: { in: ['CRITICAL_HIGH', 'CRITICAL_LOW'] },
        validatedAt: null, // not yet acknowledged
      },
      include: {
        labOrderItem: {
          include: {
            labOrder: {
              include: {
                patient: { select: { id: true, noRm: true, namaLengkap: true } },
                requester: { select: { id: true, namaLengkap: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return results.map((r) => ({
      id: Number(r.id),
      labOrderId: Number(r.labOrderItem.labOrderId),
      patientName: r.labOrderItem.labOrder.patient.namaLengkap,
      patientNoRm: r.labOrderItem.labOrder.patient.noRm,
      parameter: r.parameter,
      hasil: r.hasil || '',
      satuan: r.satuan || '',
      nilaiNormal: r.nilaiNormal || '',
      flag: r.flag || '',
      requesterId: Number(r.labOrderItem.labOrder.requester.id),
      requesterName: r.labOrderItem.labOrder.requester.namaLengkap,
      timestamp: r.createdAt,
      acknowledged: !!r.validatedAt,
      acknowledgedAt: r.validatedAt,
      acknowledgedBy: r.validatorId ? Number(r.validatorId) : null,
    }));
  }

  /**
   * Acknowledge a critical alert
   */
  async acknowledgeAlert(resultId: number, userId: number) {
    await this.prisma.labResult.update({
      where: { id: BigInt(resultId) },
      data: { validatorId: BigInt(userId), validatedAt: new Date() },
    });
    return { message: 'Alert acknowledged', resultId, acknowledgedBy: userId };
  }

  /**
   * Get alert statistics
   */
  async getAlertStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalCritical, unacknowledged, acknowledgedToday] = await Promise.all([
      this.prisma.labResult.count({ where: { flag: { in: ['CRITICAL_HIGH', 'CRITICAL_LOW'] } } }),
      this.prisma.labResult.count({ where: { flag: { in: ['CRITICAL_HIGH', 'CRITICAL_LOW'] }, validatedAt: null } }),
      this.prisma.labResult.count({ where: { flag: { in: ['CRITICAL_HIGH', 'CRITICAL_LOW'] }, validatedAt: { gte: today } } }),
    ]);

    return { totalCritical, unacknowledged, acknowledgedToday };
  }
}
