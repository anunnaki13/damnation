# API Reference — SIMRS Petala Bumi

**Base URL:** `http://localhost:3001/api`
**Swagger Docs:** `http://localhost:3001/api/docs`
**Auth:** Bearer JWT token (except endpoints marked Public)
**Total Endpoints:** 126

---

## Auth (`/auth`) — 2 endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Login → access + refresh token |
| POST | `/auth/refresh` | Public | Refresh access token |

## Patients (`/patients`) — 4 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/patients` | Registrasi pasien baru (auto No.RM) |
| GET | `/patients/search` | Search (keyword: RM/NIK/nama/BPJS/HP) |
| GET | `/patients/:id` | Detail pasien + 10 kunjungan terakhir |
| PATCH | `/patients/:id` | Update data pasien |

## Practitioners (`/practitioners`) — 3 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/practitioners` | Tambah dokter/nakes |
| GET | `/practitioners` | Daftar (filter: spesialisasi) |
| GET | `/practitioners/:id` | Detail + jadwal aktif |

## Schedules (`/schedules`) — 5 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/schedules` | Buat jadwal praktik |
| GET | `/schedules/location/:id` | Jadwal per poli (filter: hari) |
| GET | `/schedules/practitioner/:id` | Jadwal per dokter |
| PATCH | `/schedules/:id` | Update jadwal |
| DELETE | `/schedules/:id` | Nonaktifkan jadwal |

## Locations (`/locations`) — 5 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/locations` | Tambah lokasi/unit |
| GET | `/locations` | Daftar (filter: tipe) |
| GET | `/locations/:id` | Detail + beds + jadwal |
| PATCH | `/locations/:id` | Update |
| DELETE | `/locations/:id` | Soft delete |

## Medicines (`/medicines`) — 7 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/medicines` | Tambah obat/alkes |
| GET | `/medicines` | Daftar (search, filter kategori) |
| GET | `/medicines/stock-alerts` | Stok di bawah minimum |
| GET | `/medicines/expiring` | Obat expired <90 hari |
| GET | `/medicines/:id` | Detail + stok per lokasi |
| PATCH | `/medicines/:id` | Update |
| DELETE | `/medicines/:id` | Soft delete |

## Users (`/users`) — 3 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/users` | Buat user + assign roles |
| GET | `/users` | Daftar users |
| GET | `/users/:id` | Detail user |

## Registration (`/registration`) — 6 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/registration/encounter` | Daftarkan kunjungan baru (auto no_rawat, antrean) |
| GET | `/registration/today` | Worklist hari ini (filter poli/status) |
| GET | `/registration/stats` | Statistik registrasi hari ini |
| GET | `/registration/encounter/:id` | Detail kunjungan |
| PATCH | `/registration/encounter/:id/status` | Update status |
| PATCH | `/registration/encounter/:id/cancel` | Batalkan kunjungan |

## Queue (`/queue`) — 7 endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/queue/today/:locationId` | Auth | Antrean per poli |
| GET | `/queue/summary` | Auth | Ringkasan semua poli |
| POST | `/queue/call-next/:locationId` | Auth | Panggil berikutnya |
| PATCH | `/queue/serve/:ticketId` | Auth | CALLED → SERVING |
| PATCH | `/queue/skip/:ticketId` | Auth | Skip antrean |
| GET | `/queue/display/:locationId` | **Public** | Display TV/monitor |

## Outpatient (`/outpatient`) — 17 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/outpatient/worklist` | Worklist rawat jalan (filter dokter/poli) |
| GET | `/outpatient/encounter/:id` | Detail encounter + clinical data + history |
| PATCH | `/outpatient/encounter/:id/start` | Mulai pemeriksaan |
| PATCH | `/outpatient/encounter/:id/finish` | Selesaikan kunjungan |
| POST | `/outpatient/soap` | Input SOAP + vital signs → FHIR Observations |
| PATCH | `/outpatient/soap/:id/sign` | Digital signature |
| POST | `/outpatient/diagnosis` | Tambah diagnosis ICD-10 |
| DELETE | `/outpatient/diagnosis/:id` | Hapus diagnosis |
| GET | `/outpatient/icd10/search` | Search ICD-10 (40,802 codes) |
| POST | `/outpatient/prescription` | E-resep (auto no_resep) |
| GET | `/outpatient/prescription/encounter/:id` | Daftar resep per encounter |
| GET | `/outpatient/medicine/search` | Search obat (autocomplete) |
| POST | `/outpatient/order/lab` | Order lab (multi-item) |
| POST | `/outpatient/order/radiology` | Order radiologi |

## Pharmacy Dispensing (`/pharmacy/dispensing`) — 4 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/pharmacy/dispensing/worklist` | Resep menunggu (SUBMITTED/VERIFIED) |
| POST | `/pharmacy/dispensing/verify/:id` | Telaah resep (cek alergi + stok) |
| POST | `/pharmacy/dispensing/dispense/:id` | Dispensing FEFO + kurangi stok |
| POST | `/pharmacy/dispensing/return/:itemId` | Retur obat |
| GET | `/pharmacy/dispensing/history` | Riwayat dispensing |

