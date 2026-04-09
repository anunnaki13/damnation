import {
  Controller, Get, Post, Body, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PractitionersService } from './practitioners.service';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';

@ApiTags('practitioners')
@ApiBearerAuth()
@Controller('practitioners')
export class PractitionersController {
  constructor(private service: PractitionersService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah dokter/nakes baru' })
  create(@Body() dto: CreatePractitionerDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar dokter/nakes' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('spesialisasi') spesialisasi?: string,
  ) {
    return this.service.findAll(page || 1, limit || 20, spesialisasi);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail dokter/nakes by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }
}
