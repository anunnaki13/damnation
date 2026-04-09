# CLAUDE.md — Development Instructions

## Project
SIMRS Petala Bumi — Hospital Management System for RSUD Petala Bumi, Riau. Replaces SIMRS Khanza (Java desktop) with modern web. Database Khanza-compatible for ETL migration.

## Stack
- **Backend:** NestJS 10 + TypeScript + Prisma 5 + MySQL 8.0
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Zustand
- **Packages:** shared (types/validators), fhir (SATUSEHAT), ui (design system)

## Project Stats
- 17 NestJS modules, 32 services, 23 controllers, 126 API endpoints
- 24 frontend pages, 7 reusable UI components
- 35+ Prisma models, 40+ enums
- Khanza database compatible (40,802 ICD-10 codes imported)

## Key Files
- `apps/api/src/app.module.ts` — Root module (register all modules here)
- `apps/api/src/database/schema.prisma` — Database schema (Khanza-compatible)
- `apps/api/src/database/seeds/index.ts` — Seed data
- `apps/web/styles/globals.css` — Design system (card, btn, badge, input classes)
- `apps/web/components/layout/sidebar.tsx` — Navigation menu
- `apps/web/hooks/use-auth-store.ts` — Auth state (Zustand)
- `apps/web/lib/api-client.ts` — Axios client with JWT auto-refresh

## Backend Pattern
```
Module → Controller → Service → PrismaService
```
- Global JWT guard (use @Public() to skip)
- RBAC: @Roles('ADMIN','DOKTER')
- Current user: @CurrentUser()
- Audit trail: auto on POST/PUT/PATCH/DELETE

## Frontend Pattern
- Pages: `app/(dashboard)/[module]/page.tsx`
- CSS classes: `card`, `card-flat`, `card-highlight`, `btn btn-primary`, `badge badge-success`, `input`, `select`, `textarea`
- API: `apiClient` from `@/lib/api-client` (auto JWT)
- Components: PageHeader, DataTable, SearchInput, Modal, FormField, StatusBadge

## Database
- Models: PascalCase (`Patient`), fields: camelCase (`namaLengkap`)
- DB tables: snake_case via @@map, columns: snake_case via @map
- PK: BigInt auto-increment. Khanza string PKs as unique fields.
- Number formats: No.RM `PB-XXXXXX`, No.Rawat `YYYY/MM/DD/NNNNNN`

## Design System Colors
- Background: #0c0c1d
- Accent: #7c5cfc (purple), #2dd4bf (teal)
- Text: #e2e8f0 (primary), #8892a4 (secondary), #4a5268 (muted)
- Input bg: #0f0f26 (solid dark for dropdown visibility)

## Adding New Module
1. `apps/api/src/modules/[name]/` — module, controller, service, DTOs
2. Register in `app.module.ts`
3. `apps/web/app/(dashboard)/[name]/page.tsx`
4. Add nav item in `sidebar.tsx`
