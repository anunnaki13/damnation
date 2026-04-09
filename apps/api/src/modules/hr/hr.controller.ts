import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HrService } from './hr.service';
@ApiTags('hr')
@ApiBearerAuth()
@Controller('hr')
export class HrController {
  constructor(private service: HrService) {}
  @Get('employees') @ApiOperation({ summary: 'Daftar pegawai' })
  getEmployees(@Query('page') page?: number) { return this.service.getEmployees(page || 1); }
  @Get('stats') @ApiOperation({ summary: 'Statistik kepegawaian' })
  getStats() { return this.service.getStats(); }
}
