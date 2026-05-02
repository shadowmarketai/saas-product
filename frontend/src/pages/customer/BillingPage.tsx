import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import api from '@/services/api';
import type { Plan, Subscription } from '@/types';

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Plan[]>('/subscriptions/plans'),
      api.get<Subscription[]>('/subscriptions/'),
    ]).then(([p, s]) => {
      setPlans(p.data);
      setSubscriptions(s.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const handleSubscribe = async (plan: Plan) => {
    setError(null);
    try {
      const { data: order } = await api.post('/subscriptions/create-order', { plan_id: plan.id });

      if (order.mock) {
        await api.post('/subscriptions/verify-payment', {
          razorpay_order_id: order.order_id,
          razorpay_payment_id: 'mock_pay_' + Date.now(),
          razorpay_signature: 'mock_signature',
          plan_id: plan.id,
        });
        const subs = await api.get<Subscription[]>('/subscriptions/');
        setSubscriptions(subs.data);
        setSuccess(`Successfully subscribed to ${plan.name}!`);
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) { setError('Payment gateway unavailable'); return; }

      const rzp = new (window as any).Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'NexaStack',
        description: plan.name,
        order_id: order.order_id,
        handler: async (response: any) => {
          await api.post('/subscriptions/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan_id: plan.id,
          });
          const subs = await api.get<Subscription[]>('/subscriptions/');
          setSubscriptions(subs.data);
          setSuccess(`Successfully subscribed to ${plan.name}!`);
        },
        prefill: { name: '', email: '' },
        theme: { color: '#6366F1' },
      });
      rzp.open();
    } catch {
      setError('Failed to initiate payment. Please try again.');
    }
  };

  // Build a set of product_types with an active subscription
  const activeProductTypes = new Set(
    subscriptions
      .filter((s) => s.status === 'active')
      .map((s) => plans.find((p) => p.id === s.plan_id)?.product_type)
      .filter(Boolean)
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  const activeSub = subscriptions.find((s) => s.status === 'active');

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold font-heading text-gray-900">Billing & Plans</h1>
        <p className="text-gray-500 mt-1">Manage your subscriptions</p>
      </motion.div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
          ✓ {success}
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">✕</button>
        </motion.div>
      )}

      {activeSub && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold">Current Plan</h3>
          <p className="text-3xl font-bold mt-2">Active Subscription</p>
          <div className="flex gap-4 mt-3 text-sm opacity-90">
            <span>Started: {new Date(activeSub.start_date).toLocaleDateString()}</span>
            {activeSub.end_date && <span>Expires: {new Date(activeSub.end_date).toLocaleDateString()}</span>}
            <span>Auto-renew: {activeSub.auto_renew ? 'Yes' : 'No'}</span>
          </div>
        </motion.div>
      )}

      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Available Plans</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.slice(0, 6).map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{p.name}</h4>
                <Badge label={p.tier} variant={p.tier === 'enterprise' ? 'info' : p.tier === 'pro' ? 'warning' : 'neutral'} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">₹{p.price_amount}</p>
                <p className="text-xs text-gray-500">/{p.billing_cycle}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {Object.entries(p.features).map(([key, val]) => (
                <li key={key} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {key.replace(/_/g, ' ')}: {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                </li>
              ))}
            </ul>
            <GradientButton
              className="w-full mt-4"
              variant="accent"
              onClick={() => handleSubscribe(p)}
              disabled={activeProductTypes.has(p.product_type)}
            >
              {activeProductTypes.has(p.product_type) ? 'Active' : 'Choose Plan'}
            </GradientButton>
          </motion.div>
        ))}
      </div>

      {subscriptions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Subscription History</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auto-Renew</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">#{s.id}</td>
                  <td className="px-6 py-4"><Badge label={s.status} variant={s.status === 'active' ? 'success' : s.status === 'cancelled' ? 'danger' : 'neutral'} /></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.start_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.end_date ? new Date(s.end_date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.auto_renew ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
