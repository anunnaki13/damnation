import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { BpjsAuthService } from './bpjs-auth.service';
import axios from 'axios';

@Injectable()
export class AplicaresService {
  constructor(
    private prisma: PrismaService,
    private bpjsAuth: BpjsAuthService,
  ) {}

  /**
   * Update ketersediaan tempat tidur
   */
  async updateBedAvailability(data: {
    kodekelas: string;
    koderuang: string;
    namaruang: string;
    kapasitas: number;
    tersedia: number;
    tersediapria: number;
    tersediawanita: number;
    tersediapriawanita: number;
  }) {
    return this.callApi('POST', '/rest/bed/update', [data], 'Update Bed');
  }

  /**
   * Get data bed terakhir yang di-push
   */
  async getBedData(start: number, limit: number) {
    return this.callApi('GET', `/rest/bed/read/${start}/${limit}`, null, 'Read Bed');
  }

  private async callApi(method: string, path: string, body: any, label: string) {
    if (!this.bpjsAuth.isConfigured()) {
      return { metadata: { code: 200, message: `Simulasi ${label} — BPJS belum dikonfigurasi` }, response: null };
    }

    const baseUrl = this.bpjsAuth.getAplicaresBaseUrl();
    const headers = this.bpjsAuth.getAplicaresHeaders();

    try {
      const res = method === 'GET'
        ? await axios.get(`${baseUrl}${path}`, { headers, timeout: 30000 })
        : await axios.post(`${baseUrl}${path}`, body, { headers, timeout: 30000 });

      await this.prisma.bpjsSyncLog.create({
        data: { service: 'APLICARES', endpoint: path, method: method as any, requestBody: body, responseBody: res.data, responseCode: res.status, status: 'SUCCESS' },
      });
      return res.data;
    } catch (err: any) {
      await this.prisma.bpjsSyncLog.create({
        data: { service: 'APLICARES', endpoint: path, method: method as any, requestBody: body, responseBody: err.response?.data, responseCode: err.response?.status || 0, status: 'FAILED', errorMessage: err.message },
      });
      throw new HttpException(err.response?.data || { message: err.message }, err.response?.status || 500);
    }
  }
}
