import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateSoapDto } from './dto/create-soap.dto';
import * as crypto from 'crypto';

@Injectable()
export class SoapService {
  constructor(private prisma: PrismaService) {}

  /**
   * Input asesmen awal perawat (tanda vital + keluhan)
   */
  async createAssessment(dto: CreateSoapDto) {
    const enc = await this.prisma.encounter.findUnique({ where: { id: BigInt(dto.encounterId) } });
    if (!enc) throw new NotFoundException('Encounter tidak ditemukan');

    // Simpan tanda vital sebagai Observation (FHIR-ready)
    if (dto.tekananDarahSistolik || dto.nadi || dto.suhu) {
      const vitals = [];
      if (dto.tekananDarahSistolik) {
        vitals.push({ loincCode: '8480-6', loincDisplay: 'Systolic blood pressure', valueQuantity: dto.tekananDarahSistolik, valueUnit: 'mmHg', category: 'vital-signs' });
        vitals.push({ loincCode: '8462-4', loincDisplay: 'Diastolic blood pressure', valueQuantity: dto.tekananDarahDiastolik || 0, valueUnit: 'mmHg', category: 'vital-signs' });
      }
      if (dto.nadi) vitals.push({ loincCode: '8867-4', loincDisplay: 'Heart rate', valueQuantity: dto.nadi, valueUnit: '/min', category: 'vital-signs' });
      if (dto.suhu) vitals.push({ loincCode: '8310-5', loincDisplay: 'Body temperature', valueQuantity: dto.suhu, valueUnit: 'Cel', category: 'vital-signs' });
      if (dto.pernapasan) vitals.push({ loincCode: '9279-1', loincDisplay: 'Respiratory rate', valueQuantity: dto.pernapasan, valueUnit: '/min', category: 'vital-signs' });
      if (dto.spo2) vitals.push({ loincCode: '2708-6', loincDisplay: 'Oxygen saturation', valueQuantity: dto.spo2, valueUnit: '%', category: 'vital-signs' });
      if (dto.tinggiBadan) vitals.push({ loincCode: '8302-2', loincDisplay: 'Body height', valueQuantity: dto.tinggiBadan, valueUnit: 'cm', category: 'vital-signs' });
      if (dto.beratBadan) vitals.push({ loincCode: '29463-7', loincDisplay: 'Body weight', valueQuantity: dto.beratBadan, valueUnit: 'kg', category: 'vital-signs' });

      for (const v of vitals) {
        await this.prisma.observation.create({
          data: {
            encounterId: BigInt(dto.encounterId),
            patientId: enc.patientId,
            category: v.category,
            loincCode: v.loincCode,
            loincDisplay: v.loincDisplay,
            valueQuantity: v.valueQuantity,
            valueUnit: v.valueUnit,
            effectiveAt: new Date(),
            status: 'FINAL',
          },
        });
      }
    }

    // Simpan SOAP / asesmen awal
    const record = await this.prisma.medicalRecord.create({
      data: {
        encounterId: BigInt(dto.encounterId),
        patientId: enc.patientId,
        practitionerId: BigInt(dto.practitionerId),
        tipe: dto.tipe as any || 'SOAP',
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        plan: dto.plan,
        tekananDarahSistolik: dto.tekananDarahSistolik,
        tekananDarahDiastolik: dto.tekananDarahDiastolik,
        nadi: dto.nadi,
        suhu: dto.suhu,
        pernapasan: dto.pernapasan,
        spo2: dto.spo2,
        tinggiBadan: dto.tinggiBadan,
        beratBadan: dto.beratBadan,
      },
    });

    return { ...record, id: Number(record.id) };
  }

  /**
   * Sign / tandatangani rekam medis
   */
  async signRecord(recordId: number, practitionerId: number) {
    const hash = crypto.createHash('sha256')
      .update(`${practitionerId}-${recordId}-${Date.now()}`)
      .digest('hex');

    const record = await this.prisma.medicalRecord.update({
      where: { id: BigInt(recordId) },
      data: { signedBy: BigInt(practitionerId), signedAt: new Date(), signatureHash: hash },
    });

    return { ...record, id: Number(record.id), signatureHash: hash };
  }
}
