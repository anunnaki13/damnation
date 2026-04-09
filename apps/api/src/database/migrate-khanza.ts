/**
 * ETL Script: SIMRS Khanza (sik) → SIMRS Petala Bumi (simrs_petala_bumi)
 * Migrasi data dari database Khanza ke schema baru
 *
 * Usage: DATABASE_URL="..." npx ts-node scripts/migrate-khanza.ts
 */

import { PrismaClient } from '@prisma/client';
import * as mysql from 'mysql2/promise';

const prisma = new PrismaClient();

// Khanza source connection
const KHANZA_DB = {
  host: '127.0.0.1',
  user: 'simrs',
  password: 'simrs_password',
  database: 'sik',
};

let khanza: mysql.Connection;

async function main() {
  console.log('=== ETL: SIMRS Khanza → SIMRS Petala Bumi ===\n');

  khanza = await mysql.createConnection(KHANZA_DB);
  console.log('Connected to Khanza database (sik)');

  try {
    // Phase 1: Reference Data
    await migratePenjab();
    await migrateSpesialis();
    await migratePenyakit();

    // Phase 2: Master Data
    await migratePoliklinik();
    await migrateBangsal();
    await migrateKamar();
    await migratePegawaiDokterPetugas();
    await migratePasien();
    await migrateDatabarang();

    // Phase 3: Transactional Data
    await migrateRegPeriksa();

    // Validation
    await validate();

    console.log('\n=== ETL COMPLETE ===');
  } catch (err) {
    console.error('ETL Error:', err);
  } finally {
    await khanza.end();
    await prisma.$disconnect();
  }
}

// ==========================================
// Phase 1: Reference Data
// ==========================================

async function migratePenjab() {
  console.log('\n--- Migrating: penjab → Penjab ---');
  const [rows] = await khanza.query('SELECT * FROM penjab') as any;
  let count = 0;

  for (const row of rows) {
    await prisma.penjab.upsert({
      where: { kdPj: row.kd_pj.trim() },
      update: { pngJawab: row.png_jawab, namaPerusahaan: row.nama_perusahaan, status: row.status },
      create: {
        kdPj: row.kd_pj.trim(),
        pngJawab: row.png_jawab || null,
        namaPerusahaan: row.nama_perusahaan || null,
        alamatAsuransi: row.alamat_asuransi || null,
        noTelp: row.no_telp || null,
        attn: row.attn || null,
        status: row.status || '1',
      },
    });
    count++;
  }
  console.log(`  ✓ ${count} penjab migrated`);
}

async function migrateSpesialis() {
  console.log('\n--- Migrating: spesialis → Spesialis ---');
  const [rows] = await khanza.query('SELECT * FROM spesialis') as any;
  let count = 0;

  for (const row of rows) {
    await prisma.spesialis.upsert({
      where: { kdSps: row.kd_sps.trim() },
      update: { nmSps: row.nm_sps },
      create: { kdSps: row.kd_sps.trim(), nmSps: row.nm_sps },
    });
    count++;
  }
  console.log(`  ✓ ${count} spesialis migrated`);
}

async function migratePenyakit() {
  console.log('\n--- Migrating: penyakit → Penyakit ---');
  const [rows] = await khanza.query('SELECT kd_penyakit, nm_penyakit, ciri_ciri, keterangan, kd_ktg, status FROM penyakit') as any;
  let count = 0;

  // Batch insert for performance
  const batchSize = 500;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    for (const row of batch) {
      try {
        await prisma.penyakit.upsert({
          where: { kdPenyakit: row.kd_penyakit.trim() },
          update: { nmPenyakit: row.nm_penyakit },
          create: {
            kdPenyakit: row.kd_penyakit.trim(),
            nmPenyakit: row.nm_penyakit || null,
            ciriCiri: row.ciri_ciri || null,
            keterangan: row.keterangan || null,
            kdKtg: row.kd_ktg || null,
            status: row.status || null,
          },
        });
        count++;
      } catch (e) {
        // Skip duplicates or errors
      }
    }
    process.stdout.write(`  ... ${Math.min(i + batchSize, rows.length)}/${rows.length}\r`);
  }
  console.log(`  ✓ ${count} penyakit (ICD-10) migrated`);
}

