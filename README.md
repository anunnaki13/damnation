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

## Overview

SIMRS berbasis web modern pengganti **SIMRS Khanza** (Java/desktop). Database **kompatibel langsung** dengan Khanza untuk migrasi ETL. Terintegrasi **SATUSEHAT (FHIR R4)** dan **BPJS Kesehatan**.

| Metric | Value |
|--------|-------|
| **Backend Modules** | 22 NestJS modules |
| **API Endpoints** | 136 documented endpoints |
| **Services** | 37 business services |
| **Frontend Pages** | 30 pages |
| **UI Components** | 8 reusable components |
| **Database Models** | 36 Prisma models, 41 enums |
| **Codebase** | 200 TypeScript files, 20,274 lines |
| **Khanza Data** | 40,802 ICD-10 codes, 2,011 medicines imported |

---

## Architecture

```
 Browser / Mobile           Next.js 14          NestJS 10           MySQL 8.0
 ─────────────────     ──────────────────    ─────────────────    ──────────────
 30 Pages               App Router            22 Modules           36 Models
 8 UI Components         Tailwind CSS          136 Endpoints        41 Enums
 Zustand State           Design System         Prisma ORM           Khanza-compat
                                               JWT + RBAC
                                               │
                         ┌─────────────────────┼──────────────────────┐
                         │                     │                      │
                    SATUSEHAT            BPJS Kesehatan            Redis 7
                    FHIR R4             VClaim/Antrol              Cache/Queue
                                       Aplicares                  MinIO Storage
```

---

## All Modules (22)

### Clinical (10 modules)
| Module | Endpoints | Key Features |
|--------|-----------|--------------|
| Registration | 6 | Auto no_rawat (YYYY/MM/DD/NNNNNN), antrean, BPJS check |
| Queue | 7 | Call next, serve, skip, public TV display endpoint |
| Outpatient | 17 | SOAP, ICD-10 diagnosis, e-prescription, lab/rad orders |
| Emergency | 5 | Quick register (unknown patient), ESI triage, disposition |
| Inpatient | 7 | Bed assignment, CPPT notes, transfer, discharge + BOR calc |
| Bed Management | 3 | Visual bed map, availability per class |
| Surgery | 3 | Schedule, operation report |
| Pharmacy | 14 | Prescription verify (allergy check), FEFO dispensing, stock |
| Laboratory | 7 | Order flow, result input with flags, validation |
| Radiology | 5 | Order flow, expertise input (kesan, proyeksi, kV, mAS) |

### Support (7 modules)
| Module | Endpoints | Key Features |
|--------|-----------|--------------|
| Billing | 9 | Auto-generate from encounter, multi-payment (6 methods) |
| BPJS | 20 | VClaim, SEP, Antrol (Mobile JKN), Aplicares, simulation mode |
| SATUSEHAT | 3 | FHIR builder (Encounter/Condition/Observation), sync + logs |
| Analytics | 4 | KPI (BOR/ALOS/BTO), top-10 diseases, trend, revenue |
| Nutrition | 2 | ADIME assessment for inpatients |
| Finance | 1 | Monthly revenue summary |
| SIRS | 1 | RL1 reporting data |

### Master Data & System (5 modules)
| Module | Endpoints | Key Features |
|--------|-----------|--------------|
| Auth | 2 | JWT (15min access + 7d refresh), 10 RBAC roles |
| Patients | 4 | CRUD, auto No.RM (PB-XXXXXX), search |
| Practitioners | 8 | CRUD + schedules per poli/day |
| Locations | 5 | CRUD, hierarchy, poli/bangsal/IGD |
| Medicines | 7 | 7-tier Khanza pricing, stock alerts, expiring detection |
| Users | 3 | CRUD + role assignment |
| Assets | 3 | CRUD + stats by kondisi |
| Logistics | 3 | Inventory CRUD + low-stock alerts |
| HR | 2 | Employee list + stats (PNS/kontrak/honorer) |

---

## Frontend Pages (30)

