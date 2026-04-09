import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty({ example: 'OBT-001' })
  @IsString()
  @IsNotEmpty()
  kode: string;

  @ApiProperty({ example: 'Amoxicillin 500mg' })
  @IsString()
  @IsNotEmpty()
  namaGenerik: string;

  @ApiPropertyOptional({ example: 'Amoxsan 500mg' })
  @IsString()
  @IsOptional()
  namaDagang?: string;

  @ApiProperty({ example: 'tablet' })
  @IsString()
  @IsNotEmpty()
  satuan: string;

  @ApiPropertyOptional({ enum: ['OBAT', 'ALKES', 'BHP', 'LAINNYA'], default: 'OBAT' })
  @IsEnum(['OBAT', 'ALKES', 'BHP', 'LAINNYA'])
  @IsOptional()
  kategori?: string;

  @ApiPropertyOptional({ enum: ['BEBAS', 'BEBAS_TERBATAS', 'KERAS', 'NARKOTIKA', 'PSIKOTROPIKA'] })
  @IsEnum(['BEBAS', 'BEBAS_TERBATAS', 'KERAS', 'NARKOTIKA', 'PSIKOTROPIKA'])
  @IsOptional()
  golongan?: string;

  @ApiPropertyOptional({ example: 2500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  hargaBeli?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  hargaJual?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stokMinimum?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isFormularium?: boolean;
}
