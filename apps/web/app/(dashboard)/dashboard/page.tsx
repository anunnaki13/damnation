'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import { apiClient } from '@/lib/api-client';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [queueSummary, setQueueSummary] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/registration/stats').then((r) => setStats(r.data)).catch(() => {});
    apiClient.get('/queue/summary').then((r) => setQueueSummary(r.data)).catch(() => {});
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Selamat Pagi' : now.getHours() < 17 ? 'Selamat Siang' : 'Selamat Malam';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{greeting}, {user?.username}</h1>
        <p className="text-slate-500 mt-1">{now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4">

        {/* Big stat — Total Pasien Hari Ini */}
        <div className="col-span-12 md:col-span-4 glass-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-2xl -mr-10 -mt-10 group-hover:from-indigo-500/30 transition" />
          <p className="text-sm text-slate-400 mb-1">Total Kunjungan Hari Ini</p>
          <p className="text-5xl font-bold gradient-text">{stats?.total ?? 0}</p>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="text-slate-400">RJ: <span className="text-indigo-300 font-semibold">{stats?.rawatJalan ?? 0}</span></span>
            <span className="text-slate-400">IGD: <span className="text-red-400 font-semibold">{stats?.igd ?? 0}</span></span>
          </div>
        </div>

        {/* BPJS vs Umum */}
        <div className="col-span-6 md:col-span-4 glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/15 to-transparent rounded-full blur-2xl -mr-6 -mt-6" />
          <p className="text-sm text-slate-400 mb-1">BPJS</p>
          <p className="text-4xl font-bold text-emerald-400">{stats?.bpjs ?? 0}</p>
          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
              style={{ width: stats?.total ? `${(stats.bpjs / stats.total) * 100}%` : '0%' }} />
          </div>
        </div>

        <div className="col-span-6 md:col-span-4 glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/15 to-transparent rounded-full blur-2xl -mr-6 -mt-6" />
          <p className="text-sm text-slate-400 mb-1">Umum</p>
          <p className="text-4xl font-bold text-amber-400">{stats?.umum ?? 0}</p>
          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
              style={{ width: stats?.total ? `${(stats.umum / stats.total) * 100}%` : '0%' }} />
          </div>
        </div>

        {/* Progress — Selesai / Belum */}
        <div className="col-span-12 md:col-span-6 glass-card p-6">
          <p className="text-sm text-slate-400 mb-4">Status Pelayanan</p>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Selesai</span>
                <span className="text-emerald-400 font-semibold">{stats?.selesai ?? 0}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all"
                  style={{ width: stats?.total ? `${(stats.selesai / stats.total) * 100}%` : '0%' }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Dalam Proses</span>
                <span className="text-indigo-400 font-semibold">{stats?.belumSelesai ?? 0}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all"
                  style={{ width: stats?.total ? `${(stats.belumSelesai / stats.total) * 100}%` : '0%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 md:col-span-6 glass-card p-6">
          <p className="text-sm text-slate-400 mb-4">Akses Cepat</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Registrasi Baru', href: '/registrasi', gradient: 'from-indigo-500 to-indigo-600' },
              { label: 'Rawat Jalan', href: '/rawat-jalan', gradient: 'from-cyan-500 to-cyan-600' },
              { label: 'Antrean', href: '/antrean', gradient: 'from-emerald-500 to-emerald-600' },
              { label: 'Master Data', href: '/admin', gradient: 'from-purple-500 to-purple-600' },
            ].map((a) => (
              <a key={a.href} href={a.href}
                className={`bg-gradient-to-r ${a.gradient} text-white text-sm font-medium rounded-xl px-4 py-3 text-center hover:opacity-90 transition shadow-lg`}>
                {a.label}
              </a>
            ))}
          </div>
        </div>

        {/* Antrean Poli — Bento cards */}
        <div className="col-span-12">
          <p className="text-sm text-slate-400 mb-3">Antrean Aktif per Poli</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {queueSummary.filter((q) => q.total > 0).length === 0 ? (
              <div className="col-span-full glass-card p-6 text-center text-slate-500 text-sm">
                Belum ada antrean aktif hari ini
              </div>
            ) : (
              queueSummary.filter((q) => q.total > 0).map((q) => (
                <div key={q.location.id} className="glass-card p-4 text-center">
                  <p className="text-xs text-slate-500 truncate">{q.location.nama}</p>
                  <p className="text-3xl font-bold text-indigo-400 mt-1">{q.currentNumber ?? '-'}</p>
                  <div className="flex justify-center gap-3 mt-2 text-[11px]">
                    <span className="text-emerald-400">{q.done} selesai</span>
                    <span className="text-amber-400">{q.waiting} tunggu</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
