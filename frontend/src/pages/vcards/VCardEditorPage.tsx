import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { vcardApi } from '@/services/vcardApi';
import { VCardRenderer, TEMPLATE_LIST } from '@/components/vcard/VCardRenderer';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { ColorPicker } from '@/components/ui/ColorPicker';
import type { VCardCreatePayload, VCardPublicData } from '@/types/vcard';

const EMPTY_CARD: VCardCreatePayload = {
  template_id: 'minimal-clean',
  name: '',
  title: null,
  company: null,
  profile_image_url: null,
  logo_url: null,
  phone: null,
  email: null,
  whatsapp: null,
  address: null,
  website: null,
  linkedin: null,
  instagram: null,
  github: null,
  twitter: null,
  youtube: null,
  custom_links: [],
  bio: null,
  services: [],
  gallery: [],
  video_url: null,
  testimonials: [],
  documents: [],
  custom_colors: {},
  custom_fonts: {},
};

type Section = 'identity' | 'contact' | 'links' | 'services' | 'template' | 'colors';

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: 'template', label: 'Template', icon: '🎨' },
  { key: 'colors', label: 'Colors', icon: '🎯' },
  { key: 'identity', label: 'Identity', icon: '👤' },
  { key: 'contact', label: 'Contact', icon: '📞' },
  { key: 'links', label: 'Social Links', icon: '🔗' },
  { key: 'services', label: 'Services', icon: '💼' },
];

const VCARD_COLOR_KEYS: { key: string; label: string }[] = [
  { key: 'primary', label: 'Primary Color' },
  { key: 'secondary', label: 'Secondary Color' },
  { key: 'accent', label: 'Accent Color' },
  { key: 'background', label: 'Background' },
  { key: 'cardBg', label: 'Card Background' },
  { key: 'nameColor', label: 'Name Text' },
  { key: 'titleColor', label: 'Title Text' },
  { key: 'textColor', label: 'Body Text' },
];

