import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('pharmacy')
@ApiBearerAuth()
@Controller('medicines')
export class MedicinesController {
  constructor(private service: MedicinesService) {}

  @Post()
  @Roles('ADMIN', 'APOTEKER')
  @ApiOperation({ summary: 'Tambah obat/alkes baru' })
  create(@Body() dto: CreateMedicineDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar obat (search, filter kategori)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('keyword') keyword?: string,
    @Query('kategori') kategori?: string,
  ) {
    return this.service.findAll(page || 1, limit || 20, keyword, kategori);
  }

  @Get('stock-alerts')
  @Roles('ADMIN', 'APOTEKER')
  @ApiOperation({ summary: 'Obat dengan stok di bawah minimum' })
  getStockAlerts() {
    return this.service.getStockSummary();
  }

  @Get('expiring')
  @Roles('ADMIN', 'APOTEKER')
  @ApiOperation({ summary: 'Obat yang akan expired' })
  getExpiring(@Query('days') days?: number) {
    return this.service.getExpiringSoon(days || 90);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail obat (termasuk stok per lokasi)' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'APOTEKER')
  @ApiOperation({ summary: 'Update data obat' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMedicineDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'APOTEKER')
  @ApiOperation({ summary: 'Nonaktifkan obat (soft delete)' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
