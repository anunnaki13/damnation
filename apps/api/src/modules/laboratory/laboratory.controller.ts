import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LaboratoryService } from './laboratory.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('laboratory')
@ApiBearerAuth()
@Controller('lab')
export class LaboratoryController {
  constructor(private service: LaboratoryService) {}

  @Get('worklist')
  @ApiOperation({ summary: 'Worklist order lab' })
  getWorklist(@Query('status') status?: string) { return this.service.getWorklist(status); }

  @Get('stats')
  @ApiOperation({ summary: 'Statistik lab hari ini' })
  getStats() { return this.service.getTodayStats(); }

  @Get('order/:id')
  @ApiOperation({ summary: 'Detail order + hasil' })
  getDetail(@Param('id', ParseIntPipe) id: number) { return this.service.getOrderDetail(id); }

  @Patch('order/:id/status')
  @Roles('LAB_ANALIS', 'ADMIN')
  @ApiOperation({ summary: 'Update status order (SPECIMEN_COLLECTED, IN_PROGRESS)' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Post('order/:itemId/results')
  @Roles('LAB_ANALIS', 'ADMIN')
  @ApiOperation({ summary: 'Input hasil lab per parameter' })
  inputResult(@Param('itemId', ParseIntPipe) itemId: number, @Body('results') results: any[]) {
    return this.service.inputResult(itemId, results);
  }

  @Post('order/:id/validate')
  @Roles('LAB_ANALIS', 'ADMIN')
  @ApiOperation({ summary: 'Validasi hasil lab' })
  validate(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.service.validateResult(id, userId);
  }

  @Get('patient/:patientId/history')
  @ApiOperation({ summary: 'Riwayat lab per pasien' })
  getHistory(@Param('patientId', ParseIntPipe) id: number) { return this.service.getPatientLabHistory(id); }
}