export function VCardEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form, setForm] = useState<VCardCreatePayload>(EMPTY_CARD);
  const [activeSection, setActiveSection] = useState<Section>('template');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      vcardApi.get(Number(id)).then((data) => {
        const payload: VCardCreatePayload = { ...data };
        setForm(payload);
      }).catch(() => navigate(-1)).finally(() => setLoading(false));
    }
  }, [id, navigate]);

  const set = useCallback(<K extends keyof VCardCreatePayload>(key: K, val: VCardCreatePayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const previewCard: VCardPublicData = {
    slug: 'preview',
    template_id: form.template_id,
    name: form.name || 'Your Name',
    title: form.title,
    company: form.company,
    profile_image_url: form.profile_image_url,
    logo_url: form.logo_url,
    phone: form.phone,
    email: form.email,
    whatsapp: form.whatsapp,
    address: form.address,
    website: form.website,
    linkedin: form.linkedin,
    instagram: form.instagram,
    github: form.github,
    twitter: form.twitter,
    youtube: form.youtube,
    custom_links: form.custom_links,
    bio: form.bio,
    services: form.services,
    gallery: form.gallery,
    video_url: form.video_url,
    testimonials: form.testimonials,
    documents: form.documents,
    custom_colors: form.custom_colors,
    custom_fonts: form.custom_fonts,
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (id) {
        await vcardApi.update(Number(id), form);
      } else {
        const created = await vcardApi.create(form);
        navigate(`../vcards/${created.id}/edit`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id) {
      const created = await vcardApi.create(form);
      await vcardApi.publish(created.id);
      navigate(`../vcards`, { replace: true });
    } else {
      await handleSave();
      await vcardApi.publish(Number(id));
      navigate(`../vcards`, { replace: true });
    }
  };

  const inputClass = cn(
    'w-full px-3 py-2.5 rounded-xl text-sm border transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
    isDark ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
  );

  const labelClass = 'block text-xs font-medium text-muted mb-1';

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={cn('flex items-center justify-between px-6 py-3 border-b shrink-0', isDark ? 'border-gray-800' : 'border-gray-200')}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted hover:text-heading transition-colors text-sm">← Back</button>
          <h1 className="text-lg font-bold text-heading">{id ? 'Edit VCard' : 'Create VCard'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg transition-colors', isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600')}>
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button data-testid="save-vcard-btn" onClick={handleSave} disabled={saving || !form.name.trim()} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handlePublish} disabled={!form.name.trim()} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:shadow-md disabled:opacity-50 transition-all">
            Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Section tabs (left rail) */}
        <div className={cn('w-48 shrink-0 border-r overflow-y-auto py-2', isDark ? 'border-gray-800' : 'border-gray-200')}>
          {SECTIONS.map((sec) => (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors text-left',
                activeSection === sec.key
                  ? isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                  : isDark ? 'text-gray-400 hover:bg-gray-800/60' : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              <span>{sec.icon}</span>
              <span>{sec.label}</span>
            </button>
          ))}
        </div>

        {/* Form area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>

              {activeSection === 'template' && (
                <div>
                  <h2 className="text-sm font-bold text-heading mb-4">Choose Template</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATE_LIST.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => set('template_id', t.id)}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          form.template_id === t.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                            : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <p className="text-sm font-semibold text-heading">{t.name}</p>
                        <p className="text-xs text-muted mt-0.5">{t.category}</p>
                        <p className="text-xs text-muted mt-1">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'colors' && (
                <div className="max-w-md">
                  <h2 className="text-sm font-bold text-heading mb-1">Customize Colors</h2>
                  <p className="text-xs text-muted mb-4">Override template colors. Leave blank for template default.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {VCARD_COLOR_KEYS.map(({ key, label }) => (
                      <ColorPicker
                        key={key}
                        label={label}
                        value={form.custom_colors[key] || ''}
                        isDark={isDark}
                        onChange={(color) => set('custom_colors', { ...form.custom_colors, [key]: color })}
                        onClear={() => {
                          const next = { ...form.custom_colors };
                          delete next[key];
                          set('custom_colors', next);
                        }}
                      />
                    ))}
                  </div>
                  {Object.keys(form.custom_colors).length > 0 && (
                    <button
                      onClick={() => set('custom_colors', {})}
                      className="text-xs text-red-500 hover:text-red-600 font-medium mt-4"
                    >
                      Reset all to template defaults
                    </button>
                  )}
                </div>
              )}

              {activeSection === 'identity' && (
                <div className="space-y-4 max-w-md">
                  <h2 className="text-sm font-bold text-heading mb-4">Identity</h2>
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input data-testid="vcard-name-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="John Doe" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input value={form.title || ''} onChange={(e) => set('title', e.target.value || null)} placeholder="CEO & Founder" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Company</label>
                    <input value={form.company || ''} onChange={(e) => set('company', e.target.value || null)} placeholder="Acme Inc." className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Profile Image URL</label>
                    <input value={form.profile_image_url || ''} onChange={(e) => set('profile_image_url', e.target.value || null)} placeholder="https://..." className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Logo URL</label>
                    <input value={form.logo_url || ''} onChange={(e) => set('logo_url', e.target.value || null)} placeholder="https://..." className={inputClass} />
                  </div>
                </div>
              )}

              {activeSection === 'contact' && (
                <div className="space-y-4 max-w-md">
                  <h2 className="text-sm font-bold text-heading mb-4">Contact Info</h2>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input value={form.phone || ''} onChange={(e) => set('phone', e.target.value || null)} placeholder="+91 98765 43210" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input value={form.email || ''} onChange={(e) => set('email', e.target.value || null)} placeholder="you@example.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>WhatsApp</label>
                    <input value={form.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value || null)} placeholder="+919876543210" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <textarea value={form.address || ''} onChange={(e) => set('address', e.target.value || null)} placeholder="123 Main St, City" className={`${inputClass} resize-none`} rows={2} />
                  </div>
                </div>
              )}

              {activeSection === 'links' && (
                <div className="space-y-4 max-w-md">
                  <h2 className="text-sm font-bold text-heading mb-4">Social Links</h2>
                  {(['website', 'linkedin', 'instagram', 'github', 'twitter', 'youtube'] as const).map((key) => (
                    <div key={key}>
                      <label className={labelClass}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                      <input value={(form[key] as string) || ''} onChange={(e) => set(key, e.target.value || null)} placeholder={`https://${key}.com/...`} className={inputClass} />
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'services' && (
                <div className="max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-heading">Services</h2>
                    <button onClick={() => set('services', [...form.services, { title: '', description: '', icon: '' }])} className="text-xs font-medium text-indigo-500 hover:text-indigo-600">+ Add</button>
                  </div>
                  <div className="space-y-3">
                    {form.services.map((s, i) => (
                      <div key={i} className={cn('p-4 rounded-xl border', isDark ? 'border-gray-700' : 'border-gray-200')}>
                        <div className="flex gap-2 mb-2">
                          <input value={s.icon || ''} onChange={(e) => { const arr = [...form.services]; arr[i] = { ...arr[i], icon: e.target.value }; set('services', arr); }} placeholder="Icon" className={`${inputClass} w-16`} />
                          <input value={s.title} onChange={(e) => { const arr = [...form.services]; arr[i] = { ...arr[i], title: e.target.value }; set('services', arr); }} placeholder="Service name" className={`${inputClass} flex-1`} />
                        </div>
                        <input value={s.description || ''} onChange={(e) => { const arr = [...form.services]; arr[i] = { ...arr[i], description: e.target.value }; set('services', arr); }} placeholder="Short description" className={inputClass} />
                        <button onClick={() => set('services', form.services.filter((_, j) => j !== i))} className="text-xs text-red-500 mt-2">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live preview panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn('shrink-0 border-l overflow-hidden', isDark ? 'border-gray-800' : 'border-gray-200')}
            >
              <div className="w-[400px] h-full overflow-y-auto">
                <div className="p-4">
                  <p className="text-xs text-muted text-center mb-3 font-medium">Live Preview</p>
                  <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                    <VCardRenderer card={previewCard} preview />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