// ==========================================
// Phase 2: Master Data
// ==========================================

async function migratePoliklinik() {
  console.log('\n--- Migrating: poliklinik → Location (POLI) ---');
  const [rows] = await khanza.query("SELECT * FROM poliklinik WHERE status='1'") as any;
  let count = 0;

  for (const row of rows) {
    const kode = `POLI-${row.kd_poli.trim()}`;
    await prisma.location.upsert({
      where: { kode },
      update: { nama: row.nm_poli, biayaRegistrasiBaru: row.registrasi, biayaRegistrasiLama: row.registrasilama },
      create: {
        kode,
        nama: row.nm_poli || row.kd_poli,
        tipe: 'POLI',
        kdPoliKhanza: row.kd_poli.trim(),
        biayaRegistrasiBaru: row.registrasi || 0,
        biayaRegistrasiLama: row.registrasilama || 0,
        isActive: row.status === '1',
      },
    });
    count++;
  }
  console.log(`  ✓ ${count} poliklinik migrated`);
}

async function migrateBangsal() {
  console.log('\n--- Migrating: bangsal → Location (BANGSAL) ---');
  const [rows] = await khanza.query("SELECT * FROM bangsal WHERE status='1'") as any;
  let count = 0;

  for (const row of rows) {
    const kode = `BANG-${row.kd_bangsal.trim()}`;
    const tipeMap: Record<string, string> = {
      'ICU': 'ICU', 'NICU': 'ICU', 'PICU': 'ICU', 'HCU': 'ICU',
    };
    const tipe = tipeMap[row.kd_bangsal.trim().toUpperCase()] || 'BANGSAL';

    await prisma.location.upsert({
      where: { kode },
      update: { nama: row.nm_bangsal },
      create: {
        kode,
        nama: row.nm_bangsal || row.kd_bangsal,
        tipe: tipe as any,
        kdBangsalKhanza: row.kd_bangsal.trim(),
        isActive: row.status === '1',
      },
    });
    count++;
  }
  console.log(`  ✓ ${count} bangsal migrated`);
}

async function migrateKamar() {
  console.log('\n--- Migrating: kamar → Bed ---');
  const [rows] = await khanza.query("SELECT k.*, b.nm_bangsal FROM kamar k LEFT JOIN bangsal b ON k.kd_bangsal=b.kd_bangsal WHERE k.statusdata='1'") as any;
  let count = 0;

  for (const row of rows) {
    const locKode = `BANG-${(row.kd_bangsal || '').trim()}`;
    const location = await prisma.location.findUnique({ where: { kode: locKode } });
    if (!location) continue;

    const kelasMap: Record<string, string> = {
      'Kelas 1': 'KELAS_1', 'Kelas 2': 'KELAS_2', 'Kelas 3': 'KELAS_3',
      'Kelas Utama': 'VIP', 'Kelas VIP': 'VIP', 'Kelas VVIP': 'VVIP',
    };
    const kelas = kelasMap[row.kelas] || 'KELAS_3';

    const statusMap: Record<string, string> = {
      'KOSONG': 'TERSEDIA', 'ISI': 'TERISI', 'DIBERSIHKAN': 'MAINTENANCE',
      'PERBAIKAN': 'MAINTENANCE', 'DIBOOKING': 'RESERVASI',
    };
    const status = statusMap[row.status] || 'TERSEDIA';

    try {
      await prisma.bed.upsert({
        where: { locationId_nomorBed: { locationId: location.id, nomorBed: row.kd_kamar.trim() } },
        update: { tarifPerHari: row.trf_kamar || 0, status: status as any },
        create: {
          locationId: location.id,
          nomorBed: row.kd_kamar.trim(),
          kelas: kelas as any,
          status: status as any,
          tarifPerHari: row.trf_kamar || 0,
          kdKamarKhanza: row.kd_kamar.trim(),
        },
      });
      count++;
    } catch (e) {
      // Skip errors
    }
  }
  console.log(`  ✓ ${count} kamar/bed migrated`);
}

