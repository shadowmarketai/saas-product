import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';
import type { Commission, Plan, Subscription } from '@/types';

interface CommissionSummary {
  total_earned: number;
  total_pending: number;
  total_paid: number;
}

interface MonthBucket {
  label: string;
  amount: number;
}

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}

function buildLast6Months(): string[] {
  const now = new Date();
  const result: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`);
  }
  return result;
}

export function RevenuePage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<CommissionSummary>({ total_earned: 0, total_pending: 0, total_paid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<Subscription[]>('/subscriptions/'),
      api.get<Plan[]>('/subscriptions/plans'),
      api.get<Commission[]>('/commissions/'),
      api.get<CommissionSummary>('/commissions/summary'),
    ]).then(([sRes, pRes, _cRes, csRes]) => {
      if (sRes.status === 'fulfilled') setSubscriptions(sRes.value.data);
      if (pRes.status === 'fulfilled') setPlans(pRes.value.data);
      if (csRes.status === 'fulfilled') setCommissionSummary(csRes.value.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Build plan lookup map
  const planMap = new Map(plans.map((p) => [p.id, p]));

  // MRR: sum of plan prices for active subscriptions
  const mrr = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (planMap.get(s.plan_id)?.price_amount ?? 0), 0);

  // Total Revenue: sum of all subscriptions
  const totalRevenue = subscriptions.reduce(
    (sum, s) => sum + (planMap.get(s.plan_id)?.price_amount ?? 0),
    0
  );

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;

  // Monthly revenue chart — last 6 months
  const monthLabels = buildLast6Months();
  const monthBuckets: Record<string, number> = {};
  monthLabels.forEach((lbl) => { monthBuckets[lbl] = 0; });
  subscriptions.forEach((s) => {
    const lbl = getMonthLabel(s.created_at);
    if (lbl in monthBuckets) {
      monthBuckets[lbl] += planMap.get(s.plan_id)?.price_amount ?? 0;
    }
  });
  const chartData: MonthBucket[] = monthLabels.map((lbl) => ({ label: lbl, amount: monthBuckets[lbl] }));
  const maxChartVal = Math.max(...chartData.map((d) => d.amount), 1);

  // Revenue by product type
  const productTypeMap: Record<string, number> = {};
  plans.forEach((p) => {
    productTypeMap[p.product_type] = (productTypeMap[p.product_type] ?? 0) + 1;
  });
  const totalPlanCount = Math.max(plans.length, 1);
  const productTypeEntries = Object.entries(productTypeMap).sort((a, b) => b[1] - a[1]);

  // Subscription table — latest 20
  const tableRows = [...subscriptions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold font-heading text-heading">Revenue Overview</h1>
        <p className="text-muted mt-1">Platform-wide subscription and commission data</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <StatCard label="Total MRR" value={`₹${mrr.toLocaleString()}`} icon="📈" />
        <StatCard label="All-Time Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon="💰" />
        <StatCard label="Active Subscriptions" value={activeCount} icon="✅" />
        <StatCard label="Pending Commissions" value={`₹${commissionSummary.total_pending.toLocaleString()}`} icon="⏳" />
      </div>

      {/* Monthly Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 bg-card rounded-2xl p-6 shadow-md border border-theme"
      >
        <h3 className="text-lg font-semibold text-heading mb-6">Monthly Revenue (Last 6 Months)</h3>
        <div className="flex items-end gap-4 h-48">
          {chartData.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-muted">₹{d.amount.toLocaleString()}</span>
              <div className="w-full rounded-t-lg bg-indigo-500/20 relative overflow-hidden" style={{ height: '120px' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.amount / maxChartVal) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg"
                />
              </div>
              <span className="text-[10px] text-muted text-center leading-tight">{d.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Revenue by Product Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-md border border-theme"
        >
          <h3 className="text-lg font-semibold text-heading mb-4">Plans by Product Type</h3>
          <div className="space-y-3">
            {productTypeEntries.map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-sm text-muted capitalize w-32">{type.replace(/_/g, ' ')}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                    style={{ width: `${(count / totalPlanCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-heading w-8 text-right">{Math.round((count / totalPlanCount) * 100)}%</span>
              </div>
            ))}
            {productTypeEntries.length === 0 && (
              <p className="text-sm text-muted text-center py-4">No plan data available</p>
            )}
          </div>
        </motion.div>

        {/* Quick Revenue Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl p-6 shadow-md border border-theme"
        >
          <h3 className="text-lg font-semibold text-heading mb-4">Commission Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Total Earned', value: commissionSummary.total_earned, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Total Pending', value: commissionSummary.total_pending, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Total Paid Out', value: commissionSummary.total_paid, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((item) => (
              <div key={item.label} className={`flex items-center justify-between p-4 rounded-xl ${item.bg}`}>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className={`text-lg font-bold ${item.color}`}>₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Subscription Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-card rounded-2xl shadow-md border border-theme overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-theme">
          <h3 className="text-lg font-semibold text-heading">Recent Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Customer ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tableRows.map((s) => {
                const plan = planMap.get(s.plan_id);
                return (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted">#{s.customer_id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-heading">{plan?.name ?? `Plan #${s.plan_id}`}</td>
                    <td className="px-6 py-4">
                      <Badge
                        label={s.status}
                        variant={s.status === 'active' ? 'success' : s.status === 'cancelled' ? 'danger' : s.status === 'pending' ? 'warning' : 'neutral'}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-heading">₹{(plan?.price_amount ?? 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-muted">{new Date(s.start_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-muted">{s.end_date ? new Date(s.end_date).toLocaleDateString() : '—'}</td>
                  </tr>
                );
              })}
              {tableRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">No subscriptions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
