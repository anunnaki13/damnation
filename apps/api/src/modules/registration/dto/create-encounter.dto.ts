import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateEncounterDto {
  @ApiProperty({ example: 1, description: 'ID pasien' })
  @IsInt()
  patientId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID dokter' })
  @IsInt()
  @IsOptional()
  practitionerId?: number;

  @ApiProperty({ example: 1, description: 'ID lokasi/poli' })
  @IsInt()
  locationId: number;

  @ApiProperty({ enum: ['RAWAT_JALAN', 'IGD'], example: 'RAWAT_JALAN' })
  @IsEnum(['RAWAT_JALAN', 'IGD'])
  tipe: string;

  @ApiProperty({ enum: ['UMUM', 'BPJS', 'ASURANSI', 'JAMKESDA', 'PERUSAHAAN'], example: 'UMUM' })
  @IsEnum(['UMUM', 'BPJS', 'ASURANSI', 'JAMKESDA', 'PERUSAHAAN'])
  penjamin: string;

  @ApiPropertyOptional({ example: 'BPJ', description: 'Kode penjab (Khanza)' })
  @IsString()
  @IsOptional()
  kdPj?: string;

  @ApiPropertyOptional({ description: 'No. rujukan (untuk BPJS)' })
  @IsString()
  @IsOptional()
  noRujukan?: string;

  @ApiPropertyOptional({ description: 'Nama penanggung jawab' })
  @IsString()
  @IsOptional()
  pJawab?: string;

  @ApiPropertyOptional({ description: 'Alamat penanggung jawab' })
  @IsString()
  @IsOptional()
  alamatPj?: string;

  @ApiPropertyOptional({ description: 'Hubungan PJ dengan pasien' })
  @IsString()
  @IsOptional()
  hubunganPj?: string;
}
