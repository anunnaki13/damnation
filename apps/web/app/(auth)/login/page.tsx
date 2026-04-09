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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#060612]">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[150px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-5%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-purple-500/8 rounded-full blur-[120px]" style={{ animationDelay: '3s' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <div className="w-full max-w-[420px] relative z-10 px-5">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-[-4px] bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 rounded-2xl opacity-40 blur-md animate-float" />
            <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-black text-white tracking-tight">PB</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SIMRS Petala Bumi</h1>
          <p className="text-sm text-slate-500 mt-2 tracking-wide">RSUD Petala Bumi Provinsi Riau</p>
        </div>

        {/* Login Card */}
        <div className="glass-card-static p-8 glow-ring">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <span className="text-xs text-slate-500 uppercase tracking-widest">Masuk</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 glass-input text-sm" placeholder="Masukkan username"
                required autoFocus autoComplete="username" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 glass-input text-sm" placeholder="Masukkan password"
                required minLength={6} autoComplete="current-password" />
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 glass-btn text-sm tracking-wide">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Memproses...
                </span>
              ) : 'Masuk ke Sistem'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-8">
          SIMRS Petala Bumi v1.0 &mdash; CV Panda Global Teknologi
        </p>
      </div>
    </div>
  );
}
