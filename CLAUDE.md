# CLAUDE.md — Development Instructions

## Project
SIMRS Petala Bumi — Hospital Management System for RSUD Petala Bumi, Riau.
22 modules, 136 endpoints, 30 pages, 36 models, 20K+ lines TypeScript.

## Stack
- **Backend:** NestJS 10 + Prisma 5 + MySQL 8.0
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Zustand
- **Packages:** shared (types/validators), fhir (SATUSEHAT), ui (design system)

## Key Files
- `apps/api/src/app.module.ts` — Register all 22 modules here
- `apps/api/src/database/schema.prisma` — 36 models, Khanza-compatible
- `apps/web/styles/globals.css` — Design system (glass-0/1/2/3, btn, badge, input, select, textarea, card, stat-card, overline)
- `apps/web/components/layout/sidebar.tsx` — Navigation (21 items)
- `apps/web/hooks/use-auth-store.ts` — Auth state (Zustand)
- `apps/web/lib/api-client.ts` — Axios with JWT auto-refresh

## Backend Pattern
```
Module → Controller → Service → PrismaService
```
- Global JWT guard. Use `@Public()` to skip.
- RBAC: `@Roles('ADMIN','DOKTER')`
- Current user: `@CurrentUser()`
- All BigInt fields → Number() in responses

## Frontend Pattern
- Pages: `app/(dashboard)/[module]/page.tsx`
- CSS: `card-flat`, `btn btn-primary btn-sm`, `badge badge-success`, `input`, `select`, `textarea`, `stat-card`, `overline`
- Colors: `var(--primary)` #7C3AED, `var(--teal)` #5EEAD4, `var(--rose)` #FDA4AF, `var(--amber)` #FCD34D, `var(--text-1/2/3)`
- Font: Plus Jakarta Sans, JetBrains Mono

## Number Formats
- No.RM: `PB-XXXXXX`
- No.Rawat: `YYYY/MM/DD/NNNNNN` (Khanza format)
- No.Resep: `RYYYYMMDDNNNN`
- Invoice: `INV-YYYYMMDD-NNNN`

## Adding New Module
1. `apps/api/src/modules/[name]/` — module, controller, service
2. Register in `app.module.ts`
3. `apps/web/app/(dashboard)/[name]/page.tsx`
4. Add nav item in `sidebar.tsx`
