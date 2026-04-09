import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * FHIR R4 Resource Builder for SATUSEHAT
 * Builds compliant FHIR resources from SIMRS data
 */
@Injectable()
export class FhirBuilderService {
  private orgId: string;

  constructor(private config: ConfigService) {
    this.orgId = this.config.get('SATUSEHAT_ORGANIZATION_ID', 'ORG-PLACEHOLDER');
  }

  buildEncounter(data: any) {
    return {
      resourceType: 'Encounter',
      identifier: [{ system: `http://sys-ids.kemkes.go.id/encounter/${this.orgId}`, value: data.noRawat }],
      status: this.mapEncounterStatus(data.status),
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: data.tipe === 'RAWAT_JALAN' ? 'AMB' : data.tipe === 'IGD' ? 'EMER' : 'IMP',
        display: data.tipe === 'RAWAT_JALAN' ? 'ambulatory' : data.tipe === 'IGD' ? 'emergency' : 'inpatient encounter',
      },
      subject: { reference: `Patient/${data.patientSatusehatId}`, display: data.patientNama },
      participant: data.practitionerSatusehatId ? [{
        type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: 'ATND', display: 'attender' }] }],
        individual: { reference: `Practitioner/${data.practitionerSatusehatId}`, display: data.practitionerNama },
      }] : [],
      period: {
        start: this.fhirDateTime(data.tanggalMasuk),
        ...(data.tanggalKeluar ? { end: this.fhirDateTime(data.tanggalKeluar) } : {}),
      },
      location: [{ location: { reference: `Location/${data.locationSatusehatId}`, display: data.locationNama } }],
      serviceProvider: { reference: `Organization/${this.orgId}` },
    };
  }

  buildCondition(data: any) {
    return {
      resourceType: 'Condition',
      clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active', display: 'Active' }] },
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis', display: 'Encounter Diagnosis' }] }],
      code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: data.icd10Code, display: data.icd10Display }] },
      subject: { reference: `Patient/${data.patientSatusehatId}` },
      encounter: { reference: `Encounter/${data.encounterSatusehatId}` },
      recordedDate: this.fhirDateTime(data.createdAt),
    };
  }

  buildObservation(data: any) {
    return {
      resourceType: 'Observation',
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: data.category, display: data.category }] }],
      code: { coding: [{ system: 'http://loinc.org', code: data.loincCode, display: data.loincDisplay }] },
      subject: { reference: `Patient/${data.patientSatusehatId}` },
      encounter: { reference: `Encounter/${data.encounterSatusehatId}` },
      effectiveDateTime: this.fhirDateTime(data.effectiveAt),
      valueQuantity: data.valueQuantity ? {
        value: Number(data.valueQuantity),
        unit: data.valueUnit,
        system: 'http://unitsofmeasure.org',
        code: data.valueUnit,
      } : undefined,
    };
  }

  buildMedicationRequest(data: any) {
    return {
      resourceType: 'MedicationRequest',
      identifier: [{ system: `http://sys-ids.kemkes.go.id/prescription/${this.orgId}`, value: data.noResep }],
      status: 'completed',
      intent: 'order',
      medicationReference: { display: data.medicineNama },
      subject: { reference: `Patient/${data.patientSatusehatId}` },
      encounter: { reference: `Encounter/${data.encounterSatusehatId}` },
      authoredOn: this.fhirDateTime(data.createdAt),
      requester: { reference: `Practitioner/${data.prescriberSatusehatId}` },
      dosageInstruction: [{ text: data.aturanPakai || data.dosis, timing: { code: { text: data.frekuensi } } }],
      dispenseRequest: { quantity: { value: Number(data.jumlah), unit: data.satuan } },
    };
  }

  buildComposition(data: any) {
    return {
      resourceType: 'Composition',
      identifier: { system: `http://sys-ids.kemkes.go.id/composition/${this.orgId}`, value: data.noRawat },
      status: 'final',
      type: { coding: [{ system: 'http://loinc.org', code: '18842-5', display: 'Discharge summary' }] },
      subject: { reference: `Patient/${data.patientSatusehatId}` },
      encounter: { reference: `Encounter/${data.encounterSatusehatId}` },
      date: this.fhirDateTime(data.tanggalKeluar || new Date()),
      author: [{ reference: `Practitioner/${data.practitionerSatusehatId}` }],
      title: 'Resume Medis',
      section: [
        { title: 'Diagnosis', entry: data.diagnoses?.map((d: any) => ({ reference: `Condition/${d.satusehatId}` })) || [] },
        { title: 'Pemeriksaan', entry: data.observations?.map((o: any) => ({ reference: `Observation/${o.satusehatId}` })) || [] },
      ],
    };
  }

  private mapEncounterStatus(status: string): string {
    const map: Record<string, string> = {
      PLANNED: 'planned', ARRIVED: 'arrived', IN_PROGRESS: 'in-progress',
      ON_LEAVE: 'onleave', FINISHED: 'finished', CANCELLED: 'cancelled',
    };
    return map[status] || 'unknown';
  }

  private fhirDateTime(date: Date | string): string {
    return new Date(date).toISOString();
  }
}
