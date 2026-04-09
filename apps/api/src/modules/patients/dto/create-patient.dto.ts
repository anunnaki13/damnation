import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, MaxLength,
} from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  namaLengkap: string;

  @ApiPropertyOptional({ example: '3201010101900001' })
  @IsString()
  @IsOptional()
  @MaxLength(16)
  nik?: string;

  @ApiPropertyOptional({ example: '0001234567891' })
  @IsString()
  @IsOptional()
  @MaxLength(13)
  noBpjs?: string;

  @ApiPropertyOptional({ example: 'Pekanbaru' })
  @IsString()
  @IsOptional()
  tempatLahir?: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  tanggalLahir: string;

  @ApiProperty({ enum: ['L', 'P'], example: 'L' })
  @IsEnum(['L', 'P'])
  jenisKelamin: string;

  @ApiPropertyOptional({ enum: ['A', 'B', 'AB', 'O', '-'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'AB', 'O', '-'])
  golonganDarah?: string;

  @ApiPropertyOptional({ example: 'Islam' })
  @IsString()
  @IsOptional()
  agama?: string;

  @ApiPropertyOptional({ enum: ['BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI'] })
  @IsOptional()
  @IsEnum(['BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI'])
  statusNikah?: string;

  @ApiPropertyOptional({ example: 'Wiraswasta' })
  @IsString()
  @IsOptional()
  pekerjaan?: string;

  @ApiPropertyOptional({ example: 'Jl. Sudirman No. 10' })
  @IsString()
  @IsOptional()
  alamat?: string;

  @IsOptional() @IsString() rt?: string;
  @IsOptional() @IsString() rw?: string;
  @IsOptional() @IsString() kelurahan?: string;
  @IsOptional() @IsString() kecamatan?: string;
  @IsOptional() @IsString() kabupaten?: string;
  @IsOptional() @IsString() provinsi?: string;
  @IsOptional() @IsString() kodePos?: string;

  @ApiPropertyOptional({ example: '0761-12345' })
  @IsString()
  @IsOptional()
  noTelp?: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsString()
  @IsOptional()
  noHp?: string;

  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() namaIbu?: string;
  @IsOptional() @IsString() namaPj?: string;
  @IsOptional() @IsString() hubunganPj?: string;
  @IsOptional() @IsString() alamatPj?: string;
  @IsOptional() @IsString() telpPj?: string;
}
