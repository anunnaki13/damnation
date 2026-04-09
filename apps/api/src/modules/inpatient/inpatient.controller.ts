import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InpatientService } from './inpatient.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('inpatient')
@ApiBearerAuth()
@Controller('inpatient')
export class InpatientController {
  constructor(private service: InpatientService) {}

  @Post('admit')
  @ApiOperation({ summary: 'Admisi rawat inap — assign bed' })
  admit(@Body() dto: any, @CurrentUser('id') userId: number) {
    return this.service.admitPatient(dto, userId);
  }

  @Get('worklist')
  @ApiOperation({ summary: 'Pasien rawat inap aktif' })
  getWorklist(@Query('locationId') locationId?: number) {
    return this.service.getWorklist(locationId ? Number(locationId) : undefined);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistik rawat inap + BOR' })
  getStats() { return this.service.getStats(); }

  @Post('cppt')
  @ApiOperation({ summary: 'Input CPPT (multidisiplin)' })
  addCPPT(@Body() dto: any) { return this.service.addCPPT(dto); }

  @Get(':encounterId/cppt')
  @ApiOperation({ summary: 'Riwayat CPPT per encounter' })
  getCPPT(@Param('encounterId', ParseIntPipe) id: number) { return this.service.getCPPTHistory(id); }

  @Post(':encounterId/transfer')
  @ApiOperation({ summary: 'Transfer bed/kamar' })
  transfer(@Param('encounterId', ParseIntPipe) id: number, @Body('bedId') bedId: number) {
    return this.service.transferBed(id, bedId);
  }

  @Patch(':encounterId/discharge')
  @ApiOperation({ summary: 'Discharge / pulangkan pasien' })
  discharge(@Param('encounterId', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.discharge(id, dto);
  }
}
