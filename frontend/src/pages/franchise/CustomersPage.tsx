import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import api from '@/services/api';
import type { User } from '@/types';

interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}

export function FranchiseCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RegisterForm>({ email: '', password: '', full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomers = () => {
    api.get<User[]>('/users/', { params: { role: 'customer' } }).then((r) => setCustomers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/auth/register', { ...form, tenant_slug: undefined });
      setShowForm(false);
      setForm({ email: '', password: '', full_name: '', phone: '' });
      fetchCustomers();
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Failed to create customer');
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">My Customers</h1>
          <p className="text-gray-500 mt-1">{customers.length} customers</p>
        </div>
        <GradientButton onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Customer'}
        </GradientButton>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Register New Customer</h3>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="mt-4 flex justify-end">
            <GradientButton onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Customer'}
            </GradientButton>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.full_name || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.phone || '-'}</td>
                <td className="px-6 py-4"><Badge label={c.is_active ? 'Active' : 'Inactive'} variant={c.is_active ? 'success' : 'danger'} /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No customers yet. Add your first one!</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
