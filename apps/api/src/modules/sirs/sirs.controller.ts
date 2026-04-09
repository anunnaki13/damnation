import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SirsService } from './sirs.service';
import { Roles } from '../../common/decorators/roles.decorator';
@ApiTags('sirs')
@ApiBearerAuth()
@Controller('sirs')
export class SirsController {
  constructor(private service: SirsService) {}
  @Get('rl1') @Roles('ADMIN', 'MANAJEMEN') @ApiOperation({ summary: 'Pelaporan SIRS RL1' })
  getRL1(@Query('year') year?: number) { return this.service.getRL1(year); }
}
