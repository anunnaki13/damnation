import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
@ApiTags('assets')
@ApiBearerAuth()
@Controller('assets')
export class AssetsController {
  constructor(private service: AssetsService) {}
  @Get() @ApiOperation({ summary: 'Daftar aset' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('kategori') kategori?: string) { return this.service.findAll(page || 1, limit || 20, kategori); }
  @Get('stats') @ApiOperation({ summary: 'Statistik aset' })
  getStats() { return this.service.getStats(); }
  @Post() @ApiOperation({ summary: 'Tambah aset baru' })
  create(@Body() dto: any) { return this.service.create(dto); }
}
