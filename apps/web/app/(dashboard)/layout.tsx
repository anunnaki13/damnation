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
    <div className="flex h-screen" style={{ background: 'linear-gradient(180deg, #0c0c1d 0%, #080818 100%)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[800px] h-[600px] bg-[#7c5cfc]/[0.015] rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-[10%] w-[600px] h-[500px] bg-[#2dd4bf]/[0.01] rounded-full blur-[180px]" />
      </div>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 max-w-[1440px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