async function migratePegawaiDokterPetugas() {
  console.log('\n--- Migrating: pegawai + dokter + petugas → Practitioner + Employee ---');

  // 1. Dokter
  const [dokters] = await khanza.query(`
    SELECT d.*, p.nama, p.jbtn, p.tmp_lahir as tmp, p.tgl_lahir as tgl, p.photo, p.no_ktp,
           s.nm_sps, p.alamat, p.mulai_kerja, p.bpd, p.rekening, p.npwp, p.gapok, p.stts_aktif, p.pendidikan
    FROM dokter d
    LEFT JOIN pegawai p ON d.kd_dokter = p.nik
    LEFT JOIN spesialis s ON d.kd_sps = s.kd_sps
  `) as any;

  let dCount = 0;
  for (const d of dokters) {
    const jenisNakes = d.nm_sps ? 'DOKTER_SPESIALIS' :
                       (d.nm_dokter || '').startsWith('drg') ? 'DOKTER_GIGI' : 'DOKTER_UMUM';

    await prisma.practitioner.upsert({
      where: { kdDokter: d.kd_dokter.trim() },
      update: { namaLengkap: d.nm_dokter, spesialisasi: d.nm_sps },
      create: {
        kdDokter: d.kd_dokter.trim(),
        nip: d.kd_dokter.trim(),
        namaLengkap: d.nm_dokter || d.nama || 'Unknown',
        jenisKelamin: (d.jk === 'P' ? 'P' : 'L') as any,
        jenisNakes: jenisNakes as any,
        kdSps: d.kd_sps ? d.kd_sps.trim() : null,
        spesialisasi: d.nm_sps || null,
        sipNumber: d.no_ijn_praktek || null,
        tempatLahir: d.tmp || d.tmp_lahir || null,
        tanggalLahir: d.tgl || d.tgl_lahir || null,
        email: d.email || null,
        alumni: d.alumni || null,
        foto: d.photo || null,
        isActive: d.status === '1',
      },
    });
    dCount++;
  }
  console.log(`  ✓ ${dCount} dokter migrated`);

  // 2. Petugas (perawat, dll)
  const [petugas] = await khanza.query(`
    SELECT pt.*, p.nama, p.jbtn, p.photo, p.no_ktp, p.stts_aktif
    FROM petugas pt
    LEFT JOIN pegawai p ON pt.nip = p.nik
    WHERE pt.nip NOT IN (SELECT kd_dokter FROM dokter)
  `) as any;

  let pCount = 0;
  for (const pt of petugas) {
    const existing = await prisma.practitioner.findFirst({ where: { nip: pt.nip.trim() } });
    if (existing) continue;

    await prisma.practitioner.create({
      data: {
        kdDokter: null,
        nip: pt.nip.trim(),
        namaLengkap: pt.nama || pt.nip,
        jenisKelamin: (pt.jk === 'P' ? 'P' : 'L') as any,
        jenisNakes: 'PERAWAT' as any,
        tempatLahir: pt.tmp_lahir || null,
        tanggalLahir: pt.tgl_lahir || null,
        email: pt.email || null,
        foto: pt.photo || null,
        isActive: pt.status === '1',
      },
    });
    pCount++;
  }
  console.log(`  ✓ ${pCount} petugas migrated`);

  // 3. Pegawai → Employee
  const [pegawais] = await khanza.query('SELECT * FROM pegawai') as any;
  let eCount = 0;
  for (const pg of pegawais) {
    const practitioner = await prisma.practitioner.findFirst({ where: { nip: pg.nik.trim() } });

    const existing = await prisma.employee.findFirst({ where: { nip: pg.nik.trim() } });
    if (existing) continue;

    await prisma.employee.create({
      data: {
        practitionerId: practitioner?.id || null,
        nip: pg.nik.trim(),
        namaLengkap: pg.nama || pg.nik,
        jabatan: pg.jbtn || null,
        departemen: pg.departemen || null,
        tanggalMasuk: pg.mulai_kerja || null,
        namaBank: pg.bpd || null,
        rekeningBank: pg.rekening || null,
        npwp: pg.npwp || null,
        noKtp: pg.no_ktp || null,
        gapok: pg.gapok || null,
        pendidikan: pg.pendidikan || null,
        photo: pg.photo || null,
        sttsAktif: pg.stts_aktif || 'AKTIF',
        isActive: pg.stts_aktif === 'AKTIF',
      },
    });
    eCount++;
  }
  console.log(`  ✓ ${eCount} pegawai/employee migrated`);
}

