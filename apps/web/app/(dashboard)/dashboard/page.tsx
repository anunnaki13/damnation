'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import { apiClient } from '@/lib/api-client';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [queueSummary, setQueueSummary] = useState<any[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    apiClient.get('/registration/stats').then((r) => setStats(r.data)).catch(() => {});
    apiClient.get('/queue/summary').then((r) => setQueueSummary(r.data)).catch(() => {});
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Selamat Pagi' : now.getHours() < 17 ? 'Selamat Siang' : 'Selamat Malam';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="glass-card-static p-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-cyan-600/10" />
        <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/[0.07] rounded-full blur-[100px]" />
        <div className="absolute bottom-[-50%] left-[10%] w-[300px] h-[300px] bg-cyan-500/[0.05] rounded-full blur-[80px]" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">{greeting}</p>
            <h1 className="text-3xl font-bold text-white mt-1">{user?.username}</h1>
            <p className="text-slate-500 text-sm mt-2">
              {now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-mono font-bold gradient-text-static tracking-wider">
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs text-slate-500 mt-1">RSUD Petala Bumi</p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Hero Stat */}
        <div className="col-span-12 md:col-span-5 glass-card-static p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/[0.08] to-transparent" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="dot-pulse bg-emerald-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Live Hari Ini</p>
            </div>
            <p className="text-6xl font-black gradient-text">{stats?.total ?? 0}</p>
            <p className="text-slate-400 text-sm mt-2">Total Kunjungan</p>
            <div className="flex gap-6 mt-5">
              <div>
                <p className="text-2xl font-bold text-indigo-400">{stats?.rawatJalan ?? 0}</p>
                <p className="text-[11px] text-slate-500">Rawat Jalan</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{stats?.igd ?? 0}</p>
                <p className="text-[11px] text-slate-500">IGD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Penjamin Split */}
        <div className="col-span-6 md:col-span-3.5 glass-card-static p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] to-transparent" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{stats?.bpjs ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">BPJS Kesehatan</p>
            <div className="mt-3 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: stats?.total ? `${(stats.bpjs / stats.total) * 100}%` : '0%' }} />
            </div>
          </div>
        </div>

        <div className="col-span-6 md:col-span-3.5 glass-card-static p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.06] to-transparent" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-amber-400">{stats?.umum ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">Pasien Umum</p>
            <div className="mt-3 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000"
                style={{ width: stats?.total ? `${(stats.umum / stats.total) * 100}%` : '0%' }} />
            </div>
          </div>
        </div>

        {/* Progress Ring Style */}
        <div className="col-span-12 md:col-span-6 glass-card-static p-6">
          <p className="text-sm text-slate-400 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Status Pelayanan
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/[0.06] border border-emerald-500/10 rounded-2xl p-4 text-center">
              <p className="text-4xl font-black text-emerald-400">{stats?.selesai ?? 0}</p>
              <p className="text-xs text-emerald-300/60 mt-1">Selesai Dilayani</p>
              <div className="mt-3 h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500/50 rounded-full"
                  style={{ width: stats?.total ? `${(stats.selesai / stats.total) * 100}%` : '0%' }} />
              </div>
            </div>
            <div className="bg-indigo-500/[0.06] border border-indigo-500/10 rounded-2xl p-4 text-center">
              <p className="text-4xl font-black text-indigo-400">{stats?.belumSelesai ?? 0}</p>
              <p className="text-xs text-indigo-300/60 mt-1">Dalam Proses</p>
              <div className="mt-3 h-1 bg-indigo-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500/50 rounded-full"
                  style={{ width: stats?.total ? `${(stats.belumSelesai / stats.total) * 100}%` : '0%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions — better design */}
        <div className="col-span-12 md:col-span-6 glass-card-static p-6">
          <p className="text-sm text-slate-400 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Akses Cepat
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Registrasi Baru', href: '/registrasi', icon: 'M12 4.5v15m7.5-7.5h-15', gradient: 'from-indigo-500 to-violet-500' },
              { label: 'Rawat Jalan', href: '/rawat-jalan', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', gradient: 'from-cyan-500 to-blue-500' },
              { label: 'Monitor Antrean', href: '/antrean', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', gradient: 'from-emerald-500 to-teal-500' },
              { label: 'Master Data', href: '/admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0', gradient: 'from-purple-500 to-pink-500' },
            ].map((a) => (
              <a key={a.href} href={a.href}
                className={`group relative overflow-hidden bg-gradient-to-r ${a.gradient} rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                <div className="relative flex items-center gap-3">
                  <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
                  </svg>
                  <span className="text-white text-sm font-semibold">{a.label}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Antrean Poli */}
        <div className="col-span-12">
          <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
            <div className="dot-pulse bg-cyan-400" />
            Antrean Aktif per Poli
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {queueSummary.filter((q) => q.total > 0).length === 0 ? (
              <div className="col-span-full glass-card-static p-8 text-center">
                <p className="text-slate-600 text-sm">Belum ada antrean aktif hari ini</p>
              </div>
            ) : (
              queueSummary.filter((q) => q.total > 0).map((q) => (
                <div key={q.location.id} className="glass-card-static p-4 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.04] to-transparent" />
                  <div className="relative">
                    <p className="text-[11px] text-slate-500 truncate">{q.location.nama}</p>
                    <p className="text-4xl font-black gradient-text-static mt-1">{q.currentNumber ?? '-'}</p>
                    <div className="flex justify-center gap-4 mt-2 text-[11px]">
                      <span className="text-emerald-400/80">{q.done} selesai</span>
                      <span className="text-amber-400/80">{q.waiting} tunggu</span>
                    </div>
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
