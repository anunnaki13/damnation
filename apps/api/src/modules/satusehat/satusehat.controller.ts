import { Controller, Get, Post, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SatusehatService } from './satusehat.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('satusehat')
@ApiBearerAuth()
@Controller('satusehat')
export class SatusehatController {
  constructor(private service: SatusehatService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard statistik sync' })
  getStats() { return this.service.getSyncStats(); }

  @Post('sync/:encounterId')
  @Roles('ADMIN', 'IT', 'DOKTER')
  @ApiOperation({ summary: 'Sync encounter ke SATUSEHAT' })
  syncEncounter(@Param('encounterId', ParseIntPipe) id: number) {
    return this.service.syncEncounter(id);
  }

  @Post('retry-failed')
  @Roles('ADMIN', 'IT')
  @ApiOperation({ summary: 'Retry semua sync yang gagal' })
  async retryFailed() {
    return this.service.retryAllFailed();
  }

  @Get('logs')
  @Roles('ADMIN', 'IT')
  @ApiOperation({ summary: 'Riwayat sync' })
  getLogs(@Query('status') status?: string, @Query('resourceType') resourceType?: string, @Query('limit') limit?: number) {
    return this.service.getSyncLogs({ status, resourceType, limit: limit || 50 });
  }
}
