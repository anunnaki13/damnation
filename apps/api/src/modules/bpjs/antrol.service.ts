import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { BpjsAuthService } from './bpjs-auth.service';
import axios from 'axios';

@Injectable()
export class AntrolService {
  constructor(
    private prisma: PrismaService,
    private bpjsAuth: BpjsAuthService,
  ) {}

  /**
   * Tambah antrean ke BPJS (sinkronisasi Mobile JKN)
   */
  async tambahAntrean(data: {
    kodebooking: string;
    jenispasien: string; // JKN / NON JKN
    nomorkartu: string;
    nik: string;
    nohp: string;
    kodepoli: string;
    namapoli: string;
    paession: string; // 1=Baru, 2=Lama
    norm: string;
    tanggalperiksa: string;
    kodedokter: number;
    namadokter: string;
    jampraktek: string;
    jeniskunjungan: number; // 1=Rujukan FKTP, 2=Rujukan Internal, 3=Kontrol, 4=Rujukan Antar RS
    nomorreferensi: string;
    nomorantrean: string;
    angkaantrean: number;
    estimasidilayani: number; // timestamp
    siession: number; // sisa antrean
    kuotajkn: number;
    kuotanonjkn: number;
    keterangan: string;
  }) {
    return this.callApi('POST', '/antrean/add', data, 'Tambah Antrean');
  }

  /**
   * Update waktu antrean
   */
  async updateWaktu(data: {
    kodebooking: string;
    taskid: number; // 1-7 sesuai alur
    waktu: number; // timestamp milliseconds
  }) {
    return this.callApi('PUT', '/antrean/updatewaktu', data, 'Update Waktu Antrean');
  }

  /**
   * Batalkan antrean
   */
  async batalAntrean(data: { kodebooking: string; keterangan: string }) {
    return this.callApi('POST', '/antrean/batal', data, 'Batal Antrean');
  }

  /**
   * Dashboard per tanggal
   */
  async dashboardPerTanggal(tanggal: string, waktu: string) {
    return this.callApi('GET', `/dashboard/wpidate/${tanggal}/waktu/${waktu}`, null, 'Dashboard Antrol');
  }

  private async callApi(method: string, path: string, body: any, label: string) {
    if (!this.bpjsAuth.isConfigured()) {
      return { metadata: { code: 200, message: `Simulasi ${label} — BPJS belum dikonfigurasi` }, response: null };
    }

    const baseUrl = this.bpjsAuth.getAntrolBaseUrl();
    const headers = this.bpjsAuth.getAntrolHeaders();

    try {
      const res = method === 'GET'
        ? await axios.get(`${baseUrl}${path}`, { headers, timeout: 30000 })
        : method === 'PUT'
          ? await axios.put(`${baseUrl}${path}`, body, { headers, timeout: 30000 })
          : await axios.post(`${baseUrl}${path}`, body, { headers, timeout: 30000 });

      await this.logSync('ANTROL', path, method, body, res.data, res.status, 'SUCCESS');
      return res.data;
    } catch (err: any) {
      await this.logSync('ANTROL', path, method, body, err.response?.data, err.response?.status, 'FAILED', err.message);
      throw new HttpException(err.response?.data || { message: err.message }, err.response?.status || 500);
    }
  }

  private async logSync(service: string, endpoint: string, method: string, req: any, res: any, code: number | undefined, status: string, error?: string) {
    await this.prisma.bpjsSyncLog.create({
      data: { service: service as any, endpoint, method: method as any, requestBody: req, responseBody: res, responseCode: code || 0, status: status as any, errorMessage: error },
    });
  }
}
