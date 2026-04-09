import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateDiagnosisDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  encounterId: number;

  @ApiProperty({ example: 'J06.9', description: 'Kode ICD-10' })
  @IsString()
  icd10Code: string;

  @ApiPropertyOptional({ example: 'Acute upper respiratory infection, unspecified' })
  @IsString() @IsOptional()
  icd10Display?: string;

  @ApiPropertyOptional({ enum: ['PRIMER', 'SEKUNDER', 'TAMBAHAN'], default: 'PRIMER' })
  @IsEnum(['PRIMER', 'SEKUNDER', 'TAMBAHAN'])
  @IsOptional()
  tipe?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt() @IsOptional()
  rankOrder?: number;

  @ApiPropertyOptional({ enum: ['Baru', 'Lama'] })
  @IsString() @IsOptional()
  statusPenyakit?: string;

  @IsInt() @IsOptional()
  createdBy?: number;
}
