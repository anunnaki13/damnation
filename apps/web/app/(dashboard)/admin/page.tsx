'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';

const adminMenus = [
  { label: 'Master Pasien', href: '/admin/pasien', desc: 'CRUD data pasien, search, registrasi baru', icon: 'P', color: 'bg-blue-500' },
  { label: 'Master Dokter & Nakes', href: '/admin/dokter', desc: 'Data dokter, perawat, dan tenaga kesehatan', icon: 'D', color: 'bg-green-500' },
  { label: 'Master Lokasi / Unit', href: '/admin/lokasi', desc: 'Poli, bangsal, IGD, OK, lab, radiologi, farmasi', icon: 'L', color: 'bg-orange-500' },
  { label: 'Master Obat & Alkes', href: '/admin/obat', desc: 'Formularium obat, alkes, BHP, harga', icon: 'O', color: 'bg-red-500' },
  { label: 'Jadwal Praktik Dokter', href: '/admin/jadwal', desc: 'Jadwal dokter per poli, per hari', icon: 'J', color: 'bg-purple-500' },
  { label: 'User Management', href: '/admin/users', desc: 'Kelola user, roles, dan permissions', icon: 'U', color: 'bg-gray-700' },
];

export default function AdminPage() {
  return (
    <div>
      <PageHeader title="Administrasi Sistem" description="Kelola master data dan konfigurasi SIMRS" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminMenus.map((menu) => (
          <Link key={menu.href} href={menu.href}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${menu.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                {menu.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition">{menu.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{menu.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
