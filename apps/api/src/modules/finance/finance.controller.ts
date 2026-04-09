import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { Roles } from '../../common/decorators/roles.decorator';
@ApiTags('finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(private service: FinanceService) {}
  @Get('summary') @Roles('ADMIN', 'MANAJEMEN') @ApiOperation({ summary: 'Ringkasan keuangan bulanan' })
  getSummary(@Query('month') month?: number, @Query('year') year?: number) { return this.service.getSummary(month, year); }
}
