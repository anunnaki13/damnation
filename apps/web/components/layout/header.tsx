'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <header className="h-14 glass border-b border-white/[0.06] flex items-center justify-between px-6">
      <div>
        <p className="text-sm text-slate-400">RSUD Petala Bumi Provinsi Riau</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/[0.08]">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-200">{user?.username}</p>
            <p className="text-[10px] text-slate-500">{user?.roles?.join(', ')}</p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 rounded-lg flex items-center justify-center border border-white/10">
            <span className="text-xs font-semibold text-indigo-300">{user?.username?.charAt(0).toUpperCase()}</span>
          </div>
          <button onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition" title="Keluar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
