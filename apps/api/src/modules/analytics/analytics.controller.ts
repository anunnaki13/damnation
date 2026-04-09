import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('kpi')
  @Roles('ADMIN', 'MANAJEMEN')
  @ApiOperation({ summary: 'KPI Operasional RS (BOR, ALOS, BTO, dll)' })
  getKPI(@Query('periode') periode?: string) { return this.service.getKPI(periode); }

  @Get('top-diseases')
  @ApiOperation({ summary: '10 Penyakit Terbanyak' })
  getTopDiseases() { return this.service.getTopDiseases(); }

  @Get('visit-trend')
  @ApiOperation({ summary: 'Trend kunjungan 7 hari terakhir' })
  getVisitTrend() { return this.service.getVisitTrend(); }

  @Get('revenue')
  @Roles('ADMIN', 'MANAJEMEN')
  @ApiOperation({ summary: 'Ringkasan pendapatan bulan ini' })
  getRevenue() { return this.service.getRevenueSummary(); }
}
