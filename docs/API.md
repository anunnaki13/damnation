# API Reference — SIMRS Petala Bumi

**Base URL:** `http://localhost:3001/api`
**Swagger:** `http://localhost:3001/api/docs`
**Auth:** Bearer JWT (except Public endpoints)
**Total: 136 endpoints across 22 modules**

---

## Auth — 2 endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Login → tokens |
| POST | `/auth/refresh` | Public | Refresh token |

## Patients — 4 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/patients` | Register patient (auto No.RM) |
| GET | `/patients/search?keyword=` | Search RM/NIK/name/BPJS |
| GET | `/patients/:id` | Detail + encounters |
| PATCH | `/patients/:id` | Update |

## Practitioners — 3 + Schedules — 5 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/practitioners` | Add doctor/staff |
| GET | `/practitioners` | List (filter: spesialisasi) |
| GET | `/practitioners/:id` | Detail + schedules |
| POST | `/schedules` | Create schedule |
| GET | `/schedules/location/:id` | Per poli (filter: hari) |
| GET | `/schedules/practitioner/:id` | Per doctor |
| PATCH | `/schedules/:id` | Update |
| DELETE | `/schedules/:id` | Deactivate |

## Locations — 5 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/locations` | Add location |
| GET | `/locations?tipe=` | List |
| GET | `/locations/:id` | Detail + beds + schedules |
| PATCH | `/locations/:id` | Update |
| DELETE | `/locations/:id` | Soft delete |

## Medicines — 7 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/medicines` | Add medicine |
| GET | `/medicines?keyword=&kategori=` | List |
| GET | `/medicines/stock-alerts` | Below minimum |
| GET | `/medicines/expiring?days=90` | Expiring soon |
| GET | `/medicines/:id` | Detail + stock |
| PATCH | `/medicines/:id` | Update |
| DELETE | `/medicines/:id` | Soft delete |

## Users — 3 endpoints
| POST | `/users` | Create + roles |
| GET | `/users` | List |
| GET | `/users/:id` | Detail |

## Registration — 6 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/registration/encounter` | New visit (auto no_rawat + queue) |
| GET | `/registration/today?locationId=&status=` | Today worklist |
| GET | `/registration/stats` | Today statistics |
| GET | `/registration/encounter/:id` | Detail |
| PATCH | `/registration/encounter/:id/status` | Update status |
| PATCH | `/registration/encounter/:id/cancel` | Cancel |

## Queue — 7 endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/queue/today/:locationId` | Auth | Per poli |
| GET | `/queue/summary` | Auth | All poli summary |
| POST | `/queue/call-next/:locationId` | Auth | Call next |
| PATCH | `/queue/serve/:ticketId` | Auth | Start serving |
| PATCH | `/queue/skip/:ticketId` | Auth | Skip |
| GET | `/queue/display/:locationId` | **Public** | TV display |

## Outpatient — 17 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/outpatient/worklist` | Worklist (filter: doctor/poli/date) |
| GET | `/outpatient/encounter/:id` | Full clinical detail + history |
| PATCH | `/outpatient/encounter/:id/start` | Begin examination |
| PATCH | `/outpatient/encounter/:id/finish` | Complete visit |
| POST | `/outpatient/soap` | SOAP + vitals → FHIR Observations |
| PATCH | `/outpatient/soap/:id/sign` | Digital signature |
| POST | `/outpatient/diagnosis` | Add ICD-10 diagnosis |
| DELETE | `/outpatient/diagnosis/:id` | Remove |
| GET | `/outpatient/icd10/search?q=` | Search 40,802 codes |
| POST | `/outpatient/prescription` | E-prescription (auto no_resep) |
| GET | `/outpatient/prescription/encounter/:id` | Per encounter |
| GET | `/outpatient/medicine/search?q=` | Autocomplete |
| POST | `/outpatient/order/lab` | Lab order (multi-item) |
| POST | `/outpatient/order/radiology` | Radiology order |

## Pharmacy — 9 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/pharmacy/dispensing/worklist` | Pending prescriptions |
| POST | `/pharmacy/dispensing/verify/:id` | Verify (allergy + stock check) |
| POST | `/pharmacy/dispensing/dispense/:id` | Dispense FEFO |
| POST | `/pharmacy/dispensing/return/:itemId` | Return to stock |
| GET | `/pharmacy/dispensing/history` | Daily history |
| POST | `/pharmacy/stock/receive` | Receive goods |
| POST | `/pharmacy/stock/adjust/:id` | Stock opname |
| GET | `/pharmacy/stock/medicine/:id` | Stock card |
| GET | `/pharmacy/stock/dashboard` | Stock summary |

## Billing — 9 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/billing/generate/:encounterId` | Auto-generate bill |
| GET | `/billing?status=&date=&penjamin=` | Cashier worklist |
| GET | `/billing/stats` | Today stats |
| GET | `/billing/:id` | Detail + items + payments |
| POST | `/billing/:id/item` | Add manual item |
| PATCH | `/billing/:id/void` | Void |
| POST | `/billing/pay` | Payment (6 methods) |
| GET | `/billing/:id/payments` | Payment history |

