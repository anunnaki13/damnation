import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { StockPredictionService } from './stock-prediction.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('pharmacy-stock')
@ApiBearerAuth()
@Controller('pharmacy/stock')
export class StockController {
  constructor(
    private service: StockService,
    private predictionService: StockPredictionService,
  ) {}

  @Post('receive')
  @Roles('APOTEKER', 'ADMIN')
  @ApiOperation({ summary: 'Penerimaan barang (tambah stok)' })
  receive(@Body() dto: { medicineId: number; locationId: number; batchNumber: string; noFaktur?: string; expiredDate?: string; jumlah: number; hargaBeli?: number }) {
    return this.service.receiveStock(dto);
  }

  @Post('adjust/:stockId')
  @Roles('APOTEKER', 'ADMIN')
  @ApiOperation({ summary: 'Stok opname (koreksi stok)' })
  adjust(@Param('stockId', ParseIntPipe) stockId: number, @Body('stok') stok: number, @Body('alasan') alasan: string) {
    return this.service.adjustStock(stockId, stok, alasan);
  }

  @Get('medicine/:medicineId')
  @ApiOperation({ summary: 'Kartu stok per obat' })
  getByMedicine(@Param('medicineId', ParseIntPipe) medicineId: number) {
    return this.service.getStockByMedicine(medicineId);
  }

  @Get('dashboard')
  @Roles('APOTEKER', 'ADMIN')
  @ApiOperation({ summary: 'Dashboard ringkasan stok' })
  getDashboard() { return this.service.getStockDashboard(); }

  @Get('predictions')
  @Roles('APOTEKER', 'ADMIN')
  @ApiOperation({ summary: 'Prediksi kehabisan stok — obat yang akan habis dalam N hari' })
  getPredictions(@Query('days') days?: number) {
    return this.predictionService.getPredictions(days || 7);
  }
}
