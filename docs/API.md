# API Reference

## Base URL

- Development: `http://localhost:3001/api`
- Production: `https://api.simrs.rsudpetalabumi.riau.go.id/api`
- Swagger Docs: `http://localhost:3001/api/docs`

## Authentication

Semua endpoint (kecuali ditandai `Public`) memerlukan JWT Bearer token:

```
Authorization: Bearer <access_token>
```

Token didapat dari endpoint `/api/auth/login`.

---

## Endpoints

### Auth (`/api/auth`)

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/auth/login` | Public | Login, return access + refresh token |
| POST | `/auth/refresh` | Public | Refresh access token |

**POST /auth/login**
```json
// Request
{ "username": "admin", "password": "admin123" }

// Response 200
{
  "user": { "id": 1, "username": "admin", "email": "...", "roles": ["ADMIN"] },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### Patients (`/api/patients`)

| Method | Path | Roles | Deskripsi |
|--------|------|-------|-----------|
| POST | `/patients` | All | Registrasi pasien baru (auto No.RM) |
| GET | `/patients/search` | All | Cari pasien (keyword: No.RM/NIK/nama/BPJS/HP) |
| GET | `/patients/:id` | All | Detail pasien + 10 kunjungan terakhir |
| PATCH | `/patients/:id` | All | Update data pasien |

**GET /patients/search**
```
?keyword=budi&page=1&limit=20
```

**Response format (paginated):**
```json
{
  "data": [{ "id": 1, "noRm": "PB-000001", "namaLengkap": "Budi Santoso", ... }],
  "meta": { "total": 150, "page": 1, "limit": 20, "totalPages": 8 }
}
```

---

### Practitioners (`/api/practitioners`)

| Method | Path | Roles | Deskripsi |
|--------|------|-------|-----------|
| POST | `/practitioners` | ADMIN | Tambah dokter/nakes |
| GET | `/practitioners` | All | Daftar (filter: spesialisasi) |
| GET | `/practitioners/:id` | All | Detail + jadwal aktif |

---

### Schedules (`/api/schedules`)

| Method | Path | Roles | Deskripsi |
|--------|------|-------|-----------|
| POST | `/schedules` | ADMIN | Buat jadwal praktik |
| GET | `/schedules/location/:id` | All | Jadwal per poli (filter: hari) |
| GET | `/schedules/practitioner/:id` | All | Jadwal per dokter |
| PATCH | `/schedules/:id` | ADMIN | Update jadwal |
| DELETE | `/schedules/:id` | ADMIN | Nonaktifkan jadwal |

---

### Locations (`/api/locations`)

| Method | Path | Roles | Deskripsi |
|--------|------|-------|-----------|
| POST | `/locations` | ADMIN | Tambah lokasi/unit |
| GET | `/locations` | All | Daftar (filter: tipe) |
| GET | `/locations/:id` | All | Detail + beds + jadwal dokter |
| PATCH | `/locations/:id` | ADMIN | Update |
| DELETE | `/locations/:id` | ADMIN | Soft delete |

---

### Medicines (`/api/medicines`)

| Method | Path | Roles | Deskripsi |
|--------|------|-------|-----------|
| POST | `/medicines` | ADMIN, APOTEKER | Tambah obat/alkes |
| GET | `/medicines` | All | Daftar (search, filter kategori) |
| GET | `/medicines/stock-alerts` | ADMIN, APOTEKER | Obat stok di bawah minimum |
| GET | `/medicines/expiring` | ADMIN, APOTEKER | Obat yang akan expired (default 90 hari) |
| GET | `/medicines/:id` | All | Detail + stok per lokasi |
| PATCH | `/medicines/:id` | ADMIN, APOTEKER | Update |
| DELETE | `/medicines/:id` | ADMIN, APOTEKER | Soft delete |

---

### Users (`/api/users`)

| Method | Path | Roles | Deskripsi |
|--------|------|-------|-----------|
| POST | `/users` | ADMIN | Buat user baru + assign roles |
| GET | `/users` | ADMIN | Daftar users (paginated) |
| GET | `/users/:id` | ADMIN | Detail user |

---

### Health Check

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| GET | `/health` | Public | Status API |

---

## Response Format

### Success
```json
{
  "id": 1,
  "noRm": "PB-000001",
  "namaLengkap": "Budi Santoso",
  ...
}
```

### Error
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-04-09T07:00:00.000Z"
}
```

### Paginated
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## RBAC Roles & Permissions

| Role | Permission Pattern | Akses Modul |
|------|-------------------|-------------|
| ADMIN | `*` | Semua modul |
| DOKTER | `encounter:*`, `emr:*`, `prescription:*` | Rawat jalan/inap, RME, e-resep |
| PERAWAT | `emr:read`, `emr:create:nursing`, `vitals:*` | Catatan keperawatan, tanda vital |
| APOTEKER | `prescription:*`, `medicine:*`, `stock:*` | Farmasi, stok |
| REGISTRASI | `patient:*`, `encounter:create`, `queue:*` | Registrasi, antrean |
| KASIR | `billing:*`, `payment:*` | Billing, pembayaran |
| LAB_ANALIS | `lab:*` | Laboratorium |
| RADIOGRAFER | `radiology:*` | Radiologi |
| MANAJEMEN | `dashboard:*`, `report:*`, `analytics:*` | Dashboard, laporan |
| IT | `admin:*`, `user:*`, `satusehat:*` | Admin sistem |
