import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import api from '@/services/api';
import type { Tenant } from '@/types';

interface CreateForm {
  name: string;
  slug: string;
  owner_email: string;
  owner_name: string;
  owner_password: string;
  tier: 'silver' | 'gold' | 'platinum';
}

export function FranchisesPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateForm>({
    name: '', slug: '', owner_email: '', owner_name: '', owner_password: '', tier: 'silver',
  });
  const [saving, setSaving] = useState(false);

  const fetchTenants = () => {
    api.get<Tenant[]>('/tenants/').then((r) => setTenants(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/tenants/', form);
      setShowForm(false);
      setForm({ name: '', slug: '', owner_email: '', owner_name: '', owner_password: '', tier: 'silver' });
      fetchTenants();
    } catch { /* error handled by interceptor */ }
    setSaving(false);
  };

  const toggleStatus = async (tenant: Tenant) => {
    const action = tenant.is_active ? 'deactivate' : 'activate';
    await api.patch(`/tenants/${tenant.id}/${action}`);
    fetchTenants();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">Franchise Management</h1>
          <p className="text-gray-500 mt-1">{tenants.length} franchise partners</p>
        </div>
        <GradientButton onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Franchise'}
        </GradientButton>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Create New Franchise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Franchise Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} />
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Owner Name" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} />
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Owner Email" value={form.owner_email} onChange={(e) => setForm({ ...form, owner_email: e.target.value })} />
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Owner Password" type="password" value={form.owner_password} onChange={(e) => setForm({ ...form, owner_password: e.target.value })} />
            <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value as CreateForm['tier'] })}>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
          <div className="mt-4 flex justify-end">
            <GradientButton onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Franchise'}
            </GradientButton>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{t.slug}</td>
                <td className="px-6 py-4"><Badge label={t.tier} variant={t.tier === 'platinum' ? 'info' : t.tier === 'gold' ? 'warning' : 'neutral'} /></td>
                <td className="px-6 py-4"><Badge label={t.is_active ? 'Active' : 'Inactive'} variant={t.is_active ? 'success' : 'danger'} /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(t)} className={`text-sm font-medium ${t.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}>
                    {t.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No franchises yet</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
