import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * BPJS API Authentication Service
 * Generates required headers for all BPJS API calls:
 * X-cons-id, X-timestamp, X-signature
 *
 * Signature = HMAC-SHA256(cons_id + "&" + timestamp, secret_key) → base64
 */
@Injectable()
export class BpjsAuthService {
  constructor(private config: ConfigService) {}

  /**
   * Generate auth headers untuk VClaim API
   */
  getVClaimHeaders(): Record<string, string> {
    const consId = this.config.get('BPJS_VCLAIM_CONS_ID', '');
    const secretKey = this.config.get('BPJS_VCLAIM_SECRET_KEY', '');
    const userKey = this.config.get('BPJS_VCLAIM_USER_KEY', '');
    return this.buildHeaders(consId, secretKey, userKey);
  }

  /**
   * Generate auth headers untuk Antrol API
   */
  getAntrolHeaders(): Record<string, string> {
    const consId = this.config.get('BPJS_ANTROL_CONS_ID', '');
    const secretKey = this.config.get('BPJS_ANTROL_SECRET_KEY', '');
    const userKey = this.config.get('BPJS_ANTROL_USER_KEY', '');
    return this.buildHeaders(consId, secretKey, userKey);
  }

  /**
   * Generate auth headers untuk Aplicares API
   */
  getAplicaresHeaders(): Record<string, string> {
    const consId = this.config.get('BPJS_APLICARES_CONS_ID', '');
    const secretKey = this.config.get('BPJS_APLICARES_SECRET_KEY', '');
    return this.buildHeaders(consId, secretKey);
  }

  getVClaimBaseUrl(): string {
    return this.config.get('BPJS_VCLAIM_URL', 'https://apijkn-dev.bpjs-kesehatan.go.id/vclaim-rest-dev');
  }

  getAntrolBaseUrl(): string {
    return this.config.get('BPJS_ANTROL_URL', 'https://apijkn-dev.bpjs-kesehatan.go.id/antreanrs_dev');
  }

  getAplicaresBaseUrl(): string {
    return this.config.get('BPJS_APLICARES_URL', 'https://apijkn-dev.bpjs-kesehatan.go.id/aplicaresrest_dev');
  }

  isConfigured(): boolean {
    return !!(
      this.config.get('BPJS_VCLAIM_CONS_ID') &&
      this.config.get('BPJS_VCLAIM_SECRET_KEY')
    );
  }

  private buildHeaders(consId: string, secretKey: string, userKey?: string): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = `${consId}&${timestamp}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(data)
      .digest('base64');

    const headers: Record<string, string> = {
      'X-cons-id': consId,
      'X-timestamp': timestamp,
      'X-signature': signature,
      'Content-Type': 'application/json',
    };

    if (userKey) headers['user_key'] = userKey;
    return headers;
  }

  /**
   * Decrypt response BPJS (LZString + AES-256-CBC)
   * BPJS API mengembalikan response yang di-encrypt
   */
  decryptResponse(encrypted: string, consId: string, secretKey: string, timestamp: string): string {
    try {
      const key = `${consId}${secretKey}${timestamp}`;
      const keyHash = crypto.createHash('sha256').update(key).digest();
      const iv = Buffer.from(keyHash.slice(0, 16));
      const decipher = crypto.createDecipheriv('aes-256-cbc', keyHash, iv);
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return encrypted; // Return as-is if decryption fails
    }
  }
}
