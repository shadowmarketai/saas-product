import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';
import type { Commission } from '@/types';

interface EarningsSummary {
  total_earned: number;
  total_pending: number;
  total_paid: number;
}

export function EarningsPage() {
  const [summary, setSummary] = useState<EarningsSummary>({ total_earned: 0, total_pending: 0, total_paid: 0 });
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<EarningsSummary>('/commissions/summary'),
      api.get<Commission[]>('/commissions/'),
    ]).then(([s, c]) => {
      setSummary(s.data);
      setCommissions(c.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold font-heading text-gray-900">Earnings & Commissions</h1>
        <p className="text-gray-500 mt-1">Track your revenue and payouts</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard label="Total Earned" value={`₹${summary.total_earned.toLocaleString()}`} icon="💰" />
        <StatCard label="Pending" value={`₹${summary.total_pending.toLocaleString()}`} icon="⏳" />
        <StatCard label="Paid Out" value={`₹${summary.total_paid.toLocaleString()}`} icon="✅" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Commission History</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {commissions.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">#{c.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{c.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.percentage}%</td>
                <td className="px-6 py-4">
                  <Badge label={c.status} variant={c.status === 'paid' ? 'success' : c.status === 'pending' ? 'warning' : 'info'} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {commissions.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No commissions yet. Start selling to earn!</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