## Pharmacy Stock (`/pharmacy/stock`) — 4 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/pharmacy/stock/receive` | Penerimaan barang |
| POST | `/pharmacy/stock/adjust/:id` | Stok opname |
| GET | `/pharmacy/stock/medicine/:id` | Kartu stok per obat |
| GET | `/pharmacy/stock/dashboard` | Ringkasan stok |

## Billing (`/billing`) — 9 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/billing/generate/:encounterId` | Auto-generate billing |
| GET | `/billing` | Worklist kasir (filter status/date/penjamin) |
| GET | `/billing/stats` | Statistik kasir hari ini |
| GET | `/billing/:id` | Detail billing + items + payments |
| POST | `/billing/:id/item` | Tambah item manual |
| PATCH | `/billing/:id/void` | Void billing |
| POST | `/billing/pay` | Pembayaran (6 metode) |
| GET | `/billing/:id/payments` | Riwayat pembayaran |

## Emergency / IGD (`/emergency`) — 5 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/emergency/register` | Registrasi cepat (support pasien tak dikenal) |
| GET | `/emergency/worklist` | Worklist sorted by triase ESI |
| GET | `/emergency/stats` | Statistik per ESI level |
| POST | `/emergency/:id/triase` | Input triase + primary/secondary survey |
| PATCH | `/emergency/:id/disposisi` | Disposisi (pulang/rawat inap/rujuk/DOA) |

## Inpatient (`/inpatient`) — 7 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/inpatient/admit` | Admisi + assign bed |
| GET | `/inpatient/worklist` | Pasien dirawat aktif |
| GET | `/inpatient/stats` | BOR, active, beds |
| POST | `/inpatient/cppt` | Input CPPT multidisiplin |
| GET | `/inpatient/:id/cppt` | Riwayat CPPT |
| POST | `/inpatient/:id/transfer` | Transfer bed |
| PATCH | `/inpatient/:id/discharge` | Discharge |

## Bed Management (`/beds`) — 3 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/beds/map` | Visual bed map + occupant |
| GET | `/beds/available` | Bed tersedia (filter kelas) |
| GET | `/beds/summary` | Summary per kelas |

## Laboratory (`/lab`) — 7 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/lab/worklist` | Order lab (sorted by priority) |
| GET | `/lab/stats` | Statistik lab hari ini |
| GET | `/lab/order/:id` | Detail + hasil |
| PATCH | `/lab/order/:id/status` | Update status flow |
| POST | `/lab/order/:itemId/results` | Input hasil per parameter |
| POST | `/lab/order/:id/validate` | Validasi hasil |
| GET | `/lab/patient/:id/history` | Riwayat lab pasien |

## Radiology (`/radiology`) — 5 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/radiology/worklist` | Order radiologi |
| GET | `/radiology/stats` | Statistik hari ini |
| GET | `/radiology/order/:id` | Detail order |
| PATCH | `/radiology/order/:id/status` | Update status |
| POST | `/radiology/order/:id/expertise` | Input expertise radiolog |

## BPJS (`/bpjs`) — 20 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/bpjs/status` | Status konfigurasi |
| GET | `/bpjs/peserta/:noBpjs` | Cek kepesertaan |
| GET | `/bpjs/rujukan/:noRujukan` | Cek rujukan |
| GET | `/bpjs/rujukan/peserta/:noBpjs` | Rujukan by kartu |
| POST | `/bpjs/sep` | Buat SEP |
| DELETE | `/bpjs/sep/:noSep` | Hapus SEP |
| GET | `/bpjs/dpjp` | Cek DPJP |
| GET | `/bpjs/ref/poli/:keyword` | Ref poli BPJS |
| GET | `/bpjs/ref/diagnosa/:keyword` | Ref diagnosa |
| GET | `/bpjs/monitoring/klaim` | Monitoring klaim |
| POST | `/bpjs/antrol/add` | Tambah antrean Mobile JKN |
| POST | `/bpjs/antrol/update-waktu` | Update waktu antrean |
| POST | `/bpjs/antrol/batal` | Batal antrean |
| POST | `/bpjs/aplicares/bed` | Update ketersediaan bed |
| GET | `/bpjs/sync-logs` | Riwayat API call |

## SATUSEHAT (`/satusehat`) — 3 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/satusehat/stats` | Dashboard statistik sync |
| POST | `/satusehat/sync/:encounterId` | Sync encounter → FHIR |
| GET | `/satusehat/logs` | Riwayat sync |

## Surgery (`/surgery`) — 3 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/surgery/schedule` | Jadwalkan operasi |
| GET | `/surgery/schedule` | Jadwal per tanggal |
| POST | `/surgery/:id/report` | Laporan operasi |

## Nutrition (`/nutrition`) — 2 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nutrition/orders` | Pasien butuh diet |
| POST | `/nutrition/adime` | Input ADIME |

## Analytics (`/analytics`) — 4 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics/kpi` | KPI (BOR, ALOS, BTO) |
| GET | `/analytics/top-diseases` | 10 penyakit terbanyak |
| GET | `/analytics/visit-trend` | Trend 7 hari |
| GET | `/analytics/revenue` | Revenue bulan ini |

## Health Check
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | API status |

---

## Response Format

**Success:** `{ "id": 1, "field": "value", ... }`
**Paginated:** `{ "data": [...], "meta": { "total", "page", "limit", "totalPages" } }`
**Error:** `{ "success": false, "statusCode": 400, "message": "...", "timestamp": "..." }`
