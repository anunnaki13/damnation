# CLAUDE.md — Development Instructions

## Project
SIMRS Petala Bumi — Hospital Management System, RSUD Petala Bumi, Riau.
22 modules, 142 endpoints, 30 pages, 36 models, 20K+ lines.

## Stack
- **Backend:** NestJS 10 + Prisma 5 + MySQL 8.0
- **Frontend:** Next.js 14 + Tailwind CSS + Zustand

## Key Files
- `apps/api/src/app.module.ts` — 22 modules registered
- `apps/api/src/database/schema.prisma` — 36 models, Khanza-compatible
- `apps/api/src/main.ts` — Bootstrap + BigIntSerializationInterceptor (global)
- `apps/web/styles/globals.css` — Design system (glass-0/1/2/3, card, btn, badge, input, select, stat-card, overline, dot-live, avatar-ring)
- `apps/web/components/layout/sidebar.tsx` — Navigation (21 items, 6 sections)

## Backend Pattern
```
Module → Controller → Service → PrismaService
```
- Global BigIntSerializationInterceptor converts all BigInt/Decimal→Number
- Global JWT guard. @Public() to skip. @Roles('ADMIN','DOKTER') for RBAC
- @CurrentUser() for authenticated user

## Frontend Pattern
- Pages: `app/(dashboard)/[module]/page.tsx`
- CSS: `card-flat`, `btn btn-primary btn-sm`, `badge badge-success`, `input`, `select`, `stat-card`, `overline`, `dot-live`
- Colors: `var(--primary)` #7C3AED, `var(--teal)` #5EEAD4, `var(--rose)` #FDA4AF, `var(--amber)` #FCD34D, `var(--sky)` #7DD3FC
- Text: `var(--text-1)` #F8FAFC, `var(--text-2)` 60%, `var(--text-3)` 32%
- Font: Plus Jakarta Sans

## Premium Features
- CriticalAlertService → `/lab/alerts/*` — auto-detect critical lab values
- TimelineService → `/patients/:id/timeline` — unified patient journey
- StockPredictionService → `/pharmacy/stock/predictions` — stockout prediction
- SatusehatService.retryAllFailed() → `/satusehat/retry-failed`

## Number Formats
- No.RM: `PB-XXXXXX` | No.Rawat: `YYYY/MM/DD/NNNNNN` | Resep: `RYYYYMMDDNNNN` | Invoice: `INV-YYYYMMDD-NNNN`

## Adding Module
1. `apps/api/src/modules/[name]/` → module, controller, service
2. Register in `app.module.ts`
3. `apps/web/app/(dashboard)/[name]/page.tsx`
4. Add to `sidebar.tsx` NAV array
