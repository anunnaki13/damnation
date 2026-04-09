import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OutpatientService } from './outpatient.service';
import { SoapService } from './soap.service';
import { DiagnosisService } from './diagnosis.service';
import { PrescriptionService } from './prescription.service';
import { OrderService } from './order.service';
import { CreateSoapDto } from './dto/create-soap.dto';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { CreateLabOrderDto, CreateRadiologyOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('outpatient')
@ApiBearerAuth()
@Controller('outpatient')
export class OutpatientController {
  constructor(
    private outpatientService: OutpatientService,
    private soapService: SoapService,
    private diagnosisService: DiagnosisService,
    private prescriptionService: PrescriptionService,
    private orderService: OrderService,
  ) {}

  // ========== WORKLIST ==========

  @Get('worklist')
  @ApiOperation({ summary: 'Worklist rawat jalan (per dokter/poli/tanggal)' })
  getWorklist(
    @Query('practitionerId') practitionerId?: number,
    @Query('locationId') locationId?: number,
    @Query('date') date?: string,
  ) {
    return this.outpatientService.getWorklist({
      practitionerId: practitionerId ? Number(practitionerId) : undefined,
      locationId: locationId ? Number(locationId) : undefined,
      date,
    });
  }

  @Get('encounter/:id')
  @ApiOperation({ summary: 'Detail encounter lengkap (SOAP, diagnosa, resep, lab, riwayat)' })
  getEncounterDetail(@Param('id', ParseIntPipe) id: number) {
    return this.outpatientService.getEncounterDetail(id);
  }

  @Patch('encounter/:id/start')
  @ApiOperation({ summary: 'Mulai pemeriksaan (status → IN_PROGRESS)' })
  startExamination(@Param('id', ParseIntPipe) id: number) {
    return this.outpatientService.startExamination(id);
  }

  @Patch('encounter/:id/finish')
  @ApiOperation({ summary: 'Selesaikan kunjungan (status → FINISHED)' })
  finishEncounter(@Param('id', ParseIntPipe) id: number) {
    return this.outpatientService.finishEncounter(id);
  }

  // ========== SOAP / RME ==========

  @Post('soap')
  @ApiOperation({ summary: 'Input SOAP / asesmen awal (+ auto simpan vital signs sebagai Observation)' })
  createSoap(@Body() dto: CreateSoapDto) {
    return this.soapService.createAssessment(dto);
  }

  @Patch('soap/:id/sign')
  @ApiOperation({ summary: 'Tandatangani rekam medis (digital signature)' })
  signRecord(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.soapService.signRecord(id, userId);
  }

  // ========== DIAGNOSIS ==========

  @Post('diagnosis')
  @ApiOperation({ summary: 'Tambah diagnosis ICD-10' })
  addDiagnosis(@Body() dto: CreateDiagnosisDto, @CurrentUser('id') userId: number) {
    return this.diagnosisService.addDiagnosis({ ...dto, createdBy: userId });
  }

  @Delete('diagnosis/:id')
  @ApiOperation({ summary: 'Hapus diagnosis' })
  removeDiagnosis(@Param('id', ParseIntPipe) id: number) {
    return this.diagnosisService.removeDiagnosis(id);
  }

  @Get('icd10/search')
  @ApiOperation({ summary: 'Search kode ICD-10 (autocomplete)' })
  searchIcd10(@Query('q') q: string) {
    return this.diagnosisService.searchIcd10(q || '', 20);
  }

  // ========== E-RESEP ==========

  @Post('prescription')
  @ApiOperation({ summary: 'Buat e-resep (otomatis kirim ke farmasi)' })
  createPrescription(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionService.createPrescription(dto);
  }

  @Get('prescription/encounter/:encounterId')
  @ApiOperation({ summary: 'Daftar resep per encounter' })
  getPrescriptions(@Param('encounterId', ParseIntPipe) encounterId: number) {
    return this.prescriptionService.getPrescriptionsByEncounter(encounterId);
  }

  @Get('medicine/search')
  @ApiOperation({ summary: 'Search obat untuk e-resep (autocomplete)' })
  searchMedicine(@Query('q') q: string) {
    return this.prescriptionService.searchMedicine(q || '', 20);
  }

  // ========== ORDER LAB & RADIOLOGI ==========

  @Post('order/lab')
  @ApiOperation({ summary: 'Order pemeriksaan laboratorium' })
  createLabOrder(@Body() dto: CreateLabOrderDto) {
    return this.orderService.createLabOrder(dto);
  }

  @Post('order/radiology')
  @ApiOperation({ summary: 'Order pemeriksaan radiologi' })
  createRadiologyOrder(@Body() dto: CreateRadiologyOrderDto) {
    return this.orderService.createRadiologyOrder(dto);
  }
}
