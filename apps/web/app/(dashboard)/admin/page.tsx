'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';

const adminMenus = [
  { label: 'Master Pasien', href: '/admin/pasien', desc: 'Data pasien, registrasi baru, search', gradient: 'from-blue-500/20 to-indigo-500/20', iconColor: 'text-blue-400', border: 'border-blue-500/10' },
  { label: 'Dokter & Nakes', href: '/admin/dokter', desc: 'Dokter, perawat, tenaga kesehatan', gradient: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400', border: 'border-emerald-500/10' },
  { label: 'Lokasi / Unit', href: '/admin/lokasi', desc: 'Poli, bangsal, IGD, OK, lab', gradient: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-400', border: 'border-amber-500/10' },
  { label: 'Obat & Alkes', href: '/admin/obat', desc: 'Formularium, harga, stok minimum', gradient: 'from-red-500/20 to-pink-500/20', iconColor: 'text-red-400', border: 'border-red-500/10' },
  { label: 'Jadwal Dokter', href: '/admin/jadwal', desc: 'Jadwal praktik per poli per hari', gradient: 'from-purple-500/20 to-violet-500/20', iconColor: 'text-purple-400', border: 'border-purple-500/10' },
  { label: 'User Management', href: '/admin/users', desc: 'Users, roles, permissions', gradient: 'from-slate-500/20 to-zinc-500/20', iconColor: 'text-slate-400', border: 'border-slate-500/10' },
];

export default function AdminPage() {
  return (
    <div>
      <PageHeader title="Administrasi Sistem" description="Kelola master data dan konfigurasi SIMRS" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminMenus.map((menu) => (
          <Link key={menu.href} href={menu.href}
            className={`glass-card p-6 group relative overflow-hidden border ${menu.border}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${menu.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <h3 className={`font-semibold text-white text-lg group-hover:${menu.iconColor} transition-colors`}>{menu.label}</h3>
              <p className="text-sm text-slate-500 mt-2">{menu.desc}</p>
              <div className="mt-4 flex items-center text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                <span>Kelola</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