async function migratePasien() {
  console.log('\n--- Migrating: pasien → Patient ---');
  const [rows] = await khanza.query('SELECT * FROM pasien') as any;
  let count = 0;

  for (const row of rows) {
    const noRm = row.no_rkm_medis.trim();
    const existing = await prisma.patient.findUnique({ where: { noRm } });
    if (existing) { count++; continue; }

    const statusMap: Record<string, string> = {
      'BELUM MENIKAH': 'BELUM_KAWIN', 'MENIKAH': 'KAWIN',
      'JANDA': 'CERAI_HIDUP', 'DUDHA': 'CERAI_HIDUP', 'JOMBLO': 'BELUM_KAWIN',
    };

    try {
      await prisma.patient.create({
        data: {
          noRm,
          nik: row.no_ktp || null,
          noBpjs: row.no_peserta || null,
          namaLengkap: row.nm_pasien || 'Unknown',
          tempatLahir: row.tmp_lahir || null,
          tanggalLahir: row.tgl_lahir || new Date('1970-01-01'),
          jenisKelamin: (row.jk === 'P' ? 'P' : 'L') as any,
          golonganDarah: ['A', 'B', 'AB', 'O'].includes(row.gol_darah) ? row.gol_darah as any : null,
          agama: row.agama || null,
          statusNikah: statusMap[row.stts_nikah] || row.stts_nikah || null,
          pekerjaan: row.pekerjaan || null,
          alamat: row.alamat || null,
          noTelp: row.no_tlp || null,
          namaIbu: row.nm_ibu || null,
          namaPj: row.namakeluarga || null,
          hubunganPj: row.keluarga || null,
          pekerjaanPj: row.pekerjaanpj || null,
          alamatPj: row.alamatpj || null,
          kelurahanPj: row.kelurahanpj || null,
          kecamatanPj: row.kecamatanpj || null,
          kabupatenPj: row.kabupatenpj || null,
          propinsiPj: row.propinsipj || null,
          kdPj: row.kd_pj ? row.kd_pj.trim() : null,
          kdKel: row.kd_kel || null,
          kdKec: row.kd_kec || null,
          kdKab: row.kd_kab || null,
          kdProp: row.kd_prop || null,
          umur: row.umur || null,
          email: row.email || null,
          tglDaftar: row.tgl_daftar || null,
          pendidikan: row.pnd || null,
          perusahaanPasien: row.perusahaan_pasien || null,
        },
      });
      count++;
    } catch (e: any) {
      console.log(`  ⚠ Skip pasien ${noRm}: ${e.message?.substring(0, 80)}`);
    }
  }
  console.log(`  ✓ ${count} pasien migrated`);
}

async function migrateDatabarang() {
  console.log('\n--- Migrating: databarang → Medicine ---');
  const [rows] = await khanza.query("SELECT * FROM databarang WHERE status='1'") as any;
  let count = 0;

  for (const row of rows) {
    const kode = row.kode_brng.trim();
    const existing = await prisma.medicine.findUnique({ where: { kode } });
    if (existing) { count++; continue; }

    try {
      await prisma.medicine.create({
        data: {
          kode,
          namaGenerik: row.nama_brng || kode,
          namaDagang: row.nama_brng || null,
          satuan: row.kode_sat || 'unit',
          satuanBesar: row.kode_satbesar || null,
          isi: row.isi || 1,
          kategori: 'OBAT',
          hargaDasar: row.dasar || 0,
          hargaBeli: row.h_beli || 0,
          hargaJualRalan: row.ralan || 0,
          hargaJualKelas1: row.kelas1 || 0,
          hargaJualKelas2: row.kelas2 || 0,
          hargaJualKelas3: row.kelas3 || 0,
          hargaJualUtama: row.utama || 0,
          hargaJualVip: row.vip || 0,
          hargaJualVvip: row.vvip || 0,
          hargaJualBebas: row.jualbebas || 0,
          hargaKaryawan: row.karyawan || 0,
          hargaBeliLuar: row.beliluar || 0,
          stokMinimum: row.stokminimal || 0,
          kapasitas: row.kapasitas || 0,
          letakBarang: row.letak_barang || null,
          kodeIndustri: row.kode_industri || null,
          kodeKategori: row.kode_kategori || null,
          kodeGolongan: row.kode_golongan || null,
          expire: row.expire || null,
          isActive: true,
        },
      });
      count++;
    } catch (e: any) {
      // Skip errors
    }
  }
  console.log(`  ✓ ${count} databarang/medicine migrated`);
}

