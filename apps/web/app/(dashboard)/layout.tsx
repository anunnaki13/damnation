'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login');
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <div className="flex h-screen" style={{ background: '#09090F' }}>
      {/* Background orbs — design system spec */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-drift"
          style={{ background: 'rgba(139,92,246,0.18)' }} />
        <div className="absolute bottom-[-15%] right-[5%] w-[420px] h-[420px] rounded-full blur-[120px] animate-drift"
          style={{ background: 'rgba(94,234,212,0.12)', animationDelay: '10s' }} />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full blur-[120px] animate-drift"
          style={{ background: 'rgba(253,164,175,0.08)', animationDelay: '20s' }} />
      </div>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="px-7 py-7 max-w-[1440px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
