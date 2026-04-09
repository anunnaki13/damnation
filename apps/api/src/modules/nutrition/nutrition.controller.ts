import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';

@ApiTags('nutrition')
@ApiBearerAuth()
@Controller('nutrition')
export class NutritionController {
  constructor(private service: NutritionService) {}

  @Get('orders')
  @ApiOperation({ summary: 'Pasien rawat inap yang butuh diet' })
  getOrders() { return this.service.getActiveOrders(); }

  @Post('adime')
  @ApiOperation({ summary: 'Input asesmen gizi ADIME' })
  inputADIME(@Body() dto: any) { return this.service.inputADIME(dto); }
}
