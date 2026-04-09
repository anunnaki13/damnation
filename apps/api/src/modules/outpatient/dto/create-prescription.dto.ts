import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  medicineId: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  jumlah: number;

  @ApiPropertyOptional({ example: '3x1' })
  @IsString() @IsOptional()
  dosis?: string;

  @IsString() @IsOptional() rute?: string;

  @ApiPropertyOptional({ example: '3 kali sehari' })
  @IsString() @IsOptional()
  frekuensi?: string;

  @IsInt() @IsOptional() durasiHari?: number;

  @ApiPropertyOptional({ example: '3x1 sesudah makan' })
  @IsString() @IsOptional()
  aturanPakai?: string;

  @IsNumber() @IsOptional() hargaSatuan?: number;
}

export class CreatePrescriptionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  encounterId: number;

  @ApiProperty({ example: 1, description: 'ID dokter penulis resep' })
  @IsInt()
  prescriberId: number;

  @ApiPropertyOptional({ enum: ['RACIKAN', 'NON_RACIKAN'], default: 'NON_RACIKAN' })
  @IsEnum(['RACIKAN', 'NON_RACIKAN'])
  @IsOptional()
  jenis?: string;

  @IsString() @IsOptional()
  catatan?: string;

  @ApiProperty({ type: [PrescriptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];
}
