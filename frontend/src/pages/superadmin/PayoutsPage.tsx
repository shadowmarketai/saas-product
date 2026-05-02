import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import api from '@/services/api';
import type { Commission } from '@/types';

interface CommissionSummary {
  total_earned: number;
  total_pending: number;
  total_paid: number;
}

type FilterTab = 'all' | 'pending' | 'processing' | 'paid';

export function PayoutsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary>({ total_earned: 0, total_pending: 0, total_paid: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [markingPaid, setMarkingPaid] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([
      api.get<Commission[]>('/commissions/'),
      api.get<CommissionSummary>('/commissions/summary'),
    ]).then(([cRes, sRes]) => {
      if (cRes.status === 'fulfilled') setCommissions(cRes.value.data);
      if (sRes.status === 'fulfilled') setSummary(sRes.value.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleMarkPaid = async (id: number) => {
    setMarkingPaid(id);
    setError(null);
    try {
      await api.patch(`/commissions/${id}`, { status: 'paid' });
      setCommissions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'paid' as const } : c))
      );
    } catch {
      setError(`Failed to mark commission #${id} as paid`);
    } finally {
      setMarkingPaid(null);
    }
  };

  const filtered = activeTab === 'all' ? commissions : commissions.filter((c) => c.status === activeTab);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'paid', label: 'Paid' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold font-heading text-heading">Commission Payouts</h1>
        <p className="text-muted mt-1">Manage franchise commissions and payouts</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard label="Total Earned" value={`₹${summary.total_earned.toLocaleString()}`} icon="💰" />
        <StatCard label="Pending" value={`₹${summary.total_pending.toLocaleString()}`} icon="⏳" />
        <StatCard label="Paid Out" value={`₹${summary.total_paid.toLocaleString()}`} icon="✅" />
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between"
        >
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">✕</button>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 bg-card rounded-2xl shadow-md border border-theme overflow-hidden"
      >
        {/* Filter Tabs */}
        <div className="px-6 py-4 border-b border-theme flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs">
                ({tab.key === 'all' ? commissions.length : commissions.filter((c) => c.status === tab.key).length})
              </span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Amount (₹)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Payout Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted">#{c.id}</td>
                  <td className="px-6 py-4 text-sm text-heading font-medium">Tenant #{c.tenant_id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-heading">₹{c.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-muted">{c.percentage}%</td>
                  <td className="px-6 py-4">
                    <Badge
                      label={c.status}
                      variant={c.status === 'paid' ? 'success' : c.status === 'pending' ? 'warning' : 'info'}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {c.payout_date ? new Date(c.payout_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {c.status === 'pending' ? (
                      <GradientButton
                        variant="accent"
                        className="!px-3 !py-1.5 !text-xs !rounded-lg"
                        onClick={() => handleMarkPaid(c.id)}
                        disabled={markingPaid === c.id}
                      >
                        {markingPaid === c.id ? 'Saving…' : 'Mark Paid'}
                      </GradientButton>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-muted text-sm">No {activeTab === 'all' ? '' : activeTab} commissions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
