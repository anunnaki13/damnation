import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RadiologyService } from './radiology.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('radiology')
@ApiBearerAuth()
@Controller('radiology')
export class RadiologyController {
  constructor(private service: RadiologyService) {}

  @Get('worklist')
  @ApiOperation({ summary: 'Worklist order radiologi' })
  getWorklist(@Query('status') status?: string) { return this.service.getWorklist(status); }

  @Get('stats')
  @ApiOperation({ summary: 'Statistik radiologi hari ini' })
  getStats() { return this.service.getTodayStats(); }

  @Get('order/:id')
  @ApiOperation({ summary: 'Detail order radiologi' })
  getDetail(@Param('id', ParseIntPipe) id: number) { return this.service.getOrderDetail(id); }

  @Patch('order/:id/status')
  @Roles('RADIOGRAFER', 'ADMIN')
  @ApiOperation({ summary: 'Update status order' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Post('order/:id/expertise')
  @Roles('RADIOGRAFER', 'DOKTER', 'ADMIN')
  @ApiOperation({ summary: 'Input expertise / bacaan radiolog' })
  inputExpertise(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.inputExpertise(id, dto);
  }
}
