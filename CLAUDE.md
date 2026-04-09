# CLAUDE.md — Development Instructions

## Project Overview
SIMRS Petala Bumi — Sistem Informasi Manajemen Rumah Sakit untuk RSUD Petala Bumi Provinsi Riau. Menggantikan SIMRS Khanza (Java/desktop) ke web-based modern.

## Tech Stack
- **Backend:** NestJS 10 + TypeScript + Prisma 5 + MySQL 8.0
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Zustand
- **Packages:** shared (types/validators), fhir (SATUSEHAT), ui (design system)
- **Infra:** Docker (MySQL, Redis, MinIO), Nginx, GitHub Actions

## Key Files
- `apps/api/src/database/schema.prisma` — Database schema (Khanza-compatible)
- `apps/api/src/app.module.ts` — Root module, register all modules here
- `apps/api/src/database/seeds/index.ts` — Seed data (roles, locations, users)
- `apps/web/app/(dashboard)/` — All frontend pages under dashboard layout
- `apps/web/components/ui/` — Reusable components (DataTable, Modal, FormField, etc.)
- `apps/web/hooks/use-auth-store.ts` — Auth state (Zustand)
- `apps/web/lib/api-client.ts` — Axios client with JWT auto-refresh
- `packages/shared/` — Shared types, Zod validators, constants

## Architecture Pattern
### Backend (NestJS)
```
Module → Controller → Service → PrismaService
```
- Every module: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/*.dto.ts`
- Global guards: JwtAuthGuard (auto), use @Public() to skip
- RBAC: use @Roles('ADMIN','DOKTER') decorator
- Current user: use @CurrentUser() decorator
- Audit trail: auto via AuditTrailInterceptor on POST/PUT/PATCH/DELETE

### Frontend (Next.js)
- Pages in `app/(dashboard)/[module]/page.tsx`
- Use components: PageHeader, DataTable, SearchInput, Modal, FormField, StatusBadge
- API calls via `apiClient` from `@/lib/api-client` (auto JWT)
- State: Zustand stores in `hooks/`

## Database Conventions
- Prisma models: PascalCase (`Patient`, `MedicalRecord`)
- Prisma fields: camelCase (`namaLengkap`)
- DB tables: snake_case via @@map (`patients`, `medical_records`)
- DB columns: snake_case via @map (`nama_lengkap`)
- PK: BigInt auto-increment. Khanza string PKs stored as unique fields.
- Khanza mapping columns have comments `// Khanza: ...`

## Number Formats
- No. RM: `PB-XXXXXX` (PB-000001)
- No. Rawat: `YYYY/MM/DD/NNNNNN` (Khanza format)
- No. Resep: `RYYYYMMDDNNNN`

## Important Notes
- Database is Khanza-compatible: fields like `kd_pj`, `kd_dokter`, `kd_poli_khanza` exist for ETL mapping
- Medicine has 7 price tiers matching Khanza: ralan, kelas1-3, utama, vip, vvip
- Procedures have Khanza tariff breakdown: material, bhp, tarif_dr, tarif_pr, kso, menejemen
- Khanza separates dokter/petugas; we unify in practitioners with jenisNakes
- All responses use BigInt→Number conversion (Prisma BigInt not JSON-serializable)
- Soft delete pattern: set isActive=false, never hard delete medical data

## Adding New Module Checklist
1. Create `apps/api/src/modules/[name]/` with module, controller, service, DTOs
2. Register in `apps/api/src/app.module.ts`
3. Create page at `apps/web/app/(dashboard)/[name]/page.tsx`
4. Add menu item in `apps/web/components/layout/sidebar.tsx`
5. Add types in `packages/shared/types/`
6. Add validators in `packages/shared/validators/`
