import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { minisiteApi } from '@/services/minisiteApi';
import { useToast } from '@/context/ToastContext';
import { SiteRenderer } from '@/components/minisite/SiteRenderer';
import { siteTemplateConfigs } from '@/components/minisite/siteTemplateConfigs';
import { getPresetForTemplate, PRESET_TEMPLATE_IDS } from '@/components/minisite/templatePresets';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { ColorPicker } from '@/components/ui/ColorPicker';
import type { MiniSiteCreatePayload, MiniSitePublicData } from '@/types/minisite';

const configMap = new Map(siteTemplateConfigs.map((c) => [c.id, c]));

const EMPTY_SITE: MiniSiteCreatePayload = {
  template_id: 'gradient-startup',
  site_name: '',
  tagline: null,
  logo_url: null,
  favicon_url: null,
  hero_title: null,
  hero_subtitle: null,
  hero_image_url: null,
  hero_cta_text: null,
  hero_cta_url: null,
  about_title: null,
  about_text: null,
  about_image_url: null,
  features: [],
  testimonials: [],
  gallery: [],
  cta_title: null,
  cta_subtitle: null,
  cta_button_text: null,
  cta_button_url: null,
  phone: null,
  email: null,
  address: null,
  whatsapp: null,
  website: null,
  linkedin: null,
  instagram: null,
  github: null,
  twitter: null,
  youtube: null,
  footer_text: null,
  custom_colors: {},
  custom_fonts: {},
};

type Section = 'template' | 'colors' | 'identity' | 'hero' | 'about' | 'features' | 'testimonials' | 'gallery' | 'cta' | 'contact' | 'social';

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: 'template', label: 'Template', icon: '🎨' },
  { key: 'colors', label: 'Colors', icon: '🎯' },
  { key: 'identity', label: 'Site Info', icon: '🏠' },
  { key: 'hero', label: 'Hero', icon: '⭐' },
  { key: 'about', label: 'About', icon: '📝' },
  { key: 'features', label: 'Features', icon: '💎' },
  { key: 'testimonials', label: 'Testimonials', icon: '💬' },
  { key: 'gallery', label: 'Gallery', icon: '🖼️' },
  { key: 'cta', label: 'Call to Action', icon: '🚀' },
  { key: 'contact', label: 'Contact', icon: '📞' },
  { key: 'social', label: 'Social Links', icon: '🔗' },
];

const SITE_COLOR_KEYS: { key: string; label: string; group: string }[] = [
  // Hero
  { key: 'heroBg', label: 'Hero Background', group: 'Hero' },
  { key: 'heroText', label: 'Hero Title', group: 'Hero' },
  { key: 'heroSubText', label: 'Hero Subtitle', group: 'Hero' },
  // Accent
  { key: 'accent', label: 'Accent Color', group: 'General' },
  { key: 'pageBg', label: 'Page Background', group: 'General' },
  { key: 'sectionTitle', label: 'Section Titles', group: 'General' },
  // About
  { key: 'aboutBg', label: 'About Background', group: 'About' },
  { key: 'aboutText', label: 'About Text', group: 'About' },
  // Features
  { key: 'featureBg', label: 'Feature Background', group: 'Features' },
  { key: 'featureCardBg', label: 'Feature Card Bg', group: 'Features' },
  { key: 'featureTitle', label: 'Feature Title', group: 'Features' },
  { key: 'featureText', label: 'Feature Text', group: 'Features' },
  // Testimonials
  { key: 'testimonialBg', label: 'Testimonials Background', group: 'Testimonials' },
  { key: 'testimonialText', label: 'Testimonial Text', group: 'Testimonials' },
  // CTA
  { key: 'ctaBg', label: 'CTA Background', group: 'CTA' },
  { key: 'ctaText', label: 'CTA Text', group: 'CTA' },
  // Footer
  { key: 'footerBg', label: 'Footer Background', group: 'Footer' },
  { key: 'footerText', label: 'Footer Text', group: 'Footer' },
];

