import {
  Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('registration')
@ApiBearerAuth()
@Controller('registration')
export class RegistrationController {
  constructor(private service: RegistrationService) {}

  @Post('encounter')
  @ApiOperation({ summary: 'Daftarkan kunjungan baru (rawat jalan/IGD)' })
  createEncounter(
    @Body() dto: CreateEncounterDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.service.createEncounter(dto, userId);
  }

  @Get('today')
  @ApiOperation({ summary: 'Daftar kunjungan hari ini (worklist)' })
  getTodayEncounters(
    @Query('locationId') locationId?: number,
    @Query('status') status?: string,
  ) {
    return this.service.getTodayEncounters(
      locationId ? Number(locationId) : undefined,
      status,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistik registrasi hari ini' })
  getTodayStats() {
    return this.service.getTodayStats();
  }

  @Get('encounter/:id')
  @ApiOperation({ summary: 'Detail kunjungan lengkap' })
  getEncounterById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getEncounterById(id);
  }

  @Patch('encounter/:id/status')
  @ApiOperation({ summary: 'Update status kunjungan' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.service.updateStatus(id, status);
  }

  @Patch('encounter/:id/cancel')
  @ApiOperation({ summary: 'Batalkan kunjungan' })
  cancelEncounter(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancelEncounter(id);
  }
}
