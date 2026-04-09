import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { TriaseDto } from './dto/triase.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('emergency')
@ApiBearerAuth()
@Controller('emergency')
export class EmergencyController {
  constructor(private service: EmergencyService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrasi cepat IGD (bisa tanpa data lengkap pasien)' })
  quickRegister(@Body() dto: CreateEmergencyDto, @CurrentUser('id') userId: number) {
    return this.service.quickRegister(dto, userId);
  }

  @Get('worklist')
  @ApiOperation({ summary: 'Worklist IGD (urut by triase level)' })
  getWorklist(@Query('date') date?: string) {
    return this.service.getWorklist(date);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistik IGD hari ini (per ESI level)' })
  getStats() {
    return this.service.getTodayStats();
  }

  @Post(':id/triase')
  @ApiOperation({ summary: 'Input triase ESI + primary/secondary survey' })
  setTriase(@Param('id', ParseIntPipe) id: number, @Body() dto: TriaseDto) {
    return this.service.setTriase(id, dto);
  }

  @Patch(':id/disposisi')
  @ApiOperation({ summary: 'Disposisi IGD (pulang/rawat inap/rujuk/DOA)' })
  disposisi(@Param('id', ParseIntPipe) id: number, @Body() dto: { disposisi: string; catatan?: string }) {
    return this.service.disposisi(id, dto);
  }
}
