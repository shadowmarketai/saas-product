import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import api from '@/services/api';
import type { Template, ProductType } from '@/types';

const PRODUCT_LABELS: Record<ProductType, string> = {
  vcard: 'vCard', website: 'Website', google_reviews: 'Reviews', qr_menu: 'QR Menu',
  social_poster: 'Poster', link_in_bio: 'Link Bio', whatsapp_chatbot: 'Chatbot',
};

interface CreateForm {
  name: string;
  product_type: ProductType;
  industry: string;
  description: string;
}

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateForm>({ name: '', product_type: 'vcard', industry: '', description: '' });

  const fetchTemplates = () => {
    api.get<Template[]>('/templates/').then((r) => setTemplates(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleCreate = async () => {
    await api.post('/templates/', null, { params: form });
    setShowForm(false);
    setForm({ name: '', product_type: 'vcard', industry: '', description: '' });
    fetchTemplates();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">Template Library</h1>
          <p className="text-gray-500 mt-1">{templates.length} templates</p>
        </div>
        <GradientButton onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Template'}
        </GradientButton>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Add New Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Template Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm" value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value as ProductType })}>
              {Object.entries(PRODUCT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <input className="px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="mt-4 flex justify-end">
            <GradientButton onClick={handleCreate}>Create Template</GradientButton>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {templates.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-full h-32 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-4xl mb-4">
              {t.product_type === 'vcard' ? '💼' : t.product_type === 'website' ? '🌐' : t.product_type === 'qr_menu' ? '🍽️' : t.product_type === 'link_in_bio' ? '🔗' : '📄'}
            </div>
            <h3 className="font-semibold text-gray-900">{t.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{t.description || 'No description'}</p>
            <div className="flex gap-2 mt-3">
              <Badge label={PRODUCT_LABELS[t.product_type]} variant="info" />
              {t.industry && <Badge label={t.industry} variant="neutral" />}
              {t.is_premium && <Badge label="Premium" variant="warning" />}
            </div>
          </motion.div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-3 py-12 text-center text-gray-400">No templates yet</div>
        )}
      </div>
    </div>
  );
}
