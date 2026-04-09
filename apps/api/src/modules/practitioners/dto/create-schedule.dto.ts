import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsEnum, IsString, IsOptional, Min, Matches } from 'class-validator';

const HARI = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'];

export class CreateScheduleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  practitionerId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  locationId: number;

  @ApiProperty({ enum: HARI, example: 'SENIN' })
  @IsEnum(HARI)
  hari: string;

  @ApiProperty({ example: '08:00', description: 'Format HH:mm' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Format jam harus HH:mm' })
  jamMulai: string;

  @ApiProperty({ example: '12:00', description: 'Format HH:mm' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Format jam harus HH:mm' })
  jamSelesai: string;

  @ApiPropertyOptional({ example: 30, default: 30 })
  @IsInt()
  @Min(1)
  @IsOptional()
  kuotaPasien?: number;
}
