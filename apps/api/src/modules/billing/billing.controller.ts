import {
  Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { PaymentService } from './payment.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(
    private billingService: BillingService,
    private paymentService: PaymentService,
  ) {}

  @Post('generate/:encounterId')
  @Roles('KASIR', 'ADMIN')
  @ApiOperation({ summary: 'Generate billing otomatis dari encounter' })
  generate(@Param('encounterId', ParseIntPipe) encounterId: number) {
    return this.billingService.generateBill(encounterId);
  }

  @Get()
  @Roles('KASIR', 'ADMIN')
  @ApiOperation({ summary: 'Daftar billing (worklist kasir)' })
  getBills(
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('penjamin') penjamin?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.billingService.getBills({ status, date, penjamin, page: page || 1, limit: limit || 20 });
  }

  @Get('stats')
  @Roles('KASIR', 'ADMIN')
  @ApiOperation({ summary: 'Statistik kasir hari ini' })
  getStats() {
    return this.billingService.getTodayStats();
  }

  @Get(':id')
  @Roles('KASIR', 'ADMIN')
  @ApiOperation({ summary: 'Detail billing (items + payments)' })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.billingService.getBillById(id);
  }

  @Post(':id/item')
  @Roles('KASIR', 'ADMIN')
  @ApiOperation({ summary: 'Tambah item manual ke billing' })
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { kategori: string; deskripsi: string; jumlah: number; tarif: number },
  ) {
    return this.billingService.addItem(id, dto);
  }

  @Patch(':id/void')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Void/batalkan billing' })
  voidBill(@Param('id', ParseIntPipe) id: number) {
    return this.billingService.voidBill(id);
  }

  @Post('pay')
  @Roles('KASIR', 'ADMIN')
  @ApiOperation({ summary: 'Proses pembayaran (multi-metode)' })
  pay(
    @Body() dto: { billId: number; jumlah: number; metode: string; namaBayar?: string; referensi?: string },
    @CurrentUser('id') userId: number,
  ) {
    return this.paymentService.processPayment({ ...dto, kasirId: userId });
  }

  @Get(':id/payments')
  @Roles('KASIR', 'ADMIN')
  @ApiOperation({ summary: 'Riwayat pembayaran per billing' })
  getPayments(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.getPaymentsByBill(id);
  }
}
