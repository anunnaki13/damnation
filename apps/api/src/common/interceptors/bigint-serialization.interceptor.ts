import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * Global interceptor to convert BigInt values to Number in all API responses.
 * Prisma returns BigInt for @db.UnsignedBigInt fields which cannot be JSON serialized.
 */
@Injectable()
export class BigIntSerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.convertBigInts(data)),
    );
  }

  private convertBigInts(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (obj instanceof Date) return obj;
    if (typeof obj === 'object' && obj.constructor?.name === 'Decimal') return Number(obj);
    if (Array.isArray(obj)) return obj.map((item) => this.convertBigInts(item));
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key of Object.keys(obj)) {
        result[key] = this.convertBigInts(obj[key]);
      }
      return result;
    }
    return obj;
  }
}
