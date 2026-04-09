'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <header className="h-14 flex items-center justify-between px-7 border-b"
      style={{ background: 'rgba(9,9,15,0.6)', backdropFilter: 'blur(28px)' }}>
      <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>RSUD Petala Bumi Provinsi Riau</p>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-[10px] text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[rgba(255,255,255,0.04)] transition">
          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="notif-dot" />
        </button>
        <div className="h-5 w-px" style={{ background: 'var(--glass-border)' }} />
        <div className="flex items-center gap-2.5">
          <div className="avatar-ring">
            <div className="avatar-inner">{user?.username?.charAt(0).toUpperCase()}</div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-semibold" style={{ color: 'var(--text-1)' }}>{user?.username}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{user?.roles?.[0]}</p>
          </div>
          <button onClick={() => { logout(); router.push('/login'); }}
            className="p-1.5 rounded-[8px] text-[var(--text-3)] hover:text-[var(--rose)] hover:bg-[var(--rose-dim)] transition" title="Keluar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
