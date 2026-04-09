import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BedService } from './bed.service';

@ApiTags('bed-management')
@ApiBearerAuth()
@Controller('beds')
export class BedController {
  constructor(private service: BedService) {}

  @Get('map')
  @ApiOperation({ summary: 'Bed map — semua bangsal + bed + occupant' })
  getBedMap() { return this.service.getBedMap(); }

  @Get('available')
  @ApiOperation({ summary: 'Bed tersedia (filter by kelas)' })
  getAvailable(@Query('kelas') kelas?: string) { return this.service.getAvailableBeds(kelas); }

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan ketersediaan per kelas' })
  getSummary() { return this.service.getAvailabilitySummary(); }
}
