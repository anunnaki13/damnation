'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDateTime } from '@/lib/utils';

export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', roleIds: [] as number[] });
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/users').then((r) => { setData(r.data.data); setMeta(r.data.meta); setLoading(false); });
    // Roles would come from a dedicated endpoint; for now we hardcode
    setRoles([
      { id: 1, name: 'ADMIN' }, { id: 2, name: 'DOKTER' }, { id: 3, name: 'PERAWAT' },
      { id: 4, name: 'APOTEKER' }, { id: 5, name: 'REGISTRASI' }, { id: 6, name: 'KASIR' },
      { id: 7, name: 'LAB_ANALIS' }, { id: 8, name: 'RADIOGRAFER' }, { id: 9, name: 'MANAJEMEN' },
      { id: 10, name: 'IT' },
    ]);
  }, []);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users', { params: { page, limit: 20 } });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/users', form);
      setShowForm(false);
      setForm({ username: '', email: '', password: '', roleIds: [] });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const toggleRole = (roleId: number) => {
    setForm((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((r) => r !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  const columns = [
    { key: 'username', label: 'Username', sortable: true, className: 'font-medium' },
    { key: 'email', label: 'Email', render: (v: string) => v || '-' },
    { key: 'roles', label: 'Roles', render: (v: string[]) => (
      <div className="flex gap-1 flex-wrap">
        {v?.map((r) => <StatusBadge key={r} status={r} variant="info" />)}
      </div>
    )},
    { key: 'isActive', label: 'Status', render: (v: boolean) => (
      <StatusBadge status={v ? 'Aktif' : 'Nonaktif'} variant={v ? 'success' : 'danger'} />
    )},
    { key: 'lastLogin', label: 'Login Terakhir', render: (v: string) => v ? formatDateTime(v) : 'Belum pernah' },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        description={`Total: ${meta.total} user`}
        action={
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">
            + Tambah User
          </button>
        }
      />

      <DataTable columns={columns} data={data} isLoading={loading}
        totalPages={meta.totalPages} currentPage={meta.page} onPageChange={fetchData} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tambah User Baru" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Username" required>
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </FormField>
          <FormField label="Email">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </FormField>
          <FormField label="Password" required>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm" required minLength={8} />
          </FormField>
          <FormField label="Roles">
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.roleIds.includes(role.id)}
                    onChange={() => toggleRole(role.id)} className="rounded" />
                  {role.name}
                </label>
              ))}
            </div>
          </FormField>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Batal</button>
            <button type="submit"
              className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
