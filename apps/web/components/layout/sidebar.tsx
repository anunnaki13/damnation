'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  children?: MenuItem[];
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'grid' },
  { label: 'Registrasi', href: '/registrasi', icon: 'clipboard' },
  { label: 'Rawat Jalan', href: '/rawat-jalan', icon: 'stethoscope' },
  { label: 'IGD', href: '/igd', icon: 'alert-circle' },
  { label: 'Rawat Inap', href: '/rawat-inap', icon: 'bed' },
  { label: 'Kamar Operasi', href: '/kamar-operasi', icon: 'scissors' },
  { label: 'Farmasi', href: '/farmasi', icon: 'pill' },
  { label: 'Laboratorium', href: '/laboratorium', icon: 'flask' },
  { label: 'Radiologi', href: '/radiologi', icon: 'scan' },
  { label: 'Billing & Kasir', href: '/billing', icon: 'credit-card' },
  { label: 'Antrean', href: '/antrean', icon: 'users' },
  { label: 'Rekam Medis', href: '/rekam-medis', icon: 'file-text' },
  { label: 'Keuangan', href: '/keuangan', icon: 'dollar-sign', roles: ['ADMIN', 'MANAJEMEN'] },
  { label: 'Kepegawaian', href: '/kepegawaian', icon: 'briefcase', roles: ['ADMIN', 'MANAJEMEN'] },
  { label: 'Logistik', href: '/logistik', icon: 'package', roles: ['ADMIN', 'MANAJEMEN'] },
  { label: 'Aset', href: '/aset', icon: 'monitor', roles: ['ADMIN', 'MANAJEMEN'] },
  { label: 'Gizi', href: '/gizi', icon: 'utensils' },
  { label: 'Dashboard Analitik', href: '/dashboard-analitik', icon: 'bar-chart', roles: ['ADMIN', 'MANAJEMEN'] },
  { label: 'SATUSEHAT', href: '/satusehat', icon: 'cloud', roles: ['ADMIN', 'IT'] },
  { label: 'BPJS', href: '/bpjs', icon: 'shield', roles: ['ADMIN', 'IT'] },
  { label: 'Admin', href: '/admin', icon: 'settings', roles: ['ADMIN'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-700">PB</span>
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none">SIMRS</h1>
              <p className="text-[10px] text-white/60">Petala Bumi</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/60 hover:text-white p-1"
        >
          {collapsed ? '>' : '<'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-active text-white font-medium'
                  : 'text-white/70 hover:bg-sidebar-hover hover:text-white',
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="w-5 h-5 flex items-center justify-center text-xs">
                {item.icon.charAt(0).toUpperCase()}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/10">
          <p className="text-[10px] text-white/40 text-center">v1.0.0</p>
        </div>
      )}
    </aside>
  );
}