## Emergency — 5 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/emergency/register` | Quick register (unknown patient OK) |
| GET | `/emergency/worklist` | Sorted by ESI triage |
| GET | `/emergency/stats` | Per ESI level |
| POST | `/emergency/:id/triase` | Triage + primary/secondary survey |
| PATCH | `/emergency/:id/disposisi` | Disposition |

## Inpatient — 7 + Beds — 3 endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/inpatient/admit` | Admit + assign bed |
| GET | `/inpatient/worklist` | Active patients |
| GET | `/inpatient/stats` | BOR + counts |
| POST | `/inpatient/cppt` | CPPT note |
| GET | `/inpatient/:id/cppt` | CPPT history |
| POST | `/inpatient/:id/transfer` | Transfer bed |
| PATCH | `/inpatient/:id/discharge` | Discharge |
| GET | `/beds/map` | Visual bed map |
| GET | `/beds/available?kelas=` | Available beds |
| GET | `/beds/summary` | Per class summary |

## Laboratory — 7 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/lab/worklist` | Orders (priority sorted) |
| GET | `/lab/stats` | Today stats |
| GET | `/lab/order/:id` | Detail + results |
| PATCH | `/lab/order/:id/status` | Status flow |
| POST | `/lab/order/:itemId/results` | Input results (flag H/L/CH/CL) |
| POST | `/lab/order/:id/validate` | Validate all |
| GET | `/lab/patient/:id/history` | Patient lab history |

## Radiology — 5 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/radiology/worklist` | Orders |
| GET | `/radiology/stats` | Today stats |
| GET | `/radiology/order/:id` | Detail |
| PATCH | `/radiology/order/:id/status` | Status flow |
| POST | `/radiology/order/:id/expertise` | Expertise (kesan, proyeksi, kV) |

## BPJS — 15 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/bpjs/status` | Configuration status |
| GET | `/bpjs/peserta/:noBpjs` | Check membership |
| GET | `/bpjs/rujukan/:noRujukan` | Check referral |
| GET | `/bpjs/rujukan/peserta/:noBpjs` | Referral by card |
| POST | `/bpjs/sep` | Create SEP |
| DELETE | `/bpjs/sep/:noSep` | Delete SEP |
| GET | `/bpjs/dpjp` | Check DPJP |
| GET | `/bpjs/ref/poli/:keyword` | Poli reference |
| GET | `/bpjs/ref/diagnosa/:keyword` | Diagnosa reference |
| GET | `/bpjs/monitoring/klaim` | Claim monitoring |
| POST | `/bpjs/antrol/add` | Add Mobile JKN queue |
| POST | `/bpjs/antrol/update-waktu` | Update time |
| POST | `/bpjs/antrol/batal` | Cancel queue |
| POST | `/bpjs/aplicares/bed` | Update bed availability |
| GET | `/bpjs/sync-logs` | API call history |

## SATUSEHAT — 3 endpoints
| GET | `/satusehat/stats` | Sync dashboard |
| POST | `/satusehat/sync/:encounterId` | Sync encounter → FHIR |
| GET | `/satusehat/logs` | Sync history |

## Surgery — 3 endpoints
| POST | `/surgery/schedule` | Schedule operation |
| GET | `/surgery/schedule?date=` | Daily schedule |
| POST | `/surgery/:id/report` | Operation report |

## Nutrition — 2 endpoints
| GET | `/nutrition/orders` | Inpatients needing diet |
| POST | `/nutrition/adime` | ADIME assessment |

## Analytics — 4 endpoints
| GET | `/analytics/kpi` | BOR, ALOS, BTO |
| GET | `/analytics/top-diseases` | Top 10 ICD-10 |
| GET | `/analytics/visit-trend` | 7-day trend |
| GET | `/analytics/revenue` | Monthly revenue |

## Finance — 1 endpoint
| GET | `/finance/summary?month=&year=` | Monthly summary |

## HR — 2 endpoints
| GET | `/hr/employees?page=` | Employee list |
| GET | `/hr/stats` | PNS/kontrak/honorer stats |

## Assets — 3 endpoints
| GET | `/assets?kategori=` | Asset list |
| GET | `/assets/stats` | By condition |
| POST | `/assets` | Add asset |

## Logistics — 3 endpoints
| GET | `/logistics?kategori=` | Inventory list |
| GET | `/logistics/stats` | Low stock count |
| POST | `/logistics` | Add item |

## SIRS — 1 endpoint
| GET | `/sirs/rl1?year=` | RL1 reporting data |

## Health — 1 endpoint
| GET | `/health` | Public | API status |

---

## Response Formats

**Success:** `{ "id": 1, ... }`
**Paginated:** `{ "data": [...], "meta": { "total", "page", "limit", "totalPages" } }`
**Error:** `{ "success": false, "statusCode": 400, "message": "..." }`
