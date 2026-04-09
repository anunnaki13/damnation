import {
  Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { TimelineService } from './timeline.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientDto } from './dto/search-patient.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
export class PatientsController {
  constructor(
    private patientsService: PatientsService,
    private timelineService: TimelineService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrasi pasien baru' })
  create(@Body() dto: CreatePatientDto, @CurrentUser('id') userId: number) {
    return this.patientsService.create(dto, userId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Cari pasien (No.RM, NIK, nama, No.BPJS)' })
  search(@Query() dto: SearchPatientDto) {
    return this.patientsService.search(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail pasien by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.findById(id);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Patient journey timeline — seluruh riwayat chronological' })
  getTimeline(@Param('id', ParseIntPipe) id: number, @Query('limit') limit?: number) {
    return this.timelineService.getPatientTimeline(id, limit || 50);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data pasien' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }
}