async function migrateRegPeriksa() {
  console.log('\n--- Migrating: reg_periksa → Encounter ---');
  const [rows] = await khanza.query('SELECT * FROM reg_periksa ORDER BY tgl_registrasi, no_rawat') as any;
  let count = 0;

  for (const row of rows) {
    const noRawat = row.no_rawat.trim();
    const existing = await prisma.encounter.findUnique({ where: { noRawat } });
    if (existing) { count++; continue; }

    // Lookup patient
    const patient = await prisma.patient.findUnique({ where: { noRm: (row.no_rkm_medis || '').trim() } });
    if (!patient) continue;

    // Lookup practitioner
    const practitioner = row.kd_dokter
      ? await prisma.practitioner.findFirst({ where: { kdDokter: row.kd_dokter.trim() } })
      : null;

    // Lookup location
    const locKode = `POLI-${(row.kd_poli || '').trim()}`;
    const location = await prisma.location.findUnique({ where: { kode: locKode } });
    if (!location) continue;

    const statusMap: Record<string, string> = {
      'Belum': 'PLANNED', 'Sudah': 'FINISHED', 'Batal': 'CANCELLED',
      'Berkas Diterima': 'ARRIVED', 'Dirujuk': 'FINISHED',
      'Meninggal': 'FINISHED', 'Dirawat': 'IN_PROGRESS', 'Pulang Paksa': 'FINISHED',
    };

    const penjaminMap: Record<string, string> = { 'BPJ': 'BPJS', 'UMU': 'UMUM' };

    try {
      const tanggalMasuk = row.tgl_registrasi
        ? new Date(`${row.tgl_registrasi.toISOString().slice(0, 10)}T${row.jam_reg || '00:00:00'}`)
        : new Date();

      await prisma.encounter.create({
        data: {
          noRawat,
          noReg: row.no_reg || null,
          patientId: patient.id,
          practitionerId: practitioner?.id || null,
          locationId: location.id,
          tipe: row.status_lanjut === 'Ranap' ? 'RAWAT_INAP' : 'RAWAT_JALAN' as any,
          status: (statusMap[row.stts] || 'FINISHED') as any,
          penjamin: (penjaminMap[(row.kd_pj || '').trim()] || 'UMUM') as any,
          kdPj: row.kd_pj ? row.kd_pj.trim() : null,
          tanggalMasuk,
          biayaReg: row.biaya_reg || null,
          sttsDaftar: row.stts_daftar || null,
          statusBayar: row.status_bayar || null,
          statusPoli: row.status_poli || null,
          umurDaftar: row.umurdaftar || null,
          sttsUmur: row.sttsumur || null,
          pJawab: row.p_jawab || null,
          alamatPj: row.almt_pj || null,
          hubunganPj: row.hubunganpj || null,
        },
      });
      count++;
    } catch (e: any) {
      console.log(`  ⚠ Skip encounter ${noRawat}: ${e.message?.substring(0, 80)}`);
    }
  }
  console.log(`  ✓ ${count} reg_periksa/encounter migrated`);
}

// ==========================================
// Validation
// ==========================================

async function validate() {
  console.log('\n--- Validation ---');

  const checks = [
    { label: 'Penjab', query: prisma.penjab.count() },
    { label: 'Spesialis', query: prisma.spesialis.count() },
    { label: 'Penyakit (ICD-10)', query: prisma.penyakit.count() },
    { label: 'Location', query: prisma.location.count() },
    { label: 'Bed', query: prisma.bed.count() },
    { label: 'Practitioner', query: prisma.practitioner.count() },
    { label: 'Employee', query: prisma.employee.count() },
    { label: 'Patient', query: prisma.patient.count() },
    { label: 'Medicine', query: prisma.medicine.count() },
    { label: 'Encounter', query: prisma.encounter.count() },
  ];

  for (const check of checks) {
    const count = await check.query;
    console.log(`  ${check.label}: ${count} records`);
  }
}

main();
