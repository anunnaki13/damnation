import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateSoapDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  encounterId: number;

  @ApiProperty({ example: 1, description: 'ID dokter/perawat yang input' })
  @IsInt()
  practitionerId: number;

  @ApiPropertyOptional({ enum: ['SOAP', 'ASESMEN_AWAL', 'CATATAN_KEPERAWATAN'], default: 'SOAP' })
  @IsEnum(['SOAP', 'ASESMEN_AWAL', 'CATATAN_KEPERAWATAN', 'CPPT'])
  @IsOptional()
  tipe?: string;

  // SOAP
  @ApiPropertyOptional({ example: 'Pasien mengeluh demam 3 hari, batuk berdahak' })
  @IsString() @IsOptional() subjective?: string;

  @ApiPropertyOptional({ example: 'KU: Tampak sakit sedang. Kesadaran: Compos mentis.' })
  @IsString() @IsOptional() objective?: string;

  @ApiPropertyOptional({ example: 'ISPA, obs febris' })
  @IsString() @IsOptional() assessment?: string;

  @ApiPropertyOptional({ example: 'Terapi simptomatik, cek lab DL, kontrol 3 hari' })
  @IsString() @IsOptional() plan?: string;

  // Vital Signs
  @IsNumber() @IsOptional() tekananDarahSistolik?: number;
  @IsNumber() @IsOptional() tekananDarahDiastolik?: number;
  @IsNumber() @IsOptional() nadi?: number;
  @IsNumber() @IsOptional() suhu?: number;
  @IsNumber() @IsOptional() pernapasan?: number;
  @IsNumber() @IsOptional() spo2?: number;
  @IsNumber() @IsOptional() tinggiBadan?: number;
  @IsNumber() @IsOptional() beratBadan?: number;
}
