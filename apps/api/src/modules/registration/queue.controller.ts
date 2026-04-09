import {
  Controller, Get, Post, Patch, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('queue')
@ApiBearerAuth()
@Controller('queue')
export class QueueController {
  constructor(private service: QueueService) {}

  @Get('today/:locationId')
  @ApiOperation({ summary: 'Antrean hari ini per poli' })
  getTodayQueue(@Param('locationId', ParseIntPipe) locationId: number) {
    return this.service.getTodayQueue(locationId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan antrean semua poli hari ini' })
  getAllQueueSummary() {
    return this.service.getAllQueueSummary();
  }

  @Post('call-next/:locationId')
  @ApiOperation({ summary: 'Panggil pasien berikutnya' })
  callNext(@Param('locationId', ParseIntPipe) locationId: number) {
    return this.service.callNext(locationId);
  }

  @Patch('serve/:ticketId')
  @ApiOperation({ summary: 'Mulai layani pasien (CALLED → SERVING)' })
  startServing(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.service.startServing(ticketId);
  }

  @Patch('skip/:ticketId')
  @ApiOperation({ summary: 'Skip/lewati antrean' })
  skipTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.service.skipTicket(ticketId);
  }

  @Get('display/:locationId')
  @Public()
  @ApiOperation({ summary: 'Display antrean untuk monitor/TV (public, no auth)' })
  getDisplayQueue(@Param('locationId', ParseIntPipe) locationId: number) {
    return this.service.getTodayQueue(locationId);
  }
}