export function MiniSiteEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isDark } = useTheme();
  const [form, setForm] = useState<MiniSiteCreatePayload>(EMPTY_SITE);
  const [activeSection, setActiveSection] = useState<Section>('template');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [templateList, setTemplateList] = useState<{id: string; name: string; category: string; description: string}[]>([]);

  useEffect(() => {
    import('@/components/minisite/siteTemplateConfigs').then((mod) => {
      setTemplateList(mod.siteTemplateConfigs.map((c) => ({ id: c.id, name: c.name, category: c.category, description: c.description })));
    });
  }, []);

  useEffect(() => {
    if (id) {
      minisiteApi.get(Number(id)).then((data) => {
        setForm({ ...data });
      }).catch(() => navigate(-1)).finally(() => setLoading(false));
    }
  }, [id, navigate]);

  const set = useCallback(<K extends keyof MiniSiteCreatePayload>(key: K, val: MiniSiteCreatePayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSave = async () => {
    if (!form.site_name.trim()) return;
    setSaving(true);
    try {
      if (id) {
        await minisiteApi.update(Number(id), form);
      } else {
        const created = await minisiteApi.create(form);
        navigate(`../websites/${created.id}/edit`, { replace: true });
      }
      toast.success('Website saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id) {
      const created = await minisiteApi.create(form);
      await minisiteApi.publish(created.id);
      navigate(`../websites`, { replace: true });
    } else {
      await handleSave();
      await minisiteApi.publish(Number(id));
      navigate(`../websites`, { replace: true });
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
          <h1 className="text-lg font-bold text-heading">{id ? 'Edit Website' : 'Create Website'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg transition-colors', showPreview ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600')}>
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button onClick={handleSave} disabled={saving || !form.site_name.trim()} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handlePublish} disabled={!form.site_name.trim()} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:shadow-md disabled:opacity-50 transition-all">
            Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Section tabs */}
        <div className={cn('w-48 shrink-0 border-r overflow-y-auto py-2', isDark ? 'border-gray-800' : 'border-gray-200')}>
          {SECTIONS.map((sec) => (
            <button key={sec.key} onClick={() => setActiveSection(sec.key)} className={cn('w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors text-left', activeSection === sec.key ? (isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-700') : (isDark ? 'text-gray-400 hover:bg-gray-800/60' : 'text-gray-500 hover:bg-gray-50'))}>
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
                  <h2 className="text-sm font-bold text-heading mb-2">Choose Template ({templateList.length} available)</h2>
                  <p className="text-xs text-muted mb-4">Templates with a ✦ badge come pre-designed with demo content — just edit and publish!</p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[calc(100vh-220px)] overflow-y-auto">
                    {templateList.map((t) => {
                      const hasPreset = PRESET_TEMPLATE_IDS.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            set('template_id', t.id);
                            if (hasPreset && !id) {
                              const preset = getPresetForTemplate(t.id);
                              setForm((prev) => ({ ...prev, template_id: t.id, ...preset }));
                            }
                          }}
                          className={cn('p-4 rounded-xl border-2 text-left transition-all relative', form.template_id === t.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300')}
                        >
                          {hasPreset && <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">✦ Pre-designed</span>}
                          <p className="text-sm font-semibold text-heading">{t.name}</p>
                          <p className="text-xs text-muted mt-0.5">{t.category}</p>
                          <p className="text-xs text-muted mt-1 line-clamp-2">{t.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeSection === 'colors' && (
                <div className="max-w-lg">
                  <h2 className="text-sm font-bold text-heading mb-1">Customize Colors</h2>
                  <p className="text-xs text-muted mb-4">Override template colors. Leave blank to use the template default.</p>
                  {Object.entries(
                    SITE_COLOR_KEYS.reduce<Record<string, typeof SITE_COLOR_KEYS>>((acc, item) => {
                      (acc[item.group] ??= []).push(item);
                      return acc;
                    }, {})
                  ).map(([group, keys]) => (
                    <div key={group} className="mb-5">
                      <p className={cn('text-xs font-semibold uppercase tracking-wider mb-2', isDark ? 'text-gray-500' : 'text-gray-400')}>{group}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {keys.map(({ key, label }) => (
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
                    </div>
                  ))}
                  {Object.keys(form.custom_colors).length > 0 && (
                    <button
                      onClick={() => set('custom_colors', {})}
                      className="text-xs text-red-500 hover:text-red-600 font-medium mt-2"
                    >
                      Reset all to template defaults
                    </button>
                  )}
                </div>
              )}

              {activeSection === 'identity' && (
                <div className="space-y-4 max-w-md">
                  <h2 className="text-sm font-bold text-heading mb-4">Site Info</h2>
                  <div><label className={labelClass}>Site Name *</label><input value={form.site_name} onChange={(e) => set('site_name', e.target.value)} placeholder="My Awesome Site" className={inputClass} /></div>
                  <div><label className={labelClass}>Tagline</label><input value={form.tagline || ''} onChange={(e) => set('tagline', e.target.value || null)} placeholder="Your catchy tagline" className={inputClass} /></div>
                  <div><label className={labelClass}>Logo URL</label><input value={form.logo_url || ''} onChange={(e) => set('logo_url', e.target.value || null)} placeholder="https://..." className={inputClass} /></div>
                </div>
              )}

              {activeSection === 'hero' && (
                <div className="space-y-4 max-w-md">
                  <h2 className="text-sm font-bold text-heading mb-4">Hero Section</h2>
                  <div><label className={labelClass}>Headline</label><input value={form.hero_title || ''} onChange={(e) => set('hero_title', e.target.value || null)} placeholder="Build Something Amazing" className={inputClass} /></div>
                  <div><label className={labelClass}>Subtitle</label><textarea value={form.hero_subtitle || ''} onChange={(e) => set('hero_subtitle', e.target.value || null)} placeholder="Describe what you do..." className={`${inputClass} resize-none`} rows={3} /></div>
                  <div><label className={labelClass}>Hero Image URL</label><input value={form.hero_image_url || ''} onChange={(e) => set('hero_image_url', e.target.value || null)} placeholder="https://..." className={inputClass} /></div>
                  <div><label className={labelClass}>CTA Button Text</label><input value={form.hero_cta_text || ''} onChange={(e) => set('hero_cta_text', e.target.value || null)} placeholder="Get Started" className={inputClass} /></div>
                  <div><label className={labelClass}>CTA Button URL</label><input value={form.hero_cta_url || ''} onChange={(e) => set('hero_cta_url', e.target.value || null)} placeholder="https://..." className={inputClass} /></div>
                </div>
              )}

              {activeSection === 'about' && (
                <div className="space-y-4 max-w-md">
                  <h2 className="text-sm font-bold text-heading mb-4">About Section</h2>
                  <div><label className={labelClass}>Title</label><input value={form.about_title || ''} onChange={(e) => set('about_title', e.target.value || null)} placeholder="About Us" className={inputClass} /></div>
                  <div><label className={labelClass}>Text</label><textarea value={form.about_text || ''} onChange={(e) => set('about_text', e.target.value || null)} placeholder="Tell your story..." className={`${inputClass} resize-none`} rows={5} /></div>
                  <div><label className={labelClass}>Image URL</label><input value={form.about_image_url || ''} onChange={(e) => set('about_image_url', e.target.value || null)} placeholder="https://..." className={inputClass} /></div>
                </div>
              )}

              {activeSection === 'features' && (
                <div className="max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-heading">Features</h2>
                    <button onClick={() => set('features', [...form.features, { title: '', description: '', icon: '' }])} className="text-xs font-medium text-indigo-500 hover:text-indigo-600">+ Add</button>
                  </div>
                  <div className="space-y-3">
                    {form.features.map((f, i) => (
                      <div key={i} className={cn('p-4 rounded-xl border', isDark ? 'border-gray-700' : 'border-gray-200')}>
                        <div className="flex gap-2 mb-2">
                          <input value={f.icon || ''} onChange={(e) => { const arr = [...form.features]; arr[i] = { ...arr[i], icon: e.target.value }; set('features', arr); }} placeholder="Icon" className={`${inputClass} w-16`} />
                          <input value={f.title} onChange={(e) => { const arr = [...form.features]; arr[i] = { ...arr[i], title: e.target.value }; set('features', arr); }} placeholder="Feature title" className={`${inputClass} flex-1`} />
                        </div>
                        <input value={f.description || ''} onChange={(e) => { const arr = [...form.features]; arr[i] = { ...arr[i], description: e.target.value }; set('features', arr); }} placeholder="Description" className={inputClass} />
                        <button onClick={() => set('features', form.features.filter((_, j) => j !== i))} className="text-xs text-red-500 mt-2">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'testimonials' && (
                <div className="max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-heading">Testimonials</h2>
                    <button onClick={() => set('testimonials', [...form.testimonials, { name: '', text: '', role: '' }])} className="text-xs font-medium text-indigo-500 hover:text-indigo-600">+ Add</button>
                  </div>
                  <div className="space-y-3">
                    {form.testimonials.map((t, i) => (
                      <div key={i} className={cn('p-4 rounded-xl border', isDark ? 'border-gray-700' : 'border-gray-200')}>
                        <input value={t.name} onChange={(e) => { const arr = [...form.testimonials]; arr[i] = { ...arr[i], name: e.target.value }; set('testimonials', arr); }} placeholder="Name" className={`${inputClass} mb-2`} />
                        <input value={t.role || ''} onChange={(e) => { const arr = [...form.testimonials]; arr[i] = { ...arr[i], role: e.target.value }; set('testimonials', arr); }} placeholder="Role" className={`${inputClass} mb-2`} />
                        <textarea value={t.text} onChange={(e) => { const arr = [...form.testimonials]; arr[i] = { ...arr[i], text: e.target.value }; set('testimonials', arr); }} placeholder="Testimonial" className={`${inputClass} resize-none`} rows={2} />
                        <button onClick={() => set('testimonials', form.testimonials.filter((_, j) => j !== i))} className="text-xs text-red-500 mt-2">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'gallery' && (
                <div className="max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-heading">Gallery</h2>
                    <button onClick={() => set('gallery', [...form.gallery, ''])} className="text-xs font-medium text-indigo-500 hover:text-indigo-600">+ Add Image</button>
                  </div>
                  <div className="space-y-2">
                    {form.gallery.map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={url} onChange={(e) => { const arr = [...form.gallery]; arr[i] = e.target.value; set('gallery', arr); }} placeholder="Image URL" className={`${inputClass} flex-1`} />
                        <button onClick={() => set('gallery', form.gallery.filter((_, j) => j !== i))} className="text-xs text-red-500 px-2">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'cta' && (
                <div className="space-y-4 max-w-md">
                  <h2 className="text-sm font-bold text-heading mb-4">Call to Action</h2>
                  <div><label className={labelClass}>Title</label><input value={form.cta_title || ''} onChange={(e) => set('cta_title', e.target.value || null)} placeholder="Ready to get started?" className={inputClass} /></div>
                  <div><label className={labelClass}>Subtitle</label><input value={form.cta_subtitle || ''} onChange={(e) => set('cta_subtitle', e.target.value || null)} placeholder="Join thousands of users" className={inputClass} /></div>
                  <div><label className={labelClass}>Button Text</label><input value={form.cta_button_text || ''} onChange={(e) => set('cta_button_text', e.target.value || null)} placeholder="Sign Up Now" className={inputClass} /></div>
                  <div><label className={labelClass}>Button URL</label><input value={form.cta_button_url || ''} onChange={(e) => set('cta_button_url', e.target.value || null)} placeholder="https://..." className={inputClass} /></div>
                </div>
              )}

              {activeSection === 'contact' && (
                <div className="space-y-4 max-w-md">
                  <h2 className="text-sm font-bold text-heading mb-4">Contact Info</h2>
                  <div><label className={labelClass}>Phone</label><input value={form.phone || ''} onChange={(e) => set('phone', e.target.value || null)} placeholder="+91 98765 43210" className={inputClass} /></div>
                  <div><label className={labelClass}>Email</label><input value={form.email || ''} onChange={(e) => set('email', e.target.value || null)} placeholder="hello@example.com" className={inputClass} /></div>
                  <div><label className={labelClass}>WhatsApp</label><input value={form.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value || null)} placeholder="+919876543210" className={inputClass} /></div>
                  <div><label className={labelClass}>Address</label><textarea value={form.address || ''} onChange={(e) => set('address', e.target.value || null)} placeholder="123 Main St, City" className={`${inputClass} resize-none`} rows={2} /></div>
                  <div><label className={labelClass}>Footer Text</label><input value={form.footer_text || ''} onChange={(e) => set('footer_text', e.target.value || null)} placeholder="© 2026 Your Company" className={inputClass} /></div>
                </div>
              )}

              {activeSection === 'social' && (
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

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live preview panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 480, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn('shrink-0 border-l overflow-hidden', isDark ? 'border-gray-800' : 'border-gray-200')}
            >
              <div className="w-[480px] h-full overflow-y-auto">
                <div className="p-3">
                  <p className="text-xs text-muted text-center mb-3 font-medium">Live Preview</p>
                  <div className="rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                    <SiteRenderer
                      site={{
                        slug: 'preview',
                        template_id: form.template_id,
                        site_name: form.site_name || 'Your Site Name',
                        tagline: form.tagline,
                        logo_url: form.logo_url,
                        favicon_url: form.favicon_url,
                        hero_title: form.hero_title,
                        hero_subtitle: form.hero_subtitle,
                        hero_image_url: form.hero_image_url,
                        hero_cta_text: form.hero_cta_text,
                        hero_cta_url: form.hero_cta_url,
                        about_title: form.about_title,
                        about_text: form.about_text,
                        about_image_url: form.about_image_url,
                        features: form.features,
                        testimonials: form.testimonials,
                        gallery: form.gallery,
                        cta_title: form.cta_title,
                        cta_subtitle: form.cta_subtitle,
                        cta_button_text: form.cta_button_text,
                        cta_button_url: form.cta_button_url,
                        phone: form.phone,
                        email: form.email,
                        address: form.address,
                        whatsapp: form.whatsapp,
                        website: form.website,
                        linkedin: form.linkedin,
                        instagram: form.instagram,
                        github: form.github,
                        twitter: form.twitter,
                        youtube: form.youtube,
                        footer_text: form.footer_text,
                        custom_colors: form.custom_colors,
                        custom_fonts: form.custom_fonts,
                      } as MiniSitePublicData}
                      config={configMap.get(form.template_id) || siteTemplateConfigs[0]}
                      preview
                    />
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
