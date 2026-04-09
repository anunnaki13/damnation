'use client';

import { useAuthStore } from '@/hooks/use-auth-store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Pasien Hari Ini', value: '0', color: 'bg-blue-500' },
    { label: 'Rawat Jalan', value: '0', color: 'bg-green-500' },
    { label: 'Rawat Inap', value: '0', color: 'bg-orange-500' },
    { label: 'IGD', value: '0', color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang, {user?.username}. RSUD Petala Bumi Provinsi Riau
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-lg font-bold">
                  {stat.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Antrean Aktif</h2>
          <p className="text-gray-400 text-sm">Belum ada data antrean</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terkini</h2>
          <p className="text-gray-400 text-sm">Belum ada aktivitas</p>
        </div>
      </div>
    </div>
  );
}
