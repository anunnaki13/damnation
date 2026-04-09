# Development Guide

## Prerequisites

- Node.js >= 18.x
- pnpm >= 9.x
- Docker & Docker Compose
- Git

## Initial Setup

```bash
# Clone & install
git clone https://github.com/anunnaki13/damnation.git
cd damnation
pnpm install

# Setup environment
cp .env.example .env
# Edit .env sesuai kebutuhan

# Start infrastructure
docker compose -f docker/docker-compose.yml up -d

# Run migrations
pnpm db:migrate

# Seed data
pnpm db:seed

# Start dev servers
pnpm dev
```

---

## Project Structure

### Monorepo Layout

```
apps/api/          → NestJS backend (port 3001)
apps/web/          → Next.js frontend (port 3000)
apps/mobile/       → React Native (Expo) — future
packages/shared/   → Types, validators, constants, utils
packages/ui/       → Design system components
packages/fhir/     → FHIR R4 resource builders
packages/eslint-config/ → Shared ESLint rules
```

### Backend Architecture (NestJS)

```
apps/api/src/
├── main.ts                    # Bootstrap, Swagger setup
├── app.module.ts              # Root module, register semua modules
├── health.controller.ts       # Health check endpoint
├── config/
│   ├── prisma.module.ts       # Global Prisma module
│   └── prisma.service.ts      # Prisma client lifecycle
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts  # Global JWT guard (auto di app.module)
│   │   └── roles.guard.ts     # RBAC guard (per endpoint)
│   ├── decorators/
│   │   ├── public.decorator.ts      # @Public() — skip JWT
│   │   ├── roles.decorator.ts       # @Roles('ADMIN','DOKTER')
│   │   └── current-user.decorator.ts # @CurrentUser() — inject user
│   ├── interceptors/
│   │   └── audit-trail.interceptor.ts  # Auto audit log
│   └── filters/
│       └── http-exception.filter.ts    # Error response format
└── modules/
    ├── auth/          # Login, refresh token, JWT strategy
    ├── users/         # User CRUD
    ├── patients/      # Patient CRUD + search
    ├── practitioners/ # Practitioner CRUD + schedules
    ├── locations/     # Location CRUD
    └── pharmacy/      # Medicine CRUD + stock alerts
```

---

## Cara Menambah Modul Baru (Backend)

### 1. Buat folder modul

```
apps/api/src/modules/[nama-modul]/
├── [nama].module.ts
├── [nama].service.ts
├── [nama].controller.ts
└── dto/
    ├── create-[nama].dto.ts
    └── update-[nama].dto.ts
```

### 2. Pattern Service

```typescript
@Injectable()
export class NamaService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDto) {
    return this.prisma.model.create({ data: { ... } });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.model.findMany({ skip, take: limit }),
      this.prisma.model.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const item = await this.prisma.model.findUnique({ where: { id: BigInt(id) } });
    if (!item) throw new NotFoundException('...');
    return item;
  }
}
```

### 3. Pattern Controller

```typescript
@ApiTags('nama-modul')
@ApiBearerAuth()
@Controller('nama-modul')
export class NamaController {
  constructor(private service: NamaService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Buat data baru' })
  create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar data' })
  findAll(@Query('page') page?: number) {
    return this.service.findAll(page || 1);
  }
}
```

### 4. Register di app.module.ts

```typescript
imports: [
  ...existing,
  NamaModule,  // tambahkan di sini
],
```

---

## Cara Menambah Halaman Frontend

### 1. Buat page di App Router

```
apps/web/app/(dashboard)/[nama-modul]/page.tsx
```

### 2. Pattern Halaman CRUD

```typescript
'use client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

export default function NamaPage() {
  // 1. State: data, meta, loading, showForm, form
  // 2. fetchData() — call API
  // 3. handleSubmit() — create/update
  // 4. columns definition
  // 5. Return: PageHeader + SearchInput + DataTable + Modal(Form)
}
```

### 3. Reusable Components

| Component | Path | Kegunaan |
|-----------|------|----------|
| `DataTable` | `components/ui/data-table.tsx` | Tabel dengan sort, pagination |
| `SearchInput` | `components/ui/search-input.tsx` | Input search dengan debounce |
| `Modal` | `components/ui/modal.tsx` | Dialog modal (sm/md/lg/xl) |
| `FormField` | `components/ui/form-field.tsx` | Form field + label + error |
| `StatusBadge` | `components/ui/status-badge.tsx` | Badge berwarna |
| `PageHeader` | `components/ui/page-header.tsx` | Header + action button |
| `ConfirmDialog` | `components/ui/confirm-dialog.tsx` | Konfirmasi dialog |

---

## Konvensi Koding

| Area | Konvensi |
|------|----------|
| Language | TypeScript strict mode |
| Backend pattern | Controller → Service → Prisma |
| Frontend state | Zustand store |
| API client | Axios (lib/api-client.ts) — auto JWT + refresh |
| Naming (TS) | camelCase |
| Naming (DB) | snake_case |
| Naming (Routes) | kebab-case |
| Naming (Files) | kebab-case |
| Validation (BE) | class-validator + class-transformer |
| Validation (FE) | Zod (packages/shared/validators) |
| Testing | Jest (unit) + Supertest (e2e) |
| Commit | Conventional Commits (`feat:`, `fix:`, `docs:`) |

## Format Nomor

| Data | Format | Contoh |
|------|--------|--------|
| No. RM | PB-XXXXXX | PB-000001 |
| No. Rawat | YYYY/MM/DD/NNNNNN | 2026/04/09/000001 |
| No. Resep | RYYYYMMDDNNNN | R20260409001 |
| No. Invoice | INV-YYYYMMDD-NNNN | INV-20260409-0001 |
| No. Order Lab | LAB-YYYYMMDD-NNNN | LAB-20260409-0001 |

---

## Environment Variables

Lihat `.env.example` untuk daftar lengkap. Variable kunci:

```env
DATABASE_URL        # MySQL connection string
JWT_SECRET          # JWT signing key (harus diganti!)
JWT_REFRESH_SECRET  # Refresh token key
SATUSEHAT_*         # Credentials SATUSEHAT
BPJS_*              # Credentials BPJS
MINIO_*             # MinIO file storage
```

---

## Docker Services

| Service | Port | Kegunaan |
|---------|------|----------|
| MySQL | 3306 | Database utama |
| Redis | 6379 | Cache, queue |
| MinIO | 9000/9001 | File storage (dokumen, foto) |

```bash
# Start semua
docker compose -f docker/docker-compose.yml up -d

# Stop
docker compose -f docker/docker-compose.yml down

# Lihat logs
docker compose -f docker/docker-compose.yml logs -f mysql
```
