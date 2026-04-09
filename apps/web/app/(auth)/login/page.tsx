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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[#0a0a1a]">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      <div className="w-full max-w-md relative z-10 px-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-5 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-2xl rotate-6 opacity-50 blur-sm" />
            <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-3xl font-black text-white tracking-tight">PB</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SIMRS Petala Bumi</h1>
          <p className="text-sm text-slate-400 mt-2">RSUD Petala Bumi Provinsi Riau</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Masuk ke Sistem</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 glass-input" placeholder="Masukkan username"
                required autoFocus />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 glass-input" placeholder="Masukkan password"
                required minLength={6} />
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3 glass-btn text-sm">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Memproses...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500">SIMRS Petala Bumi v1.0</p>
            <p className="text-xs text-slate-600 mt-1">CV Panda Global Teknologi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
