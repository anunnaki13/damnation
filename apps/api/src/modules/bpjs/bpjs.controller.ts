import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VClaimService } from './vclaim.service';
import { AntrolService } from './antrol.service';
import { AplicaresService } from './aplicares.service';
import { BpjsAuthService } from './bpjs-auth.service';
import { PrismaService } from '../../config/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('bpjs')
@ApiBearerAuth()
@Controller('bpjs')
export class BpjsController {
  constructor(
    private vclaim: VClaimService,
    private antrol: AntrolService,
    private aplicares: AplicaresService,
    private bpjsAuth: BpjsAuthService,
    private prisma: PrismaService,
  ) {}

  // ========== STATUS ==========

  @Get('status')
  @ApiOperation({ summary: 'Cek status konfigurasi BPJS' })
  getStatus() {
    return {
      configured: this.bpjsAuth.isConfigured(),
      services: {
        vclaim: { url: this.bpjsAuth.getVClaimBaseUrl() },
        antrol: { url: this.bpjsAuth.getAntrolBaseUrl() },
        aplicares: { url: this.bpjsAuth.getAplicaresBaseUrl() },
      },
    };
  }

  // ========== VCLAIM ==========

  @Get('peserta/:noBpjs')
  @ApiOperation({ summary: 'Cek kepesertaan BPJS' })
  cekPeserta(@Param('noBpjs') noBpjs: string, @Query('tglSep') tglSep?: string) {
    const tgl = tglSep || new Date().toISOString().slice(0, 10);
    return this.vclaim.cekPeserta(noBpjs, tgl);
  }

  @Get('rujukan/:noRujukan')
  @ApiOperation({ summary: 'Cek rujukan by nomor' })
  cekRujukan(@Param('noRujukan') noRujukan: string) {
    return this.vclaim.cekRujukan(noRujukan);
  }

  @Get('rujukan/peserta/:noBpjs')
  @ApiOperation({ summary: 'Cek rujukan by no kartu BPJS' })
  cekRujukanByKartu(@Param('noBpjs') noBpjs: string) {
    return this.vclaim.cekRujukanByKartu(noBpjs);
  }

  @Post('sep')
  @Roles('REGISTRASI', 'ADMIN')
  @ApiOperation({ summary: 'Buat SEP baru' })
  buatSep(@Body() data: any) {
    return this.vclaim.buatSep(data);
  }

  @Delete('sep/:noSep')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Hapus SEP' })
  hapusSep(@Param('noSep') noSep: string, @Body('user') user: string) {
    return this.vclaim.hapusSep(noSep, user);
  }

  @Get('dpjp')
  @ApiOperation({ summary: 'Cek DPJP' })
  cekDpjp(@Query('jnsPelayanan') jnsPel: string, @Query('tglSep') tglSep: string, @Query('spesialis') spesialis: string) {
    return this.vclaim.cekDpjp(jnsPel, tglSep, spesialis);
  }

  @Get('ref/poli/:keyword')
  @ApiOperation({ summary: 'Referensi poli BPJS' })
  getRefPoli(@Param('keyword') keyword: string) {
    return this.vclaim.getRefPoli(keyword);
  }

  @Get('ref/diagnosa/:keyword')
  @ApiOperation({ summary: 'Referensi diagnosa BPJS' })
  getRefDiagnosa(@Param('keyword') keyword: string) {
    return this.vclaim.getRefDiagnosa(keyword);
  }

  @Get('monitoring/klaim')
  @ApiOperation({ summary: 'Monitoring klaim' })
  monitoringKlaim(@Query('tglPulang') tgl: string, @Query('jnsPelayanan') jns: string, @Query('status') status: string) {
    return this.vclaim.monitoringKlaim(tgl, jns, status);
  }

  // ========== ANTROL ==========

  @Post('antrol/add')
  @ApiOperation({ summary: 'Tambah antrean BPJS (sinkronisasi Mobile JKN)' })
  tambahAntrean(@Body() data: any) {
    return this.antrol.tambahAntrean(data);
  }

  @Post('antrol/update-waktu')
  @ApiOperation({ summary: 'Update waktu antrean BPJS' })
  updateWaktu(@Body() data: any) {
    return this.antrol.updateWaktu(data);
  }

  @Post('antrol/batal')
  @ApiOperation({ summary: 'Batalkan antrean BPJS' })
  batalAntrean(@Body() data: any) {
    return this.antrol.batalAntrean(data);
  }

  // ========== APLICARES ==========

  @Post('aplicares/bed')
  @Roles('ADMIN', 'IT')
  @ApiOperation({ summary: 'Update ketersediaan tempat tidur ke BPJS' })
  updateBed(@Body() data: any) {
    return this.aplicares.updateBedAvailability(data);
  }

  // ========== SYNC LOG ==========

  @Get('sync-logs')
  @Roles('ADMIN', 'IT')
  @ApiOperation({ summary: 'Riwayat API call ke BPJS' })
  async getSyncLogs(@Query('service') service?: string, @Query('limit') limit?: number) {
    const where = service ? { service: service as any } : {};
    const data = await this.prisma.bpjsSyncLog.findMany({
      where,
      take: limit || 50,
      orderBy: { createdAt: 'desc' },
    });
    return data.map((d) => ({ ...d, id: Number(d.id), encounterId: d.encounterId ? Number(d.encounterId) : null }));
  }
}
