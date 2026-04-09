import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { FhirBuilderService } from './fhir-builder.service';
import axios from 'axios';

@Injectable()
export class SatusehatService {
  private baseUrl: string;
  private authUrl: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private fhirBuilder: FhirBuilderService,
  ) {
    this.baseUrl = this.config.get('SATUSEHAT_BASE_URL', 'https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1');
    this.authUrl = this.config.get('SATUSEHAT_AUTH_URL', 'https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1');
  }

  /** Get OAuth2 access token */
  private async getAccessToken(): Promise<string> {
    const clientId = this.config.get('SATUSEHAT_CLIENT_ID');
    const clientSecret = this.config.get('SATUSEHAT_CLIENT_SECRET');
    if (!clientId || !clientSecret) return '';

    try {
      const res = await axios.post(`${this.authUrl}/accesstoken?grant_type=client_credentials`, null, {
        params: { client_id: clientId, client_secret: clientSecret },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return res.data.access_token;
    } catch { return ''; }
  }

  isConfigured(): boolean {
    return !!(this.config.get('SATUSEHAT_CLIENT_ID') && this.config.get('SATUSEHAT_CLIENT_SECRET'));
  }

  /** Sync encounter + related resources to SATUSEHAT */
  async syncEncounter(encounterId: number) {
    const enc = await this.prisma.encounter.findUnique({
      where: { id: BigInt(encounterId) },
      include: {
        patient: true, practitioner: true, location: true,
        diagnoses: { where: { isActive: true } },
        observations: true,
        prescriptions: { include: { items: { include: { medicine: true } } } },
      },
    });
    if (!enc) throw new HttpException('Encounter not found', 404);

    const results: any[] = [];

    // 1. Sync Encounter
    const encounterFhir = this.fhirBuilder.buildEncounter({
      noRawat: enc.noRawat, status: enc.status, tipe: enc.tipe,
      patientSatusehatId: enc.patient.satusehatId, patientNama: enc.patient.namaLengkap,
      practitionerSatusehatId: enc.practitioner?.satusehatId, practitionerNama: enc.practitioner?.namaLengkap,
      locationSatusehatId: enc.location.satusehatId, locationNama: enc.location.nama,
      tanggalMasuk: enc.tanggalMasuk, tanggalKeluar: enc.tanggalKeluar,
    });
    const encResult = await this.sendResource('Encounter', encounterFhir, Number(enc.id));
    results.push({ resource: 'Encounter', ...encResult });

    // 2. Sync Conditions (Diagnoses)
    for (const dx of enc.diagnoses) {
      const condFhir = this.fhirBuilder.buildCondition({
        icd10Code: dx.icd10Code, icd10Display: dx.icd10Display,
        patientSatusehatId: enc.patient.satusehatId,
        encounterSatusehatId: encResult.satusehatId || enc.satusehatId,
        createdAt: dx.createdAt,
      });
      const r = await this.sendResource('Condition', condFhir, Number(dx.id));
      results.push({ resource: 'Condition', icd10: dx.icd10Code, ...r });
    }

    // 3. Sync Observations (Vital Signs)
    for (const obs of enc.observations) {
      const obsFhir = this.fhirBuilder.buildObservation({
        category: obs.category, loincCode: obs.loincCode, loincDisplay: obs.loincDisplay,
        valueQuantity: obs.valueQuantity, valueUnit: obs.valueUnit,
        patientSatusehatId: enc.patient.satusehatId,
        encounterSatusehatId: encResult.satusehatId || enc.satusehatId,
        effectiveAt: obs.effectiveAt,
      });
      const r = await this.sendResource('Observation', obsFhir, Number(obs.id));
      results.push({ resource: 'Observation', loinc: obs.loincCode, ...r });
    }

    // Update encounter fhir_synced
    await this.prisma.encounter.update({
      where: { id: enc.id },
      data: { fhirSynced: true, fhirSyncedAt: new Date() },
    });

    return { encounterId, totalResources: results.length, results };
  }

  /** Send single FHIR resource */
  private async sendResource(resourceType: string, resource: any, localId: number) {
    if (!this.isConfigured()) {
      // Simulation mode
      const simId = `sim-${resourceType.toLowerCase()}-${localId}-${Date.now()}`;
      await this.prisma.satusehatSyncLog.create({
        data: {
          resourceType, localId: BigInt(localId), satusehatId: simId,
          action: 'CREATE', status: 'SUCCESS',
          requestBody: resource, responseBody: { id: simId, mode: 'simulation' },
        },
      });
      return { status: 'SIMULATED', satusehatId: simId };
    }

    try {
      const token = await this.getAccessToken();
      const res = await axios.post(`${this.baseUrl}/${resourceType}`, resource, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/fhir+json' },
        timeout: 30000,
      });

      const satusehatId = res.data.id;
      await this.prisma.satusehatSyncLog.create({
        data: {
          resourceType, localId: BigInt(localId), satusehatId,
          action: 'CREATE', status: 'SUCCESS',
          requestBody: resource, responseBody: res.data,
        },
      });
      return { status: 'SUCCESS', satusehatId };
    } catch (err: any) {
      await this.prisma.satusehatSyncLog.create({
        data: {
          resourceType, localId: BigInt(localId),
          action: 'CREATE', status: 'FAILED',
          requestBody: resource, responseBody: err.response?.data,
          errorMessage: err.message,
        },
      });
      return { status: 'FAILED', error: err.message };
    }
  }

  /** Get sync status & logs */
  async getSyncLogs(filters: { status?: string; resourceType?: string; limit?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.resourceType) where.resourceType = filters.resourceType;

    const data = await this.prisma.satusehatSyncLog.findMany({
      where, take: filters.limit || 50,
      orderBy: { createdAt: 'desc' },
    });
    return data.map((d) => ({ ...d, id: Number(d.id), localId: Number(d.localId) }));
  }

  /** Retry all failed syncs */
  async retryAllFailed() {
    // Get all unsynced finished encounters
    const unsynced = await this.prisma.encounter.findMany({
      where: { fhirSynced: false, status: 'FINISHED' },
      select: { id: true, noRawat: true },
      take: 50,
    });

    const results = [];
    for (const enc of unsynced) {
      try {
        const r = await this.syncEncounter(Number(enc.id));
        results.push({ encounterId: Number(enc.id), noRawat: enc.noRawat, status: 'SUCCESS', resources: r.totalResources });
      } catch (e: any) {
        results.push({ encounterId: Number(enc.id), noRawat: enc.noRawat, status: 'FAILED', error: e.message });
      }
    }

    return {
      message: `Retry completed: ${results.filter((r) => r.status === 'SUCCESS').length}/${results.length} success`,
      total: results.length,
      success: results.filter((r) => r.status === 'SUCCESS').length,
      failed: results.filter((r) => r.status === 'FAILED').length,
      details: results,
    };
  }

  /** Dashboard — sync statistics */
  async getSyncStats() {
    const [total, success, failed, pending, unsyncedEncounters] = await Promise.all([
      this.prisma.satusehatSyncLog.count(),
      this.prisma.satusehatSyncLog.count({ where: { status: 'SUCCESS' } }),
      this.prisma.satusehatSyncLog.count({ where: { status: 'FAILED' } }),
      this.prisma.satusehatSyncLog.count({ where: { status: 'PENDING' } }),
      this.prisma.encounter.count({ where: { fhirSynced: false, status: 'FINISHED' } }),
    ]);
    return { total, success, failed, pending, unsyncedEncounters, configured: this.isConfigured() };
  }
}
