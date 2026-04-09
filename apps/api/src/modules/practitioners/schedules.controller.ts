import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('schedules')
@ApiBearerAuth()
@Controller('schedules')
export class SchedulesController {
  constructor(private service: SchedulesService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Buat jadwal praktik dokter' })
  create(@Body() dto: CreateScheduleDto) {
    return this.service.create(dto);
  }

  @Get('location/:locationId')
  @ApiOperation({ summary: 'Jadwal dokter per lokasi/poli' })
  findByLocation(
    @Param('locationId', ParseIntPipe) locationId: number,
    @Query('hari') hari?: string,
  ) {
    return this.service.findByLocation(locationId, hari);
  }

  @Get('practitioner/:practitionerId')
  @ApiOperation({ summary: 'Jadwal per dokter' })
  findByPractitioner(@Param('practitionerId', ParseIntPipe) practitionerId: number) {
    return this.service.findByPractitioner(practitionerId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update jadwal' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateScheduleDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Nonaktifkan jadwal' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
