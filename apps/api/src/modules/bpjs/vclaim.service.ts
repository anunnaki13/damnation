import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { BpjsAuthService } from './bpjs-auth.service';
import axios from 'axios';

@Injectable()
export class VClaimService {
  constructor(
    private prisma: PrismaService,
    private bpjsAuth: BpjsAuthService,
  ) {}

  /**
   * Cek kepesertaan BPJS
   */
  async cekPeserta(noBpjs: string, tglSep: string) {
    return this.callApi('GET', `/Peserta/nokartu/${noBpjs}/tglSEP/${tglSep}`, null, 'Cek Peserta');
  }

  /**
   * Cek rujukan by nomor rujukan
   */
  async cekRujukan(noRujukan: string) {
    return this.callApi('GET', `/Rujukan/${noRujukan}`, null, 'Cek Rujukan');
  }

  /**
   * Cek rujukan by no kartu BPJS
   */
  async cekRujukanByKartu(noBpjs: string) {
    return this.callApi('GET', `/Rujukan/List/Peserta/${noBpjs}`, null, 'Cek Rujukan by Kartu');
  }

  /**
   * Buat SEP (Surat Eligibilitas Peserta)
   */
  async buatSep(data: {
    noKartu: string;
    tglSep: string;
    ppkPelayanan: string;
    jnsPelayanan: string; // 1=Ralan, 2=Ranap
    klsRawat: string;
    noMR: string;
    rujukan: { asalRujukan: string; tglRujukan: string; noRujukan: string; ppkRujukan: string };
    diagnosa: { kdDiag: string };
    poli: { tujuan: string };
    cob: string;
    katarak: string;
    jaminan: { lakaLantas: string; noLP: string; penjamin: string };
    dpjp: { kdDPJP: string };
    noTelp: string;
    user: string;
  }) {
    const payload = {
      request: {
        t_sep: {
          noKartu: data.noKartu,
          tglSep: data.tglSep,
          ppkPelayanan: data.ppkPelayanan,
          jnsPelayanan: data.jnsPelayanan,
          klsRawat: { klsRawatHak: data.klsRawat },
          noMR: data.noMR,
          rujukan: data.rujukan,
          diagnosa: data.diagnosa,
          poli: data.poli,
          cob: { cob: data.cob },
          katarak: { katarak: data.katarak },
          jaminan: data.jaminan,
          tujuanKunj: '0',
          flagProcedure: '',
          kdPenunjang: '',
          assesmentPel: '',
          skdp: { noSurat: '', kodeDPJP: data.dpjp.kdDPJP },
          dpjpLayan: data.dpjp.kdDPJP,
          noTelp: data.noTelp,
          user: data.user,
        },
      },
    };

    const result = await this.callApi('POST', '/SEP/2.0/insert', payload, 'Buat SEP');

    // Simpan ke bridging_sep jika berhasil
    if (result?.response?.sep) {
      const sep = result.response.sep;
      try {
        await this.prisma.bridgingSep.create({
          data: {
            noSep: sep.noSep,
            encounterId: BigInt(0), // akan di-update setelah encounter dibuat
            tglSep: new Date(data.tglSep),
            noRujukan: data.rujukan.noRujukan,
            kdPpkRujukan: data.rujukan.ppkRujukan,
            kdPpkPelayanan: data.ppkPelayanan,
            jnsPelayanan: data.jnsPelayanan,
            klsRawat: data.klsRawat,
            noKartu: data.noKartu,
            namaPasien: sep.peserta?.nama,
            tanggalLahir: sep.peserta?.tglLahir ? new Date(sep.peserta.tglLahir) : null,
            jkel: sep.peserta?.kelamin,
            peserta: sep.peserta?.jnsPeserta,
            diagAwal: data.diagnosa.kdDiag,
            kdDpjp: data.dpjp.kdDPJP,
            noTelep: data.noTelp,
          },
        });
      } catch (e) {
        // Log tapi jangan gagalkan
        console.error('Error saving bridging_sep:', e);
      }
    }

    return result;
  }

