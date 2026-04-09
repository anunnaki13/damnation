import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class LabOrderItemDto {
  @ApiProperty({ example: 'Darah Lengkap' })
  @IsString()
  pemeriksaan: string;

  @IsString() @IsOptional() loincCode?: string;
  @IsNumber() @IsOptional() tarif?: number;
}

export class CreateLabOrderDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  encounterId: number;

  @ApiProperty({ example: 1, description: 'ID dokter yang order' })
  @IsInt()
  requesterId: number;

  @ApiPropertyOptional({ enum: ['ROUTINE', 'URGENT', 'STAT'] })
  @IsEnum(['ROUTINE', 'URGENT', 'STAT'])
  @IsOptional()
  prioritas?: string;

  @IsString() @IsOptional()
  catatanKlinis?: string;

  @ApiProperty({ type: [LabOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabOrderItemDto)
  items: LabOrderItemDto[];
}

export class CreateRadiologyOrderDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  encounterId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  requesterId: number;

  @ApiProperty({ example: 'Rontgen Thorax PA' })
  @IsString()
  jenisPemeriksaan: string;

  @ApiProperty({ enum: ['XRAY', 'CT', 'MRI', 'USG', 'FLUOROSCOPY', 'MAMMOGRAPHY'] })
  @IsEnum(['XRAY', 'CT', 'MRI', 'USG', 'FLUOROSCOPY', 'MAMMOGRAPHY'])
  modalitas: string;

  @IsString() @IsOptional()
  catatanKlinis?: string;
}
