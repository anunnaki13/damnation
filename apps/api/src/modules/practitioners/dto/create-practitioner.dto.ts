import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class CreatePractitionerDto {
  @ApiProperty({ example: 'dr. Ahmad Fauzi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  namaLengkap: string;

  @ApiPropertyOptional({ example: '198501012010011001' })
  @IsString()
  @IsOptional()
  nip?: string;

  @IsOptional() @IsString() nik?: string;
  @IsOptional() @IsString() sipNumber?: string;
  @IsOptional() @IsString() strNumber?: string;
  @IsOptional() @IsString() gelarDepan?: string;
  @IsOptional() @IsString() gelarBelakang?: string;

  @ApiProperty({ enum: ['L', 'P'] })
  @IsEnum(['L', 'P'])
  jenisKelamin: string;

  @ApiPropertyOptional({ example: 'Penyakit Dalam' })
  @IsString()
  @IsOptional()
  spesialisasi?: string;

  @ApiProperty({
    enum: [
      'DOKTER_UMUM', 'DOKTER_SPESIALIS', 'DOKTER_GIGI',
      'PERAWAT', 'BIDAN', 'APOTEKER', 'NUTRISIONIS',
      'RADIOGRAFER', 'ANALIS_LAB', 'FISIOTERAPIS', 'LAINNYA',
    ],
  })
  @IsEnum([
    'DOKTER_UMUM', 'DOKTER_SPESIALIS', 'DOKTER_GIGI',
    'PERAWAT', 'BIDAN', 'APOTEKER', 'NUTRISIONIS',
    'RADIOGRAFER', 'ANALIS_LAB', 'FISIOTERAPIS', 'LAINNYA',
  ])
  jenisNakes: string;

  @IsOptional() @IsString() noHp?: string;
  @IsOptional() @IsString() email?: string;
}
