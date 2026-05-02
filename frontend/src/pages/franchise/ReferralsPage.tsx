import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';

export function ReferralsPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralUrl = `https://nexastack.io/register?ref=${user?.id ?? ''}`;

  useEffect(() => {
    api
      .get<User[]>('/users/', { params: { role: 'customer' } })
      .then((r) => setCustomers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — just show copied state briefly
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Join NexaStack via my referral link: ${referralUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const converted = customers.filter((c) => c.is_active).length;
  const pending = customers.filter((c) => !c.is_active).length;

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
        <h1 className="text-3xl font-bold font-heading text-heading">Referrals</h1>
        <p className="text-muted mt-1">Track and grow your customer network</p>
      </motion.div>

      {/* Referral Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-1">Your Referral Link</h3>
        <p className="text-indigo-200 text-sm mb-4">Share this link to earn commissions on every sign-up</p>
        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
          <span className="text-sm flex-1 truncate font-mono">{referralUrl}</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="px-4 py-1.5 bg-white text-indigo-700 rounded-lg text-sm font-semibold shrink-0 hover:bg-indigo-50 transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </motion.button>
        </div>

        {/* Social Share */}
        <div className="flex gap-3 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWhatsAppShare}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 rounded-xl text-sm font-medium transition-colors"
          >
            <span>💬</span> Share on WhatsApp
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
          >
            <span>🔗</span> Copy Link
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <StatCard label="Total Referrals" value={customers.length} icon="👥" />
        <StatCard label="Converted" value={converted} icon="✅" />
        <StatCard label="Pending" value={pending} icon="⏳" />
        <StatCard label="Total Bonus" value="₹0" icon="🎁" />
      </div>

      {/* Referral Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-card rounded-2xl shadow-md border border-theme overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-theme">
          <h3 className="text-lg font-semibold text-heading">Referred Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Date Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Bonus Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-heading">{c.full_name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-muted">{c.email}</td>
                  <td className="px-6 py-4 text-sm text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <Badge
                      label={c.is_active ? 'Active' : 'Pending'}
                      variant={c.is_active ? 'success' : 'warning'}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">₹0</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-muted text-sm">No referrals yet. Share your link to get started!</p>
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
