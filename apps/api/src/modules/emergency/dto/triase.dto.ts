import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class TriaseDto {
  @ApiProperty()
  @IsInt()
  practitionerId: number;

  @ApiProperty({ enum: ['ESI_1', 'ESI_2', 'ESI_3', 'ESI_4', 'ESI_5'] })
  @IsEnum(['ESI_1', 'ESI_2', 'ESI_3', 'ESI_4', 'ESI_5'])
  triaseLevel: string;

  @IsString() @IsOptional() keluhanUtama?: string;
  @IsString() @IsOptional() primarySurvey?: string;   // Airway, Breathing, Circulation, Disability, Exposure
  @IsString() @IsOptional() secondarySurvey?: string;
  @IsString() @IsOptional() mekanismeCedera?: string;
  @IsString() @IsOptional() kesimpulan?: string;
  @IsString() @IsOptional() tindakanAwal?: string;

  // Vital Signs
  @IsNumber() @IsOptional() tekananDarahSistolik?: number;
  @IsNumber() @IsOptional() tekananDarahDiastolik?: number;
  @IsNumber() @IsOptional() nadi?: number;
  @IsNumber() @IsOptional() suhu?: number;
  @IsNumber() @IsOptional() pernapasan?: number;
  @IsNumber() @IsOptional() spo2?: number;
}
