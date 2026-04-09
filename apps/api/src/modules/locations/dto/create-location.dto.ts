import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min } from 'class-validator';

const TIPE_LOKASI = [
  'POLI', 'BANGSAL', 'IGD', 'OK', 'ICU', 'PERINATOLOGI',
  'LABORATORIUM', 'RADIOLOGI', 'FARMASI', 'GIZI', 'ADMIN', 'GUDANG', 'LAINNYA',
];

export class CreateLocationDto {
  @ApiProperty({ example: 'POLI-KULIT' })
  @IsString()
  @IsNotEmpty()
  kode: string;

  @ApiProperty({ example: 'Poli Kulit & Kelamin' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ enum: TIPE_LOKASI, example: 'POLI' })
  @IsEnum(TIPE_LOKASI)
  tipe: string;

  @ApiPropertyOptional({ example: '1' })
  @IsString()
  @IsOptional()
  lantai?: string;

  @ApiPropertyOptional({ example: 'Gedung A' })
  @IsString()
  @IsOptional()
  gedung?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  kapasitasBed?: number;
}
