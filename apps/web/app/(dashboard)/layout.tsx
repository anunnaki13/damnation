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
    <div className="flex h-screen bg-[#080816]">
      {/* Ambient gradient mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-indigo-600/[0.025] rounded-full blur-[150px] animate-float" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-cyan-500/[0.02] rounded-full blur-[120px]" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] left-[50%] w-[400px] h-[400px] bg-purple-500/[0.015] rounded-full blur-[100px]" style={{ animationDelay: '4s' }} />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
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