  /**
   * Hapus SEP
   */
  async hapusSep(noSep: string, user: string) {
    return this.callApi('DELETE', `/SEP/2.0/delete`, {
      request: { t_sep: { noSep, user } },
    }, 'Hapus SEP');
  }

  /**
   * Cek DPJP (Dokter Penanggung Jawab Pasien)
   */
  async cekDpjp(jnsPelayanan: string, tglSep: string, spesialis: string) {
    return this.callApi('GET', `/referensi/dokter/pelayanan/${jnsPelayanan}/tglPelayanan/${tglSep}/Spesialis/${spesialis}`, null, 'Cek DPJP');
  }

  /**
   * Referensi poli BPJS
   */
  async getRefPoli(keyword: string) {
    return this.callApi('GET', `/referensi/poli/${keyword}`, null, 'Ref Poli');
  }

  /**
   * Referensi diagnosa/ICD-10
   */
  async getRefDiagnosa(keyword: string) {
    return this.callApi('GET', `/referensi/diagnosa/${keyword}`, null, 'Ref Diagnosa');
  }

  /**
   * Monitoring klaim
   */
  async monitoringKlaim(tglPulang: string, jnsPelayanan: string, status: string) {
    return this.callApi('GET', `/Monitoring/Klaim/Tanggal/${tglPulang}/JnsPelayanan/${jnsPelayanan}/Status/${status}`, null, 'Monitoring Klaim');
  }

  // --- Internal API caller ---

  private async callApi(method: string, path: string, body: any, label: string) {
    if (!this.bpjsAuth.isConfigured()) {
      return {
        metaData: { code: '0', message: 'BPJS belum dikonfigurasi — mode simulasi' },
        response: this.getSimulatedResponse(label),
      };
    }

    const baseUrl = this.bpjsAuth.getVClaimBaseUrl();
    const headers = this.bpjsAuth.getVClaimHeaders();
    const url = `${baseUrl}${path}`;

    try {
      const res = method === 'GET'
        ? await axios.get(url, { headers, timeout: 30000 })
        : method === 'POST'
          ? await axios.post(url, body, { headers, timeout: 30000 })
          : await axios.delete(url, { headers, data: body, timeout: 30000 });

      // Log ke database
      await this.prisma.bpjsSyncLog.create({
        data: {
          service: 'VCLAIM',
          endpoint: path,
          method: method as any,
          requestBody: body,
          responseBody: res.data,
          responseCode: res.status,
          status: 'SUCCESS',
        },
      });

      return res.data;
    } catch (err: any) {
      const errData = err.response?.data || { message: err.message };

      await this.prisma.bpjsSyncLog.create({
        data: {
          service: 'VCLAIM',
          endpoint: path,
          method: method as any,
          requestBody: body,
          responseBody: errData,
          responseCode: err.response?.status || 0,
          status: 'FAILED',
          errorMessage: err.message,
        },
      });

      throw new HttpException(errData, err.response?.status || 500);
    }
  }

  /**
   * Response simulasi saat BPJS belum dikonfigurasi
   */
  private getSimulatedResponse(label: string): any {
    const simulated: Record<string, any> = {
      'Cek Peserta': {
        peserta: {
          noKartu: '0001234567891', nama: 'PASIEN SIMULASI BPJS',
          tglLahir: '1990-01-15', kelamin: 'L',
          jnsPeserta: { nama: 'PBI' },
          hakKelas: { kode: '3' },
          statusPeserta: { kode: '0', keterangan: 'AKTIF' },
          provUmum: { kdProvider: '0101U001', nmProvider: 'Puskesmas Simulasi' },
        },
      },
      'Buat SEP': {
        sep: {
          noSep: `SIM${Date.now()}`,
          tglSep: new Date().toISOString().slice(0, 10),
          peserta: { nama: 'PASIEN SIMULASI', noKartu: '0001234567891' },
        },
      },
      'Cek Rujukan': { rujukan: { noKunjungan: 'RUJ001', tglKunjungan: new Date().toISOString().slice(0, 10) } },
    };
    return simulated[label] || { message: `Simulasi ${label}` };
  }
}
