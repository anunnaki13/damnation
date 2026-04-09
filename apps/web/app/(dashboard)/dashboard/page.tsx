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
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Selamat Pagi' : now.getHours() < 17 ? 'Selamat Siang' : 'Selamat Malam';

  return (
    <div>
      {/* Welcome */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[13px] text-[#4a5268]">{greeting}</p>
          <h1 className="text-[26px] font-bold text-white mt-0.5">{user?.username}</h1>
          <p className="text-[12px] text-[#3a3f4e] mt-1">{now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <p className="text-[32px] font-mono font-bold text-gradient tracking-wider">
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[11px] text-[#3a3f4e]">RSUD Petala Bumi</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* Hero */}
        <div className="col-span-12 md:col-span-4 card-highlight p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="dot-live bg-[#2dd4bf]" />
            <span className="text-[11px] text-[#4a5268] uppercase tracking-wider font-semibold">Live</span>
          </div>
          <p className="text-[52px] font-black text-gradient leading-none">{stats?.total ?? 0}</p>
          <p className="text-[13px] text-[#8892a4] mt-2">Kunjungan Hari Ini</p>
          <div className="flex gap-5 mt-4">
            <div><p className="text-[20px] font-bold text-[#7c5cfc]">{stats?.rawatJalan ?? 0}</p><p className="text-[11px] text-[#4a5268]">Rawat Jalan</p></div>
            <div><p className="text-[20px] font-bold text-red-400">{stats?.igd ?? 0}</p><p className="text-[11px] text-[#4a5268]">IGD</p></div>
          </div>
        </div>

        {/* BPJS */}
        <div className="col-span-6 md:col-span-4 card-flat p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/[0.08] flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            </div>
            <span className="text-[11px] text-[#4a5268] uppercase tracking-wider font-semibold">BPJS</span>
          </div>
          <p className="text-[28px] font-bold text-emerald-400">{stats?.bpjs ?? 0}</p>
          <div className="mt-3 h-1 bg-[rgba(255,255,255,0.03)] rounded-full"><div className="h-full bg-emerald-500/40 rounded-full transition-all duration-1000" style={{ width: stats?.total ? `${(stats.bpjs/stats.total)*100}%` : '0%' }} /></div>
        </div>

        {/* Umum */}
        <div className="col-span-6 md:col-span-4 card-flat p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/[0.08] flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
            </div>
            <span className="text-[11px] text-[#4a5268] uppercase tracking-wider font-semibold">Umum</span>
          </div>
          <p className="text-[28px] font-bold text-amber-400">{stats?.umum ?? 0}</p>
          <div className="mt-3 h-1 bg-[rgba(255,255,255,0.03)] rounded-full"><div className="h-full bg-amber-500/40 rounded-full transition-all duration-1000" style={{ width: stats?.total ? `${(stats.umum/stats.total)*100}%` : '0%' }} /></div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* Progress */}
        <div className="col-span-12 md:col-span-6 card-flat p-5">
          <p className="text-[12px] text-[#4a5268] uppercase tracking-wider font-semibold mb-4">Status Pelayanan</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/[0.04] border border-emerald-500/[0.08] rounded-2xl p-4 text-center">
              <p className="text-[32px] font-black text-emerald-400">{stats?.selesai ?? 0}</p>
              <p className="text-[11px] text-emerald-400/50 mt-0.5">Selesai</p>
            </div>
            <div className="bg-[#7c5cfc]/[0.04] border border-[#7c5cfc]/[0.08] rounded-2xl p-4 text-center">
              <p className="text-[32px] font-black text-[#9b85fd]">{stats?.belumSelesai ?? 0}</p>
              <p className="text-[11px] text-[#7c5cfc]/50 mt-0.5">Proses</p>
            </div>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="col-span-12 md:col-span-6 card-flat p-5">
          <p className="text-[12px] text-[#4a5268] uppercase tracking-wider font-semibold mb-4">Akses Cepat</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Registrasi', href: '/registrasi', from: '#7c5cfc', to: '#6246ea' },
              { label: 'Rawat Jalan', href: '/rawat-jalan', from: '#2dd4bf', to: '#14b8a6' },
              { label: 'Antrean', href: '/antrean', from: '#10b981', to: '#059669' },
              { label: 'Master Data', href: '/admin', from: '#8b5cf6', to: '#7c3aed' },
            ].map((a) => (
              <a key={a.href} href={a.href}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})`, boxShadow: `0 4px 14px ${a.from}30` }}>
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Queue */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="dot-live bg-[#2dd4bf]" />
          <p className="text-[12px] text-[#4a5268] uppercase tracking-wider font-semibold">Antrean Poli</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {queueSummary.filter((q) => q.total > 0).length === 0 ? (
            <div className="col-span-full card-flat p-10 text-center text-[13px] text-[#3a3f4e]">Belum ada antrean aktif</div>
          ) : queueSummary.filter((q) => q.total > 0).map((q) => (
            <div key={q.location.id} className="card-flat p-4 text-center">
              <p className="text-[11px] text-[#4a5268] truncate">{q.location.nama}</p>
              <p className="text-[36px] font-black text-gradient mt-1">{q.currentNumber ?? '-'}</p>
              <div className="flex justify-center gap-3 mt-1.5 text-[10px]">
                <span className="text-emerald-400/70">{q.done} selesai</span>
                <span className="text-amber-400/70">{q.waiting} tunggu</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
