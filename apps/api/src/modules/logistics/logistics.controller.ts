import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service';
@ApiTags('logistics')
@ApiBearerAuth()
@Controller('logistics')
export class LogisticsController {
  constructor(private service: LogisticsService) {}
  @Get() @ApiOperation({ summary: 'Daftar inventaris' })
  findAll(@Query('page') page?: number, @Query('kategori') kategori?: string) { return this.service.findAll(page || 1, 20, kategori); }
  @Get('stats') @ApiOperation({ summary: 'Statistik inventaris' })
  getStats() { return this.service.getStats(); }
  @Post() @ApiOperation({ summary: 'Tambah item inventaris' })
  create(@Body() dto: any) { return this.service.create(dto); }
}
