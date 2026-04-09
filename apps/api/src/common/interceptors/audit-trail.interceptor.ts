import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AuditTrailInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userId = request.user?.id;

    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    const action = actionMap[method];
    if (!action) return next.handle();

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: userId ? BigInt(userId) : null,
              action: action as any,
              entityType: this.extractEntityType(url),
              entityId: responseData?.id ? BigInt(responseData.id) : null,
              newValues: method !== 'DELETE' ? responseData : undefined,
              ipAddress: ip,
              userAgent: headers['user-agent']?.substring(0, 500),
            },
          });
        } catch {
          // Audit trail should not break the request
        }
      }),
    );
  }

  private extractEntityType(url: string): string {
    const parts = url.split('/').filter(Boolean);
    // /api/patients/123 -> patients
    return parts.find((p) => p !== 'api' && isNaN(Number(p))) || 'unknown';
  }
}
