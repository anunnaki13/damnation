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
    <div className="flex h-screen bg-[#0f0f23]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[600px] h-[600px] bg-indigo-600/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-[10%] w-[500px] h-[500px] bg-cyan-500/[0.02] rounded-full blur-[120px]" />
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
