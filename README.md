# SIMRS Petala Bumi

**Sistem Informasi Manajemen Rumah Sakit Terintegrasi**
RSUD Petala Bumi Provinsi Riau

[![NestJS](https://img.shields.io/badge/Backend-NestJS%2010-ea2845)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-000000)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%205-2D3748)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

---

## Tentang Proyek

SIMRS Petala Bumi adalah sistem informasi rumah sakit berbasis web yang dibangun dari nol (*ground-up*) untuk menggantikan SIMRS Khanza (Java Swing/desktop). Sistem ini dirancang untuk memenuhi standar regulasi Kemenkes RI, terintegrasi penuh dengan **SATUSEHAT (HL7 FHIR R4)** dan **BPJS Kesehatan**.

| Item | Detail |
|------|--------|
| **Klien** | RSUD Petala Bumi Provinsi Riau (RS Kelas C, BLUD) |
| **Vendor** | CV Panda Global Teknologi, Pekanbaru |
| **Total Modul** | 23 modul (11 Front Office + 8 Back Office + 4 Integrasi) |
| **Kontrak** | 12 bulan, 4 fase development |

---

## Arsitektur

```
CLIENT LAYER        Web Browser / Mobile App / Kiosk / Display
        |
PRESENTATION        Next.js 14 (App Router) + shadcn/ui + Tailwind CSS
        |
APPLICATION         NestJS 10 (TypeScript)
        |           ├── Auth (JWT + RBAC + MFA)
        |           ├── 23 Business Modules
        |           ├── FHIR Engine (SATUSEHAT)
        |           ├── BPJS Bridge Service
        |           └── Background Jobs (BullMQ + Redis)
        |
DATA LAYER          MySQL 8.0 (Prisma ORM) + Redis 7 + MinIO
        |
INTEGRATION         SATUSEHAT FHIR R4 | BPJS VClaim/SEP/INA-CBGs/Antrol
```

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Zustand, React Hook Form + Zod, Recharts |
| **Backend** | NestJS 10, TypeScript strict, Swagger/OpenAPI 3.0 |
| **Database** | MySQL 8.0, Prisma 5 ORM |
| **Cache/Queue** | Redis 7, BullMQ |
| **File Storage** | MinIO (S3-compatible) |
| **Mobile** | React Native (Expo) |
| **Infra** | Docker, Nginx, GitHub Actions CI/CD |
| **Monitoring** | Prometheus, Grafana, Winston + Loki |

---

## Struktur Monorepo

```
simrs-petala-bumi/
├── apps/
│   ├── api/                    # NestJS Backend API
│   │   ├── src/
│   │   │   ├── modules/        # 23 business modules
│   │   │   ├── common/         # Guards, interceptors, pipes, filters
│   │   │   ├── integrations/   # FHIR, BPJS, SIRS clients
│   │   │   ├── config/         # App & env configuration
│   │   │   └── database/       # Prisma schema, migrations, seeds
│   │   └── test/               # E2E tests
│   │
│   ├── web/                    # Next.js Frontend
│   │   ├── app/                # App Router pages (per modul)
│   │   ├── components/         # Shared UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # API client, utilities
│   │   └── styles/             # Tailwind config, design tokens
│   │
│   └── mobile/                 # React Native (Expo) — Phase 4
│
├── packages/
│   ├── shared/                 # Types, constants, Zod validators, utils
│   ├── ui/                     # Design system components
│   ├── fhir/                   # FHIR R4 resource builders & mappers
│   └── eslint-config/          # Shared ESLint configuration
│
├── docker/                     # Docker Compose, Dockerfiles, Nginx
├── scripts/                    # ETL migration, seed scripts
├── blueprint/                  # Technical blueprint & specs
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # PNPM workspace config
└── .env.example                # Environment variables template
```

---

## Modul (23 Total)

### Front Office (11 Modul)
| # | Modul | Fase | Status |
|---|-------|------|--------|
| 1 | Registrasi & Admisi | Phase 1 | Planned |
| 2 | Rawat Jalan | Phase 1 | Planned |
| 3 | IGD | Phase 2 | Planned |
| 4 | Rawat Inap | Phase 3 | Planned |
| 5 | Kamar Operasi | Phase 3 | Planned |
| 6 | Farmasi/Apotek | Phase 2 | Planned |
| 7 | Laboratorium | Phase 3 | Planned |
| 8 | Radiologi | Phase 3 | Planned |
| 9 | Pendaftaran Online | Phase 1 | Planned |
| 10 | Manajemen Antrean | Phase 1 | Planned |
| 11 | Gizi/Dapur | Phase 3 | Planned |

### Back Office (8 Modul)
| # | Modul | Fase | Status |
|---|-------|------|--------|
| 12 | Billing & Kasir | Phase 2 | Planned |
| 13 | Keuangan & Akuntansi | Phase 4 | Planned |
| 14 | Kepegawaian/SDM | Phase 4 | Planned |
| 15 | Logistik & Inventaris | Phase 4 | Planned |
| 16 | Manajemen Aset | Phase 4 | Planned |
| 17 | Pelaporan SIRS | Phase 4 | Planned |

### Integrasi & Cross-cutting (4 Modul)
| # | Modul | Fase | Status |
|---|-------|------|--------|
| 18 | RME Terstandarisasi | Phase 3 | Planned |
| 19 | Integrasi SATUSEHAT (FHIR R4) | Phase 3 | Planned |
| 20 | Bridging BPJS Kesehatan | Phase 2 | Planned |
| 21 | Dashboard & Analitik | Phase 4 | Planned |

---

## Development Roadmap

```
Phase 1 — Foundation (Bulan 1-3)
├── Monorepo, Docker, Database, Auth, CI/CD
├── Master Data (Pasien, Dokter, Lokasi, Obat)
├── Registrasi & Admisi + Manajemen Antrean
└── Rawat Jalan + Pendaftaran Online

Phase 2 — Core Clinical (Bulan 4-6)
├── Farmasi/Apotek + E-Resep
├── Billing & Kasir
├── Bridging BPJS (VClaim, SEP, INA-CBGs, Antrol)
└── IGD

Phase 3 — Advanced Clinical (Bulan 7-9)
├── Rawat Inap + Bed Management
├── Laboratorium + Radiologi
├── Kamar Operasi + Gizi
├── RME Terstandarisasi (SOAP, ADIME, CPPT)
└── Integrasi SATUSEHAT (FHIR Engine)

Phase 4 — Finalization (Bulan 10-12)
├── Dashboard Analitik + Pelaporan SIRS (RL 1-6)
├── Keuangan, Kepegawaian, Logistik, Aset
├── Aplikasi Mobile (Pasien, Dokter, Manajemen)
├── Migrasi Data Khanza (ETL)
└── UAT, Pelatihan, Go-Live
```

---

## Quick Start

### Prerequisites

- Node.js >= 18.x
- pnpm >= 9.x
- Docker & Docker Compose
- Git

### Setup

```bash
# 1. Clone repository
git clone https://github.com/anunnaki13/damnation.git simrs-petala-bumi
cd simrs-petala-bumi

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start infrastructure (MySQL, Redis, MinIO)
docker compose -f docker/docker-compose.yml up -d

# 5. Run database migrations
pnpm db:migrate

# 6. Seed master data (ICD-10, LOINC, kode wilayah)
pnpm db:seed

# 7. Start development servers
pnpm dev
```

### Available Scripts

```bash
pnpm dev              # Start all apps in development mode
pnpm build            # Build all apps for production
pnpm lint             # Lint all packages
pnpm format           # Format code with Prettier
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio (DB browser)
pnpm clean            # Clean all build artifacts
```

### Access Points (Development)

| Service | URL |
|---------|-----|
| Frontend (Web) | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| API Docs (Swagger) | http://localhost:3001/api/docs |
| Prisma Studio | http://localhost:5555 |
| MinIO Console | http://localhost:9001 |
| Grafana | http://localhost:3002 |

---

## Integrasi Eksternal

### SATUSEHAT (HL7 FHIR R4)
- Sinkronisasi otomatis setiap encounter selesai
- Resource: Encounter, Condition, Observation, Procedure, MedicationRequest, Composition, dll
- Background queue dengan retry & exponential backoff
- Environment: Dev → Staging → Production

### BPJS Kesehatan
- **VClaim** — Cek kepesertaan, rujukan, penerbitan SEP
- **INA-CBGs** — Grouper klaim, tarif casemix
- **Antrol** — Sinkronisasi antrean Mobile JKN
- **Aplicares** — Update ketersediaan tempat tidur

---

## Keamanan & Compliance

- JWT Authentication (15min access + 7d refresh token)
- RBAC granular per modul + per aksi (10+ roles)
- MFA (TOTP) untuk akun sensitif
- AES-256 encryption untuk data PII
- Audit trail komprehensif (semua CUD + akses data sensitif)
- Compliance: Permenkes 82/2013, Permenkes 24/2022, UU PDP 27/2022

---

## Konvensi

| Area | Konvensi |
|------|----------|
| Language | TypeScript strict mode |
| API Pattern | Controller → Service → Prisma Repository |
| Naming (TS) | camelCase |
| Naming (DB) | snake_case |
| Naming (Routes) | kebab-case |
| Validation | Zod schemas (shared FE/BE) |
| Testing | Jest (unit) + Supertest (e2e), target 80% coverage |
| Commit | Conventional Commits |

---

## Regulasi & Referensi

- Permenkes No. 82 Tahun 2013 — SIMRS
- Permenkes No. 24 Tahun 2022 — Rekam Medis
- KMK No. HK.01.07/MENKES/1423/2022 — Pedoman RME
- UU No. 27 Tahun 2022 — Perlindungan Data Pribadi
- SE No. HK.02.01/MENKES/1030/2023 — Integrasi SATUSEHAT

---

## Tim

**CV Panda Global Teknologi**
Pekanbaru, Riau, Indonesia

---

> *SIMRS Petala Bumi — Sistem informasi rumah sakit modern, terintegrasi, dan comply dengan regulasi Kemenkes RI.*
