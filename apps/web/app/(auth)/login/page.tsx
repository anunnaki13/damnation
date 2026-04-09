'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #060612 0%, #0c0c1d 50%, #080818 100%)' }}>
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-[#7c5cfc]/[0.06] rounded-full blur-[180px]" />
        <div className="absolute bottom-[-15%] right-[5%] w-[600px] h-[600px] bg-[#2dd4bf]/[0.04] rounded-full blur-[200px]" />
      </div>

      <div className="w-full max-w-[400px] relative z-10 px-5">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-5 relative">
            <div className="absolute inset-[-6px] bg-gradient-to-br from-[#7c5cfc] to-[#2dd4bf] rounded-2xl opacity-30 blur-lg" />
            <div className="relative w-full h-full bg-gradient-to-br from-[#7c5cfc] to-[#2dd4bf] rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-black text-white">PB</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">SIMRS Petala Bumi</h1>
          <p className="text-[13px] text-[#4a5268] mt-1.5">RSUD Petala Bumi Provinsi Riau</p>
        </div>

        <div className="card-flat p-7">
          {error && (
            <div className="mb-5 px-4 py-2.5 rounded-xl bg-red-500/[0.06] border border-red-500/10 text-red-400 text-[13px]">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#4a5268] uppercase tracking-[0.1em] mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="input py-3" placeholder="Masukkan username" required autoFocus />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#4a5268] uppercase tracking-[0.1em] mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input py-3" placeholder="Masukkan password" required minLength={6} />
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Memproses...
                </span>
              ) : 'Masuk ke Sistem'}
            </button>
          </form>

          <p className="text-center text-[10px] text-[#3a3f4e] mt-5">v1.0 — CV Panda Global Teknologi</p>
        </div>
      </div>
    </div>
  );
}
