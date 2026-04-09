'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function BillingPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [payForm, setPayForm] = useState({ jumlah: 0, metode: 'TUNAI', referensi: '' });

  const fetchBills = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (filterStatus) params.status = filterStatus;
      const [billsRes, statsRes] = await Promise.all([
        apiClient.get('/billing', { params }),
        apiClient.get('/billing/stats'),
      ]);
      setBills(billsRes.data.data);
      setMeta(billsRes.data.meta);
      setStats(statsRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const openDetail = async (bill: any) => {
    try {
      const res = await apiClient.get(`/billing/${bill.id}`);
      setSelectedBill(res.data);
    } catch (e) { console.error(e); }
  };

  const handlePay = async () => {
    if (!selectedBill) return;
    try {
      const res = await apiClient.post('/billing/pay', {
        billId: selectedBill.id,
        jumlah: payForm.jumlah,
        metode: payForm.metode,
        referensi: payForm.referensi || undefined,
      });
      if (res.data.kembalian > 0) {
        alert(`Pembayaran berhasil!\nKembalian: ${formatRp(res.data.kembalian)}`);
      } else {
        alert('Pembayaran berhasil!');
      }
      setShowPayment(false);
      setSelectedBill(res.data.bill);
      fetchBills(meta.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses pembayaran');
    }
  };

  const handleVoid = async (id: number) => {
    if (!confirm('Batalkan billing ini?')) return;
    await apiClient.patch(`/billing/${id}/void`);
    setSelectedBill(null);
    fetchBills(meta.page);
  };

  const columns = [
    { key: 'noInvoice', label: 'No. Invoice', className: 'font-mono text-indigo-400 text-xs' },
    { key: 'patient', label: 'Pasien', render: (_: any, row: any) => (
      <div>
        <p className="text-white text-sm">{row.patient?.namaLengkap}</p>
        <p className="text-xs text-slate-500">{row.patient?.noRm}</p>
      </div>
    )},
    { key: 'encounter', label: 'No. Rawat', render: (_: any, row: any) => (
      <span className="font-mono text-xs text-slate-400">{row.encounter?.noRawat || '-'}</span>
    )},
    { key: 'penjamin', label: 'Penjamin', render: (v: string) => (
      <StatusBadge status={v} variant={v === 'BPJS' ? 'success' : 'info'} />
    )},
    { key: 'totalTarif', label: 'Total', className: 'text-right', render: (v: number) => (
      <span className="text-white font-medium">{formatRp(v)}</span>
    )},
    { key: 'sisaBayar', label: 'Sisa', className: 'text-right', render: (v: number) => (
      <span className={v > 0 ? 'text-amber-400' : 'text-emerald-400'}>{formatRp(v)}</span>
    )},
    { key: 'status', label: 'Status', render: (v: string) => (
      <StatusBadge status={v === 'OPEN' ? 'Belum Bayar' : v === 'CLOSED' ? 'Lunas' : 'Batal'}
        variant={v === 'CLOSED' ? 'success' : v === 'VOID' ? 'danger' : 'warning'} />
    )},
  ];

  return (
    <div>
      <PageHeader title="Billing & Kasir" description="Kelola tagihan dan pembayaran pasien" />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Billing', value: stats.totalBills, text: 'text-white' },
            { label: 'Belum Bayar', value: stats.openBills, text: 'text-amber-400' },
            { label: 'Lunas', value: stats.closedBills, text: 'text-emerald-400' },
            { label: 'Revenue', value: formatRp(stats.totalRevenue), text: 'text-indigo-400', small: true },
            { label: 'Pembayaran', value: stats.paymentCount, text: 'text-cyan-400' },
            { label: 'Total Bayar', value: formatRp(stats.totalPayments), text: 'text-emerald-400', small: true },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`${s.small ? 'text-lg' : 'text-2xl'} font-bold ${s.text} mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[
          { key: '', label: 'Semua' },
          { key: 'OPEN', label: 'Belum Bayar' },
          { key: 'CLOSED', label: 'Lunas' },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 text-sm rounded-xl transition ${
              filterStatus === f.key ? 'glass-btn' : 'glass-btn-outline'
            }`}>{f.label}</button>
        ))}
      </div>

      <DataTable columns={columns} data={bills} isLoading={loading}
        totalPages={meta.totalPages} currentPage={meta.page} onPageChange={fetchBills}
        onRowClick={openDetail} emptyMessage="Belum ada data billing" />

      {/* Detail Bill Modal */}
      {selectedBill && (
        <Modal isOpen={!!selectedBill} onClose={() => setSelectedBill(null)}
          title={`Invoice ${selectedBill.noInvoice}`} size="xl">
          <div className="space-y-4">
            {/* Patient Info */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-semibold">{selectedBill.patient?.namaLengkap}</p>
                <p className="text-xs text-slate-500">{selectedBill.patient?.noRm} | {selectedBill.encounter?.noRawat}</p>
              </div>
              <StatusBadge status={selectedBill.status === 'CLOSED' ? 'LUNAS' : selectedBill.status}
                variant={selectedBill.status === 'CLOSED' ? 'success' : 'warning'} />
            </div>

            {/* Items Table */}
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-2.5 text-left text-xs text-slate-500">Kategori</th>
                    <th className="px-4 py-2.5 text-left text-xs text-slate-500">Deskripsi</th>
                    <th className="px-4 py-2.5 text-right text-xs text-slate-500">Qty</th>
                    <th className="px-4 py-2.5 text-right text-xs text-slate-500">Tarif</th>
                    <th className="px-4 py-2.5 text-right text-xs text-slate-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items?.map((item: any) => (
                    <tr key={item.id} className="border-b border-white/[0.03]">
                      <td className="px-4 py-2"><StatusBadge status={item.kategori} variant="info" /></td>
                      <td className="px-4 py-2 text-slate-300">{item.deskripsi}</td>
                      <td className="px-4 py-2 text-right text-slate-400">{item.jumlah}</td>
                      <td className="px-4 py-2 text-right text-slate-400">{formatRp(item.tarif)}</td>
                      <td className="px-4 py-2 text-right text-white font-medium">{formatRp(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/[0.08]">
                    <td colSpan={4} className="px-4 py-2 text-right text-slate-400 font-medium">Total</td>
                    <td className="px-4 py-2 text-right text-white font-bold text-lg">{formatRp(selectedBill.totalTarif)}</td>
                  </tr>
                  {selectedBill.totalBayar > 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-1 text-right text-slate-500">Dibayar</td>
                      <td className="px-4 py-1 text-right text-emerald-400">{formatRp(selectedBill.totalBayar)}</td>
                    </tr>
                  )}
                  {selectedBill.sisaBayar > 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-1 text-right text-slate-500">Sisa</td>
                      <td className="px-4 py-1 text-right text-amber-400 font-bold">{formatRp(selectedBill.sisaBayar)}</td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* Payment History */}
            {selectedBill.payments?.length > 0 && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Riwayat Pembayaran</p>
                <div className="space-y-1">
                  {selectedBill.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between bg-[rgba(255,255,255,0.03)] rounded-lg px-3 py-2 text-sm">
                      <div>
                        <StatusBadge status={p.metode} variant="info" />
                        {p.referensi && <span className="text-xs text-slate-500 ml-2">{p.referensi}</span>}
                      </div>
                      <span className="text-emerald-400 font-medium">{formatRp(p.jumlah)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedBill.status === 'OPEN' && (
              <div className="flex justify-between pt-4 border-t border-white/[0.06]">
                <button onClick={() => handleVoid(selectedBill.id)}
                  className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition">
                  Batalkan Billing
                </button>
                <button onClick={() => { setPayForm({ jumlah: selectedBill.sisaBayar, metode: 'TUNAI', referensi: '' }); setShowPayment(true); }}
                  className="px-6 py-2 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg">
                  Bayar {formatRp(selectedBill.sisaBayar)}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Payment Modal */}
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Proses Pembayaran" size="sm">
        <div className="space-y-4">
          <div className="text-center p-4 bg-[rgba(255,255,255,0.03)] rounded-xl">
            <p className="text-sm text-slate-400">Sisa Tagihan</p>
            <p className="text-3xl font-bold text-white mt-1">{formatRp(selectedBill?.sisaBayar || 0)}</p>
          </div>

          <FormField label="Jumlah Bayar" required>
            <input type="number" value={payForm.jumlah}
              onChange={(e) => setPayForm({ ...payForm, jumlah: Number(e.target.value) })}
              className="w-full px-4 py-3 glass-input text-lg font-bold text-center" min={0} />
          </FormField>

          <FormField label="Metode Pembayaran" required>
            <div className="grid grid-cols-3 gap-2">
              {['TUNAI', 'DEBIT', 'KREDIT', 'TRANSFER', 'QRIS', 'EWALLET'].map((m) => (
                <button key={m} onClick={() => setPayForm({ ...payForm, metode: m })}
                  className={`py-2 text-xs rounded-xl transition ${
                    payForm.metode === m ? 'glass-btn' : 'glass-btn-outline'
                  }`}>{m}</button>
              ))}
            </div>
          </FormField>

          {payForm.metode !== 'TUNAI' && (
            <FormField label="No. Referensi">
              <input type="text" value={payForm.referensi}
                onChange={(e) => setPayForm({ ...payForm, referensi: e.target.value })}
                className="w-full px-4 py-2.5 glass-input text-sm" placeholder="No. transaksi / approval code" />
            </FormField>
          )}

          {payForm.jumlah > (selectedBill?.sisaBayar || 0) && (
            <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-sm text-emerald-400">Kembalian: <span className="font-bold">{formatRp(payForm.jumlah - (selectedBill?.sisaBayar || 0))}</span></p>
            </div>
          )}

          <button onClick={handlePay}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg text-sm">
            Proses Pembayaran
          </button>
        </div>
      </Modal>
    </div>
  );
}
