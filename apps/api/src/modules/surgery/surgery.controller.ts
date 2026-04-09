import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SurgeryService } from './surgery.service';

@ApiTags('surgery')
@ApiBearerAuth()
@Controller('surgery')
export class SurgeryController {
  constructor(private service: SurgeryService) {}

  @Post('schedule')
  @ApiOperation({ summary: 'Jadwalkan operasi' })
  schedule(@Body() dto: any) { return this.service.scheduleOperation(dto); }

  @Get('schedule')
  @ApiOperation({ summary: 'Jadwal operasi per tanggal' })
  getSchedule(@Query('date') date?: string) { return this.service.getSchedule(date); }

  @Post(':id/report')
  @ApiOperation({ summary: 'Input laporan operasi' })
  report(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.inputLaporanOperasi(id, dto); }
}
