# Development Guide

## Setup

```bash
git clone https://github.com/anunnaki13/damnation.git
cd damnation && pnpm install && cp .env.example .env

# Database (Docker or native)
docker compose -f docker/docker-compose.yml up -d
# OR: service mysql start && service redis-server start

pnpm db:migrate && pnpm db:seed && pnpm dev
```

**Login:** `admin` / `admin123`
**Frontend:** http://localhost:3000 | **API:** http://localhost:3001 | **Swagger:** http://localhost:3001/api/docs

---

## Project Structure

```
apps/api/src/
├── app.module.ts              # 22 modules registered
├── main.ts                    # Bootstrap, Swagger, CORS
├── config/prisma.service.ts   # Global Prisma client
├── common/                    # Guards, interceptors, decorators, filters
├── modules/                   # 22 business modules
│   ├── auth/                  # JWT + RBAC
│   ├── registration/          # Encounter + Queue
│   ├── outpatient/            # SOAP, Dx, Rx, Orders (5 services)
│   ├── emergency/             # IGD + Triage
│   ├── inpatient/             # Bed mgmt + CPPT
│   ├── pharmacy/              # Dispensing + Stock (3 services)
│   ├── laboratory/            # Lab + Radiology (2 services)
│   ├── billing/               # Invoice + Payment
│   ├── bpjs/                  # VClaim + Antrol + Aplicares (4 services)
│   ├── satusehat/             # FHIR builder + sync
│   └── ...                    # analytics, surgery, nutrition, hr, finance, etc.
└── database/schema.prisma     # 36 models, 41 enums

apps/web/
├── app/(auth)/login/          # Login page
├── app/(dashboard)/           # 28 dashboard pages
├── components/ui/             # 8 reusable components
├── components/layout/         # Sidebar + Header
├── hooks/                     # Zustand stores
├── lib/                       # API client, utils
└── styles/globals.css         # Design system
```

---

## Adding a Module

### 1. Backend
```
apps/api/src/modules/[name]/
├── [name].module.ts
├── [name].controller.ts
├── [name].service.ts
└── dto/create-[name].dto.ts
```

Register in `app.module.ts`:
```typescript
import { NameModule } from './modules/name/name.module';
// Add to imports array
```

### 2. Frontend
```
apps/web/app/(dashboard)/[name]/page.tsx
```
Add to `components/layout/sidebar.tsx` NAV array.

---

## Conventions

| Area | Convention |
|------|-----------|
| Models | PascalCase → snake_case via @@map |
| Fields | camelCase → snake_case via @map |
| Routes | kebab-case |
| Files | kebab-case |
| BigInt | Always convert to Number() in responses |

## CSS Classes (Design System)

| Class | Usage |
|-------|-------|
| `card-flat` | Static card |
| `card-highlight` | Accent gradient card |
| `glass-0/1/2/3` | 4-level glass hierarchy |
| `btn btn-primary` | Primary button |
| `btn btn-ghost` | Ghost/outline button |
| `btn-sm`, `btn-xs` | Size variants |
| `badge badge-success` | Status badge (6 variants) |
| `input` | Text input |
| `select` | Dropdown select |
| `textarea` | Multi-line input |
| `stat-card` | KPI stat card with glow |
| `stat-value` | Large number |
| `stat-label` | Small label |
| `overline` | 10.5px uppercase section label |
| `text-gradient` | Gradient text (primary→teal) |
| `dot-live` | Pulsing live indicator |
| `avatar-ring` | Gradient avatar border |

## Colors (CSS Variables)

```
--primary: #7C3AED    --teal: #5EEAD4     --rose: #FDA4AF
--amber: #FCD34D      --sky: #7DD3FC      --surface: #09090F
--text-1: #F8FAFC     --text-2: 60%       --text-3: 32%
```
