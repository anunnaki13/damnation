import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateEmergencyDto {
  @ApiPropertyOptional({ description: 'ID pasien (kosongkan jika belum dikenal)' })
  @IsInt() @IsOptional()
  patientId?: number;

  // Untuk pasien baru / belum dikenal
  @IsString() @IsOptional() namaLengkap?: string;
  @IsString() @IsOptional() jenisKelamin?: string;
  @IsString() @IsOptional() tanggalLahir?: string;
  @IsString() @IsOptional() alamat?: string;
  @IsString() @IsOptional() noHp?: string;

  @IsInt() @IsOptional() practitionerId?: number;

  @ApiPropertyOptional({ enum: ['ESI_1', 'ESI_2', 'ESI_3', 'ESI_4', 'ESI_5'] })
  @IsEnum(['ESI_1', 'ESI_2', 'ESI_3', 'ESI_4', 'ESI_5'])
  @IsOptional()
  triaseLevel?: string;

  @ApiPropertyOptional({ enum: ['UMUM', 'BPJS', 'ASURANSI', 'JAMKESDA', 'PERUSAHAAN'] })
  @IsEnum(['UMUM', 'BPJS', 'ASURANSI', 'JAMKESDA', 'PERUSAHAAN'])
  @IsOptional()
  penjamin?: string;

  @IsString() @IsOptional() kdPj?: string;

  @ApiPropertyOptional({ enum: ['SENDIRI', 'RUJUKAN', 'LAHIR', 'PINDAHAN'] })
  @IsEnum(['SENDIRI', 'RUJUKAN', 'LAHIR', 'PINDAHAN'])
  @IsOptional()
  caraMasuk?: string;
}