| Path | Page | Status |
|------|------|--------|
| `/login` | Login | Functional |
| `/dashboard` | Dashboard (live stats, clock, queue, quick actions) | Functional |
| `/registrasi` | Registration & admisi | Functional |
| `/rawat-jalan` | Outpatient worklist + clinical screen (SOAP/Dx/Rx) | Functional |
| `/igd` | Emergency with ESI 1-5 triage | Functional |
| `/rawat-inap` | Inpatient bed map + CPPT + discharge | Functional |
| `/kamar-operasi` | Surgery schedule + operation report | Functional |
| `/farmasi` | Prescription worklist + dispensing + stock | Functional |
| `/laboratorium` | Lab orders + result input + validation | Functional |
| `/radiologi` | Radiology orders + expertise input | Functional |
| `/gizi` | Nutrition ADIME assessment | Functional |
| `/billing` | Invoice + multi-method payment | Functional |
| `/antrean` | Queue monitor per poli (auto-refresh 10s) | Functional |
| `/rekam-medis` | Patient search + encounter history panel | Functional |
| `/keuangan` | Finance summary (monthly + daily) | Functional |
| `/kepegawaian` | HR employee list + stats | Functional |
| `/logistik` | Inventory CRUD + low-stock | Functional |
| `/aset` | Asset CRUD + condition stats | Functional |
| `/dashboard-analitik` | KPI cards, trend chart, top-10 diseases, revenue | Functional |
| `/satusehat` | FHIR sync monitor + logs | Functional |
| `/bpjs` | Peserta check, rujukan, SEP, sync logs | Functional |
| `/pendaftaran-online` | Online registration portal info | Informational |
| `/admin` | Master data hub | Functional |
| `/admin/pasien` | Patient CRUD | Functional |
| `/admin/dokter` | Practitioner CRUD | Functional |
| `/admin/lokasi` | Location CRUD | Functional |
| `/admin/obat` | Medicine CRUD (7-tier pricing) | Functional |
| `/admin/jadwal` | Doctor schedule management | Functional |
| `/admin/users` | User + role management | Functional |

---

## Khanza Database Compatibility

ETL script: `scripts/migrate-khanza.ts`

| Khanza Table | New Model | Imported Data |
|---|---|---|
| `pasien` | Patient | No.RM, NIK, BPJS, alamat, PJ |
| `dokter` + `petugas` | Practitioner | Unified with jenisNakes |
| `pegawai` | Employee | NIP, jabatan, gapok, status |
| `poliklinik` | Location (POLI) | 21 poli with biaya registrasi |
| `bangsal` + `kamar` | Location + Bed | 14 bangsal, 3 beds |
| `reg_periksa` | Encounter | no_rawat (YYYY/MM/DD/NNNNNN) |
| `databarang` | Medicine | **2,011 items** with 7-tier pricing |
| `penyakit` | Penyakit | **40,802 ICD-10 codes** |
| `penjab` | Penjab | 26 insurance/payer types |
| `spesialis` | Spesialis | 11 specializations |
| `bridging_sep` | BridgingSep | Full SEP data structure |

---

## Design System

Premium dark glassmorphism health-tech theme (see `docs/SIMRS-DESIGN-SYSTEM.md`):

| Property | Value |
|----------|-------|
| Background | `#09090F` |
| Primary | `#7C3AED` (Violet) |
| Semantic | Teal `#5EEAD4`, Rose `#FDA4AF`, Amber `#FCD34D`, Sky `#7DD3FC` |
| Font | Plus Jakarta Sans, JetBrains Mono |
| Glass | 4-level hierarchy (0.025 → 0.05 → 0.08 → 0.12) blur 28px |
| Orbs | 3 animated gradient orbs (violet/teal/rose) drift 30s |
| Border Radius | 16px cards, 10px buttons/inputs, 6px badges |

---

## Quick Start

```bash
git clone https://github.com/anunnaki13/damnation.git
cd damnation && pnpm install
cp .env.example .env

# Start MySQL + Redis
docker compose -f docker/docker-compose.yml up -d
# OR if no Docker:
service mysql start && service redis-server start

pnpm db:migrate && pnpm db:seed
pnpm dev
```

**Login:** `admin` / `admin123`

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/api/docs |

---

## RBAC (10 Roles)

| Role | Access |
|------|--------|
| ADMIN | All modules |
| DOKTER | Clinical (rawat jalan/inap, RME, e-resep, orders) |
| PERAWAT | Nursing notes, vitals, CPPT |
| APOTEKER | Pharmacy, stock, prescription |
| REGISTRASI | Registration, queue, BPJS check |
| KASIR | Billing, payments |
| LAB_ANALIS | Laboratory results, validation |
| RADIOGRAFER | Radiology expertise |
| MANAJEMEN | Dashboard, analytics, reports |
| IT | System admin, integration monitoring |

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/API.md](docs/API.md) | All 136 API endpoints |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema + Khanza mapping |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Dev guide + conventions |
| [docs/MIGRATION.md](docs/MIGRATION.md) | Khanza ETL guide |
| [docs/SIMRS-DESIGN-SYSTEM.md](docs/SIMRS-DESIGN-SYSTEM.md) | UI design system blueprint |
| [CLAUDE.md](CLAUDE.md) | Claude Code dev instructions |
| [blueprint/](blueprint/) | Full technical blueprint |

---

## Security & Compliance

- JWT Authentication (15min access + 7d refresh)
- RBAC granular per endpoint (10 roles)
- Audit trail on all CUD operations
- Bcrypt password hashing
- Permenkes 82/2013, Permenkes 24/2022, UU PDP 27/2022

---

**CV Panda Global Teknologi** — Pekanbaru, Riau, Indonesia
