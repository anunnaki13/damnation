import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DispensingService } from './dispensing.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('pharmacy-dispensing')
@ApiBearerAuth()
@Controller('pharmacy/dispensing')
export class DispensingController {
  constructor(private service: DispensingService) {}

  @Get('worklist')
  @Roles('APOTEKER', 'ADMIN')
  @ApiOperation({ summary: 'Worklist resep masuk (SUBMITTED/VERIFIED)' })
  getWorklist(@Query('status') status?: string) {
    return this.service.getWorklistResep(status);
  }

  @Post('verify/:id')
  @Roles('APOTEKER', 'ADMIN')
  @ApiOperation({ summary: 'Telaah/verifikasi resep (cek alergi & stok)' })
  verify(@Param('id', ParseIntPipe) id: number) {
    return this.service.verifyPrescription(id);
  }

  @Post('dispense/:id')
  @Roles('APOTEKER', 'ADMIN')
  @ApiOperation({ summary: 'Dispensing obat (kurangi stok FEFO, update status)' })
  dispense(@Param('id', ParseIntPipe) id: number) {
    return this.service.dispensePrescription(id);
  }

  @Post('return/:itemId')
  @Roles('APOTEKER', 'ADMIN')
  @ApiOperation({ summary: 'Retur obat ke stok' })
  returnItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body('jumlah') jumlah: number,
    @Body('alasan') alasan: string,
  ) {
    return this.service.returnItem(itemId, jumlah, alasan);
  }

  @Get('history')
  @Roles('APOTEKER', 'ADMIN')
  @ApiOperation({ summary: 'Riwayat dispensing per hari' })
  getHistory(@Query('date') date?: string) {
    return this.service.getDispensingHistory(date);
  }
}
