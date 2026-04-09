import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Roles
  const roles = [
    { name: 'ADMIN', description: 'Administrator Sistem', permissions: JSON.stringify(['*']) },
    { name: 'DOKTER', description: 'Dokter / Dokter Spesialis', permissions: JSON.stringify(['encounter:*', 'patient:read', 'emr:*', 'prescription:*', 'lab:order', 'radiology:order']) },
    { name: 'PERAWAT', description: 'Perawat', permissions: JSON.stringify(['encounter:read', 'patient:read', 'emr:read', 'emr:create:nursing', 'vitals:*', 'queue:*']) },
    { name: 'APOTEKER', description: 'Apoteker', permissions: JSON.stringify(['prescription:*', 'medicine:*', 'stock:*', 'patient:read']) },
    { name: 'REGISTRASI', description: 'Petugas Registrasi', permissions: JSON.stringify(['patient:*', 'encounter:create', 'encounter:read', 'queue:*', 'bpjs:check']) },
    { name: 'KASIR', description: 'Kasir', permissions: JSON.stringify(['billing:*', 'payment:*', 'patient:read', 'encounter:read']) },
    { name: 'LAB_ANALIS', description: 'Analis Laboratorium', permissions: JSON.stringify(['lab:*', 'patient:read', 'encounter:read']) },
    { name: 'RADIOGRAFER', description: 'Radiografer', permissions: JSON.stringify(['radiology:*', 'patient:read', 'encounter:read']) },
    { name: 'MANAJEMEN', description: 'Manajemen / Direktur', permissions: JSON.stringify(['dashboard:*', 'report:*', 'analytics:*', 'patient:read', 'encounter:read', 'billing:read']) },
    { name: 'IT', description: 'Staff IT', permissions: JSON.stringify(['admin:*', 'user:*', 'satusehat:*', 'bpjs:*', 'audit:read']) },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, permissions: role.permissions },
      create: role,
    });
  }
  console.log('Roles seeded');

  // 2. Seed Admin User
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const passwordHash = await bcrypt.hash('admin123', 12);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@rsudpetalabumi.go.id',
      passwordHash,
      userRoles: {
        create: { roleId: adminRole!.id },
      },
    },
  });
  console.log('Admin user seeded (username: admin, password: admin123)');

  // 3. Seed Locations
  const locations = [
    { kode: 'POLI-UMUM', nama: 'Poli Umum', tipe: 'POLI' as const },
    { kode: 'POLI-PD', nama: 'Poli Penyakit Dalam', tipe: 'POLI' as const },
    { kode: 'POLI-ANAK', nama: 'Poli Anak', tipe: 'POLI' as const },
    { kode: 'POLI-BEDAH', nama: 'Poli Bedah', tipe: 'POLI' as const },
    { kode: 'POLI-OBGYN', nama: 'Poli Kebidanan & Kandungan', tipe: 'POLI' as const },
    { kode: 'POLI-MATA', nama: 'Poli Mata', tipe: 'POLI' as const },
    { kode: 'POLI-THT', nama: 'Poli THT', tipe: 'POLI' as const },
    { kode: 'POLI-GIGI', nama: 'Poli Gigi & Mulut', tipe: 'POLI' as const },
    { kode: 'POLI-SARAF', nama: 'Poli Saraf', tipe: 'POLI' as const },
    { kode: 'POLI-JANTUNG', nama: 'Poli Jantung', tipe: 'POLI' as const },
    { kode: 'IGD-01', nama: 'Instalasi Gawat Darurat', tipe: 'IGD' as const },
    { kode: 'BANG-MELATI', nama: 'Bangsal Melati (Penyakit Dalam)', tipe: 'BANGSAL' as const, kapasitasBed: 30 },
    { kode: 'BANG-MAWAR', nama: 'Bangsal Mawar (Bedah)', tipe: 'BANGSAL' as const, kapasitasBed: 20 },
    { kode: 'BANG-ANGGREK', nama: 'Bangsal Anggrek (Anak)', tipe: 'BANGSAL' as const, kapasitasBed: 15 },
    { kode: 'BANG-DAHLIA', nama: 'Bangsal Dahlia (Kebidanan)', tipe: 'BANGSAL' as const, kapasitasBed: 15 },
    { kode: 'VIP-01', nama: 'Ruang VIP', tipe: 'BANGSAL' as const, kapasitasBed: 10 },
    { kode: 'ICU-01', nama: 'ICU', tipe: 'ICU' as const, kapasitasBed: 6 },
    { kode: 'OK-01', nama: 'Kamar Operasi', tipe: 'OK' as const },
    { kode: 'LAB-01', nama: 'Laboratorium', tipe: 'LABORATORIUM' as const },
    { kode: 'RAD-01', nama: 'Radiologi', tipe: 'RADIOLOGI' as const },
    { kode: 'FARM-01', nama: 'Farmasi / Apotek', tipe: 'FARMASI' as const },
    { kode: 'FARM-GUDANG', nama: 'Gudang Farmasi', tipe: 'GUDANG' as const },
    { kode: 'GIZI-01', nama: 'Instalasi Gizi', tipe: 'GIZI' as const },
    { kode: 'ADM-01', nama: 'Administrasi', tipe: 'ADMIN' as const },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { kode: loc.kode },
      update: { nama: loc.nama },
      create: loc,
    });
  }
  console.log('Locations seeded');

  // 4. Seed sample practitioners
  const practitioners = [
    { namaLengkap: 'dr. Ahmad Fauzi, Sp.PD', jenisKelamin: 'L' as const, jenisNakes: 'DOKTER_SPESIALIS' as const, spesialisasi: 'Penyakit Dalam', gelarDepan: 'dr.', gelarBelakang: 'Sp.PD' },
    { namaLengkap: 'dr. Siti Rahmawati, Sp.A', jenisKelamin: 'P' as const, jenisNakes: 'DOKTER_SPESIALIS' as const, spesialisasi: 'Anak', gelarDepan: 'dr.', gelarBelakang: 'Sp.A' },
    { namaLengkap: 'dr. Budi Hartono, Sp.B', jenisKelamin: 'L' as const, jenisNakes: 'DOKTER_SPESIALIS' as const, spesialisasi: 'Bedah', gelarDepan: 'dr.', gelarBelakang: 'Sp.B' },
    { namaLengkap: 'dr. Dewi Lestari', jenisKelamin: 'P' as const, jenisNakes: 'DOKTER_UMUM' as const, spesialisasi: null },
    { namaLengkap: 'drg. Rina Susanti', jenisKelamin: 'P' as const, jenisNakes: 'DOKTER_GIGI' as const, spesialisasi: null, gelarDepan: 'drg.' },
  ];

  for (const p of practitioners) {
    const existing = await prisma.practitioner.findFirst({
      where: { namaLengkap: p.namaLengkap },
    });
    if (!existing) {
      await prisma.practitioner.create({ data: p });
    }
  }
  console.log('Practitioners seeded');

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
