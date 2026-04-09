# SIMRS Petala Bumi

**Sistem Informasi Manajemen Rumah Sakit Terintegrasi**
RSUD Petala Bumi Provinsi Riau

[![NestJS](https://img.shields.io/badge/Backend-NestJS%2010-ea2845)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-000000)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%205-2D3748)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)](https://www.typescriptlang.org/)

---

## Overview

Sistem informasi rumah sakit berbasis web modern pengganti **SIMRS Khanza** (Java/desktop). Database **kompatibel langsung** dengan Khanza untuk migrasi ETL. Terintegrasi **SATUSEHAT (FHIR R4)** dan **BPJS Kesehatan**.

| Metric | Value |
|--------|-------|
| **Backend** | 22 NestJS modules, 28 controllers, 37 services |
| **API Endpoints** | 142 documented |
| **Frontend** | 30 pages, 8 reusable components |
| **Database** | 36 Prisma models, 41 enums |
| **Codebase** | 200+ TypeScript files, 20K+ lines |
| **Khanza Data** | 40,802 ICD-10 codes, 2,011 medicines imported |
| **E2E Tested** | Registration → Billing flow verified |

---

## Premium Features

Fitur premium yang membedakan dari SIMRS standar. Detail: [docs/PREMIUM-FEATURES.md](docs/PREMIUM-FEATURES.md)

### Implemented

| Feature | Description | Impact |
|---------|-------------|--------|
| **Critical Lab Alert** | Auto-detect nilai kritis, banner darurat real-time, acknowledge tracking | Patient safety, SNARS |
| **Patient Journey Timeline** | Seluruh riwayat medis dalam satu timeline visual chronological | Clinical decision support |
| **Predictive Stock Alert** | Prediksi hari kehabisan obat berdasarkan avg 30d usage | Prevent stockout |
| **SATUSEHAT Retry** | Retry semua sync gagal satu tombol, report success/failed | Compliance assurance |

### Roadmap

| Feature | Effort | Feature | Effort |
|---------|--------|---------|--------|
| Live Bed Map SVG | 1w | WhatsApp Notifications | 1w |
| Smart SEP Auto-Pilot | 1-2w | Doctor Remuneration | 2w |
| Executive Command Center | 2w | AI ICD-10 Coding | 3w |
| Drug Interaction Checker | 1w | Auto RL 1-6 Reports | 1w |

---

## Architecture

```
 Browser / Mobile           Next.js 14          NestJS 10           MySQL 8.0
 ─────────────────     ──────────────────    ─────────────────    ──────────────
 30 Pages               App Router            22 Modules           36 Models
 8 UI Components         Tailwind CSS          142 Endpoints        41 Enums
 Zustand State           Design System         Prisma ORM           Khanza-compat
                                               JWT + RBAC
                         ┌─────────────────────┼──────────────────────┐
                    SATUSEHAT            BPJS Kesehatan            Redis 7
                    FHIR R4             VClaim/Antrol              MinIO Storage
```

---

## All 22 Modules

### Clinical (10)
| Module | EP | Key Features |
|--------|----|--------------|
| Registration | 6 | Auto no_rawat, queue, BPJS check |
| Queue | 7 | Call/serve/skip, public TV display |
| Outpatient | 17 | SOAP, ICD-10, e-prescription, orders |
| Emergency | 5 | ESI triage, unknown patient, disposition |
| Inpatient + Beds | 10 | Bed map, CPPT, transfer, discharge, BOR |
| Surgery | 3 | Schedule, operation report |
| Pharmacy | 14 | Allergy check, FEFO dispense, **stock prediction** |
| Laboratory | 10 | Results, validation, **critical alerts** |
| Radiology | 5 | Expertise input |
| Nutrition | 2 | ADIME assessment |

### Support (7)
| Module | EP | Key Features |
|--------|----|--------------|
| Billing | 9 | Auto-generate, 6 payment methods |
| BPJS | 15 | VClaim, SEP, Antrol, Aplicares |
| SATUSEHAT | 4 | FHIR sync, **retry-failed** |
| Analytics | 4 | KPI, top-10 diseases, trend, revenue |
| Finance | 1 | Monthly summary |
| HR | 2 | Employee stats |
| SIRS | 1 | RL1 reporting |

### Master Data (5)
| Module | EP |
|--------|----|
| Auth | 2 (JWT + 10 RBAC roles) |
| Patients | 5 (CRUD + search + **timeline**) |
| Practitioners + Schedules | 8 |
| Locations + Medicines + Users | 15 |
| Assets + Logistics | 6 |

---

## 30 Frontend Pages

| Path | Page | Path | Page |
|------|------|------|------|
| `/dashboard` | Live dashboard | `/farmasi` | Pharmacy + **predictions** |
| `/registrasi` | Registration | `/laboratorium` | Lab + **critical alerts** |
| `/rawat-jalan` | Outpatient clinical | `/radiologi` | Radiology |
| `/igd` | Emergency triage | `/billing` | Billing & payment |
| `/rawat-inap` | Bed map + CPPT | `/antrean` | Queue monitor |
| `/kamar-operasi` | Surgery | `/rekam-medis` | **Patient timeline** |
| `/gizi` | Nutrition ADIME | `/satusehat` | FHIR + **retry** |
| `/keuangan` | Finance | `/bpjs` | BPJS bridging |
| `/kepegawaian` | HR | `/dashboard-analitik` | KPI analytics |
| `/logistik` | Inventory | `/admin/*` | 6 master data pages |
| `/aset` | Assets | `/pendaftaran-online` | Online registration |

---

## Khanza Compatibility

ETL: `scripts/migrate-khanza.ts` — automated migration of all data.

| Khanza Table | Imported |
|---|---|
| `penyakit` | **40,802 ICD-10 codes** |
| `databarang` | **2,011 medicines** (7-tier pricing) |
| `penjab` | 26 payer types |
| `poliklinik` | 21 poli |
| `bangsal` + `kamar` | 14 bangsal, 3 beds |
| `dokter` + `petugas` + `pegawai` | 5 + 5 + 12 |
| `pasien` | 8 patients |
| `reg_periksa` | 10 encounters |

---

## Quick Start

```bash
git clone https://github.com/anunnaki13/damnation.git
cd damnation && pnpm install && cp .env.example .env
docker compose -f docker/docker-compose.yml up -d
pnpm db:migrate && pnpm db:seed && pnpm dev
```

**Login:** `admin` / `admin123` | **Frontend:** :3000 | **API:** :3001 | **Swagger:** :3001/api/docs

---

## E2E Verified Flow

```
✓ Login → ✓ Patient → ✓ Encounter → ✓ SOAP+Vitals → ✓ Diagnosis
→ ✓ E-Prescription → ✓ Pharmacy Verify → ✓ Dispense → ✓ Finish
→ ✓ Billing (Rp 50,000) → ✓ Payment TUNAI → ✓ Bill CLOSED
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/PREMIUM-FEATURES.md](docs/PREMIUM-FEATURES.md) | **Premium features + roadmap** |
| [docs/API.md](docs/API.md) | 142 API endpoints |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema + Khanza mapping |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Dev guide + CSS reference |
| [docs/MIGRATION.md](docs/MIGRATION.md) | Khanza ETL guide |
| [docs/SIMRS-DESIGN-SYSTEM.md](docs/SIMRS-DESIGN-SYSTEM.md) | UI design system blueprint |
| [CLAUDE.md](CLAUDE.md) | Claude Code instructions |

---

## Design System

Dark glassmorphism health-tech — `#09090F` bg, `#7C3AED` primary, `#5EEAD4` teal.
Plus Jakarta Sans font. 4-level glass blur 28px. 3 animated orbs.
See [docs/SIMRS-DESIGN-SYSTEM.md](docs/SIMRS-DESIGN-SYSTEM.md)

---

## Security & Compliance

JWT (15min/7d) | 10 RBAC roles | Audit trail | Bcrypt | BigInt interceptor
Permenkes 82/2013 | Permenkes 24/2022 | UU PDP 27/2022

---

**CV Panda Global Teknologi** — Pekanbaru, Riau, Indonesia
