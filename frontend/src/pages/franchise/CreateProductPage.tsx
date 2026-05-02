import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GradientButton } from '@/components/ui/GradientButton';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import type { Theme } from '@/components/ui/ThemeSelector';
import { VCardRenderer } from '@/components/renderers/VCardRenderer';
import { QRMenuRenderer } from '@/components/renderers/QRMenuRenderer';
import type { MenuCategory, MenuItem } from '@/components/renderers/QRMenuRenderer';
import { LinkBioRenderer } from '@/components/renderers/LinkBioRenderer';
import type { BioLink } from '@/components/renderers/LinkBioRenderer';
import { WebsiteRenderer } from '@/components/renderers/WebsiteRenderer';
import { GoogleReviewsRenderer } from '@/components/renderers/GoogleReviewsRenderer';
import { SocialPosterRenderer } from '@/components/renderers/SocialPosterRenderer';
import { WhatsAppChatbotRenderer } from '@/components/renderers/WhatsAppChatbotRenderer';
import { ProductIcon3D } from '@/components/three/ProductIcon3D';
import { DeviceFrame3D } from '@/components/three/DeviceFrame3D';
import { CardDesignSelector } from '@/components/ui/CardDesignSelector';
import api from '@/services/api';
import type { User, Template, ProductType } from '@/types';

const PRODUCT_TYPES: { type: ProductType; label: string; icon: string; desc: string }[] = [
  { type: 'vcard', label: 'Digital vCard', icon: '💼', desc: 'NFC-ready digital business card with QR code' },
  { type: 'website', label: 'Website Builder', icon: '🌐', desc: 'AI-powered single page website with SEO' },
  { type: 'google_reviews', label: 'Google Reviews', icon: '⭐', desc: 'Smart QR review collection system' },
  { type: 'qr_menu', label: 'QR Menu', icon: '🍽️', desc: 'Digital restaurant menu with categories' },
  { type: 'social_poster', label: 'Social Poster', icon: '🎨', desc: 'AI poster & caption generator' },
  { type: 'link_in_bio', label: 'Link-in-Bio', icon: '🔗', desc: 'Smart link page like Linktree' },
  { type: 'whatsapp_chatbot', label: 'WhatsApp Bot', icon: '💬', desc: 'Automated chatbot builder' },
];

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter (Modern)' },
  { value: 'Poppins, sans-serif', label: 'Poppins (Friendly)' },
  { value: 'Playfair Display, serif', label: 'Playfair (Elegant)' },
  { value: 'Roboto, sans-serif', label: 'Roboto (Clean)' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat (Bold)' },
];

export function CreateProductPage() {
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedType, setSelectedType] = useState<ProductType>('vcard');
  const [customers, setCustomers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [customerId, setCustomerId] = useState<number>(0);
  const [productName, setProductName] = useState('');
  const [templateId, setTemplateId] = useState<number | undefined>();
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    api.get<User[]>('/users/').then((r) => setCustomers(r.data.filter((u) => u.role === 'customer')));
  }, []);

  useEffect(() => {
    if (step === 'form') {
      api.get<Template[]>('/templates/', { params: { product_type: selectedType } }).then((r) => setTemplates(r.data));
      setConfig(getDefaultConfig(selectedType));
    }
  }, [step, selectedType]);

  const updateConfig = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const applyTheme = (theme: Theme) => {
    setConfig((prev) => ({
      ...prev,
      theme_id: theme.id,
      theme_primary: theme.primary,
      theme_secondary: theme.secondary,
      theme_accent: theme.accent,
      theme_bg: theme.bg,
      theme_text: theme.text,
    }));
  };

  const handleSubmit = async () => {
    if (!customerId || !productName) { setError('Please select a customer and enter a product name'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/products/', {
        product_type: selectedType,
        name: productName,
        customer_id: customerId,
        template_id: templateId || null,
        config_data: config,
      });
      setCreatedSlug(res.data.slug);
      // Auto-publish
      await api.patch(`/products/${res.data.id}/publish`);
      setSuccess(true);
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Failed to create product');
    }
    setSaving(false);
  };

  if (success) {
    const publicUrl = `${window.location.origin}/p/${createdSlug}`;
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">✅</motion.div>
        <h2 className="text-2xl font-bold text-gray-900">Product Created & Published!</h2>
        <p className="text-gray-500 mt-2">Your product is live and ready to share.</p>
        <div className="mt-4 bg-gray-50 px-6 py-3 rounded-xl flex items-center gap-3">
          <code className="text-sm text-primary-700">{publicUrl}</code>
          <button onClick={() => navigator.clipboard.writeText(publicUrl)} className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-lg hover:bg-primary-200">Copy</button>
        </div>
        <div className="flex gap-3 mt-6">
          <a href={`/p/${createdSlug}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">View Product</a>
          <GradientButton variant="accent" onClick={() => { setSuccess(false); setStep('select'); setProductName(''); setCreatedSlug(''); }}>
            Create Another
          </GradientButton>
        </div>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold font-heading text-gray-900">Create Product</h1>
          <p className="text-gray-500 mt-1">Choose a product type to get started</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {PRODUCT_TYPES.map((pt, i) => (
            <motion.button key={pt.type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => { setSelectedType(pt.type); setStep('form'); }}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all text-left group"
            >
              <div className="mb-4">
                <ProductIcon3D productType={pt.type} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{pt.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{pt.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('select')} className="text-gray-400 hover:text-gray-600 text-2xl">&larr;</button>
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">
              {PRODUCT_TYPES.find((p) => p.type === selectedType)?.icon} Create {PRODUCT_TYPES.find((p) => p.type === selectedType)?.label}
            </h1>
          </div>
        </div>
        <button onClick={() => setShowPreview(!showPreview)} className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50">
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </motion.div>

      {error && <p className="mt-4 text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

      <div className={`mt-6 ${showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" value={customerId} onChange={(e) => setCustomerId(Number(e.target.value))}>
                <option value={0}>Select a customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="e.g. Dr. Smith's Card" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
          </div>

          {/* Template Selection */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Choose a Template ({templates.length} available)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                <button
                  onClick={() => { setTemplateId(undefined); setConfig(getDefaultConfig(selectedType)); }}
                  className={`p-4 rounded-xl text-left border-2 transition-all ${!templateId ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Blank — Start Fresh</p>
                      <p className="text-xs text-gray-400">Build from scratch</p>
                    </div>
                  </div>
                </button>
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTemplateId(t.id);
                      setConfig((prev) => ({ ...prev, ...t.config_json }));
                    }}
                    className={`p-4 rounded-xl text-left border-2 transition-all ${templateId === t.id ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl mt-0.5">{PRODUCT_TYPES.find((p) => p.type === selectedType)?.icon || '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{t.description || t.industry}</p>
                        <div className="flex gap-1.5 mt-2">
                          {t.industry && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-medium text-gray-500">{t.industry}</span>}
                          {t.style && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-medium text-gray-500">{t.style}</span>}
                          {t.is_premium && <span className="px-1.5 py-0.5 bg-amber-50 rounded text-[9px] font-bold text-amber-600">Premium</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Theme Selection */}
          <ThemeSelector selected={(config.theme_id as string) || ''} onSelect={applyTheme} />

          {/* Custom Colors */}
          <details className="group">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">Advanced: Custom Colors & Font</summary>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ColorPicker label="Primary" value={(config.theme_primary as string) || '#003049'} onChange={(c) => updateConfig('theme_primary', c)} />
              <ColorPicker label="Secondary" value={(config.theme_secondary as string) || '#669BBC'} onChange={(c) => updateConfig('theme_secondary', c)} />
              <ColorPicker label="Background" value={(config.theme_bg as string) || '#FFFFFF'} onChange={(c) => updateConfig('theme_bg', c)} />
              <ColorPicker label="Text" value={(config.theme_text as string) || '#1A1A2E'} onChange={(c) => updateConfig('theme_text', c)} />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Font</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" value={(config.font_family as string) || 'Inter, sans-serif'} onChange={(e) => updateConfig('font_family', e.target.value)}>
                  {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>
          </details>

          <hr className="border-gray-100" />

          {/* Product-Specific Forms */}
          {selectedType === 'vcard' && <VCardForm config={config} updateConfig={updateConfig} />}
          {selectedType === 'website' && <WebsiteForm config={config} updateConfig={updateConfig} />}
          {selectedType === 'qr_menu' && <QRMenuForm config={config} updateConfig={updateConfig} />}
          {selectedType === 'link_in_bio' && <LinkBioForm config={config} updateConfig={updateConfig} />}
          {selectedType === 'google_reviews' && <ReviewsForm config={config} updateConfig={updateConfig} />}
          {selectedType === 'social_poster' && <PosterForm config={config} updateConfig={updateConfig} />}
          {selectedType === 'whatsapp_chatbot' && <ChatbotForm config={config} updateConfig={updateConfig} />}

          <div className="flex justify-end pt-4 sticky bottom-0 bg-white pb-2">
            <GradientButton onClick={handleSubmit} disabled={saving} className="px-8">
              {saving ? 'Creating...' : 'Create & Publish'}
            </GradientButton>
          </div>
        </motion.div>

        {/* Live Preview */}
        {showPreview && (
          <div className="bg-gray-100 rounded-2xl p-4 overflow-y-auto max-h-[80vh]">
            <div className="text-center text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">Live Preview</div>
            {selectedType === 'vcard' && (
              <DeviceFrame3D type="phone"><VCardRenderer data={config} preview /></DeviceFrame3D>
            )}
            {selectedType === 'qr_menu' && (
              <DeviceFrame3D type="phone"><QRMenuRenderer data={config} preview /></DeviceFrame3D>
            )}
            {selectedType === 'link_in_bio' && (
              <DeviceFrame3D type="phone"><LinkBioRenderer data={config} preview /></DeviceFrame3D>
            )}
            {selectedType === 'website' && (
              <DeviceFrame3D type="laptop"><WebsiteRenderer data={config} preview /></DeviceFrame3D>
            )}
            {selectedType === 'google_reviews' && (
              <DeviceFrame3D type="phone"><GoogleReviewsRenderer data={config} preview /></DeviceFrame3D>
            )}
            {selectedType === 'social_poster' && (
              <DeviceFrame3D type="laptop"><SocialPosterRenderer data={config} preview /></DeviceFrame3D>
            )}
            {selectedType === 'whatsapp_chatbot' && (
              <DeviceFrame3D type="phone"><WhatsAppChatbotRenderer data={config} preview /></DeviceFrame3D>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getDefaultConfig(type: ProductType): Record<string, unknown> {
  const base = { theme_primary: '#003049', theme_secondary: '#669BBC', theme_accent: '#FDF0D5', theme_bg: '#FFFFFF', theme_text: '#1A1A2E', font_family: 'Inter, sans-serif', theme_id: 'professional' };
  switch (type) {
    case 'vcard': return { ...base, full_name: '', designation: '', company: '', phone: '', whatsapp: '', email: '', website: '', address: '', google_maps: '', facebook: '', instagram: '', linkedin: '', youtube: '', profile_photo: '', logo_url: '', services: [], business_hours: '' };
    case 'qr_menu': return { ...base, theme_primary: '#D62828', theme_bg: '#FFF8F0', restaurant_name: '', tagline: '', logo_url: '', banner_url: '', categories: [], currency: '₹', show_images: true, layout: 'list' };
    case 'link_in_bio': return { ...base, theme_primary: '#7209B7', theme_secondary: '#560BAD', theme_bg: '#F3E5F5', display_name: '', bio: '', profile_photo: '', links: [], layout: 'rounded', social_facebook: '', social_instagram: '', social_youtube: '', social_linkedin: '', social_twitter: '' };
    case 'website': return { ...base, theme_primary: '#0077B6', theme_secondary: '#00B4D8', business_name: '', tagline: '', about: '', phone: '', whatsapp: '', email: '', address: '', services: [], gallery: [], testimonials: [], faq: [], cta_text: 'Contact Us', cta_link: '#contact' };
    case 'google_reviews': return { ...base, theme_primary: '#4285F4', theme_secondary: '#34A853', business_name: '', tagline: "We'd love your feedback!", google_review_url: '', min_stars_for_google: 4, rating_average: 0, rating_count: 0, sample_reviews: [], thank_you_message: 'Thank you for your feedback!', feedback_prompt: 'How was your experience?', logo_url: '' };
    case 'social_poster': return { ...base, theme_primary: '#E91E63', theme_secondary: '#9C27B0', business_name: '', logo_url: '', posters: [], categories: ['Festival', 'Offer', 'Product', 'Event', 'Custom'], upcoming_events: [], total_shared: 0, total_downloads: 0 };
    case 'whatsapp_chatbot': return { ...base, theme_primary: '#075E54', business_name: '', whatsapp_number: '', logo_url: '', welcome_message: 'Hello! 👋 How can we help you today?', menu_options: [], auto_replies: [], business_hours: '', away_message: '', features: ['Auto-Reply', 'Smart Menu', 'Lead Collection'] };
    default: return base;
  }
}

// ===== PRODUCT-SPECIFIC FORMS =====

interface FormProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all" type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-200 resize-none" rows={rows} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function VCardForm({ config, updateConfig }: FormProps) {
  return (
    <>
      <CardDesignSelector
        selected={(config.card_design as string) || 'classic-white'}
        onSelect={(d) => updateConfig('card_design', d.id)}
      />
      <hr className="border-gray-100" />
      <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Full Name" value={(config.full_name as string) || ''} onChange={(v) => updateConfig('full_name', v)} placeholder="Dr. Rajesh Kumar" />
        <InputField label="Designation" value={(config.designation as string) || ''} onChange={(v) => updateConfig('designation', v)} placeholder="Senior Consultant" />
        <InputField label="Company" value={(config.company as string) || ''} onChange={(v) => updateConfig('company', v)} placeholder="Apollo Hospital" />
        <InputField label="Phone" value={(config.phone as string) || ''} onChange={(v) => updateConfig('phone', v)} placeholder="+91 98765 43210" />
        <InputField label="WhatsApp" value={(config.whatsapp as string) || ''} onChange={(v) => updateConfig('whatsapp', v)} placeholder="+91 98765 43210" />
        <InputField label="Email" value={(config.email as string) || ''} onChange={(v) => updateConfig('email', v)} placeholder="doctor@example.com" type="email" />
        <InputField label="Website" value={(config.website as string) || ''} onChange={(v) => updateConfig('website', v)} placeholder="https://drrajesh.com" />
        <InputField label="Profile Photo URL" value={(config.profile_photo as string) || ''} onChange={(v) => updateConfig('profile_photo', v)} placeholder="https://..." />
        <InputField label="Logo URL" value={(config.logo_url as string) || ''} onChange={(v) => updateConfig('logo_url', v)} placeholder="https://..." />
        <InputField label="Business Hours" value={(config.business_hours as string) || ''} onChange={(v) => updateConfig('business_hours', v)} placeholder="Mon-Sat 9AM-6PM" />
      </div>
      <InputField label="Address" value={(config.address as string) || ''} onChange={(v) => updateConfig('address', v)} placeholder="123 Main Road, Chennai" />
      <InputField label="Google Maps Link" value={(config.google_maps as string) || ''} onChange={(v) => updateConfig('google_maps', v)} placeholder="https://maps.google.com/..." />
      <h3 className="text-lg font-semibold text-gray-900 mt-4">Social Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Facebook" value={(config.facebook as string) || ''} onChange={(v) => updateConfig('facebook', v)} placeholder="https://facebook.com/..." />
        <InputField label="Instagram" value={(config.instagram as string) || ''} onChange={(v) => updateConfig('instagram', v)} placeholder="https://instagram.com/..." />
        <InputField label="LinkedIn" value={(config.linkedin as string) || ''} onChange={(v) => updateConfig('linkedin', v)} placeholder="https://linkedin.com/in/..." />
        <InputField label="YouTube" value={(config.youtube as string) || ''} onChange={(v) => updateConfig('youtube', v)} placeholder="https://youtube.com/..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Services (comma separated)</label>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Consultation, Surgery, Therapy"
          value={Array.isArray(config.services) ? (config.services as string[]).join(', ') : ''}
          onChange={(e) => updateConfig('services', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        />
      </div>
    </>
  );
}

function WebsiteForm({ config, updateConfig }: FormProps) {
  const services = (config.services as { name: string; description: string; icon?: string }[]) || [];
  const testimonials = (config.testimonials as { name: string; text: string; rating: number }[]) || [];

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Business Name" value={(config.business_name as string) || ''} onChange={(v) => updateConfig('business_name', v)} placeholder="Raj's Salon & Spa" />
        <InputField label="Tagline" value={(config.tagline as string) || ''} onChange={(v) => updateConfig('tagline', v)} placeholder="Beauty Redefined" />
        <InputField label="Phone" value={(config.phone as string) || ''} onChange={(v) => updateConfig('phone', v)} />
        <InputField label="WhatsApp" value={(config.whatsapp as string) || ''} onChange={(v) => updateConfig('whatsapp', v)} />
        <InputField label="Email" value={(config.email as string) || ''} onChange={(v) => updateConfig('email', v)} type="email" />
        <InputField label="Logo URL" value={(config.logo_url as string) || ''} onChange={(v) => updateConfig('logo_url', v)} />
      </div>
      <TextArea label="About Us" value={(config.about as string) || ''} onChange={(v) => updateConfig('about', v)} placeholder="Tell your story..." rows={4} />
      <InputField label="Address" value={(config.address as string) || ''} onChange={(v) => updateConfig('address', v)} />
      <InputField label="Hero Image URL" value={(config.hero_image as string) || ''} onChange={(v) => updateConfig('hero_image', v)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="CTA Button Text" value={(config.cta_text as string) || 'Contact Us'} onChange={(v) => updateConfig('cta_text', v)} />
        <InputField label="CTA Link" value={(config.cta_link as string) || '#contact'} onChange={(v) => updateConfig('cta_link', v)} />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-4">Services</h3>
      {services.map((s, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <input className="px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Icon (emoji)" value={s.icon || ''} onChange={(e) => { const arr = [...services]; arr[i] = { ...s, icon: e.target.value }; updateConfig('services', arr); }} />
            <input className="px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Name" value={s.name} onChange={(e) => { const arr = [...services]; arr[i] = { ...s, name: e.target.value }; updateConfig('services', arr); }} />
            <input className="px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Description" value={s.description} onChange={(e) => { const arr = [...services]; arr[i] = { ...s, description: e.target.value }; updateConfig('services', arr); }} />
          </div>
          <button onClick={() => updateConfig('services', services.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 mt-2">✕</button>
        </div>
      ))}
      <button onClick={() => updateConfig('services', [...services, { name: '', description: '', icon: '✨' }])} className="text-sm text-primary-600 font-medium hover:text-primary-800">+ Add Service</button>

      <h3 className="text-lg font-semibold text-gray-900 mt-4">Testimonials</h3>
      {testimonials.map((t, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <input className="px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Name" value={t.name} onChange={(e) => { const arr = [...testimonials]; arr[i] = { ...t, name: e.target.value }; updateConfig('testimonials', arr); }} />
            <input className="px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Review text" value={t.text} onChange={(e) => { const arr = [...testimonials]; arr[i] = { ...t, text: e.target.value }; updateConfig('testimonials', arr); }} />
            <select className="px-3 py-2 border border-gray-200 rounded-xl text-sm" value={t.rating} onChange={(e) => { const arr = [...testimonials]; arr[i] = { ...t, rating: Number(e.target.value) }; updateConfig('testimonials', arr); }}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
            </select>
          </div>
          <button onClick={() => updateConfig('testimonials', testimonials.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 mt-2">✕</button>
        </div>
      ))}
      <button onClick={() => updateConfig('testimonials', [...testimonials, { name: '', text: '', rating: 5 }])} className="text-sm text-primary-600 font-medium">+ Add Testimonial</button>
    </>
  );
}

function QRMenuForm({ config, updateConfig }: FormProps) {
  const categories = (config.categories as MenuCategory[]) || [];

  const addCategory = () => {
    updateConfig('categories', [...categories, { id: Date.now().toString(), name: '', items: [] }]);
  };

  const updateCategory = (idx: number, name: string) => {
    const arr = [...categories];
    arr[idx] = { ...arr[idx], name };
    updateConfig('categories', arr);
  };

  const removeCategory = (idx: number) => {
    updateConfig('categories', categories.filter((_, i) => i !== idx));
  };

  const addItem = (catIdx: number) => {
    const arr = [...categories];
    arr[catIdx] = {
      ...arr[catIdx],
      items: [...arr[catIdx].items, { id: Date.now().toString(), name: '', description: '', price: 0, is_veg: true, is_bestseller: false, is_spicy: false, is_available: true }],
    };
    updateConfig('categories', arr);
  };

  const updateItem = (catIdx: number, itemIdx: number, updates: Partial<MenuItem>) => {
    const arr = [...categories];
    arr[catIdx] = {
      ...arr[catIdx],
      items: arr[catIdx].items.map((item, i) => i === itemIdx ? { ...item, ...updates } : item),
    };
    updateConfig('categories', arr);
  };

  const removeItem = (catIdx: number, itemIdx: number) => {
    const arr = [...categories];
    arr[catIdx] = { ...arr[catIdx], items: arr[catIdx].items.filter((_, i) => i !== itemIdx) };
    updateConfig('categories', arr);
  };

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900">Restaurant Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Restaurant Name" value={(config.restaurant_name as string) || ''} onChange={(v) => updateConfig('restaurant_name', v)} placeholder="Anand Bhavan" />
        <InputField label="Tagline" value={(config.tagline as string) || ''} onChange={(v) => updateConfig('tagline', v)} placeholder="Pure Veg Since 1985" />
        <InputField label="Logo URL" value={(config.logo_url as string) || ''} onChange={(v) => updateConfig('logo_url', v)} />
        <InputField label="Banner Image URL" value={(config.banner_url as string) || ''} onChange={(v) => updateConfig('banner_url', v)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" value={(config.currency as string) || '₹'} onChange={(e) => updateConfig('currency', e.target.value)}>
            <option value="₹">₹ (INR)</option><option value="$">$ (USD)</option><option value="€">€ (EUR)</option><option value="£">£ (GBP)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" value={(config.layout as string) || 'list'} onChange={(e) => updateConfig('layout', e.target.value)}>
            <option value="list">List View</option><option value="grid">Grid View</option>
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={(config.show_images as boolean) ?? true} onChange={(e) => updateConfig('show_images', e.target.checked)} className="rounded" />
        Show item images
      </label>

      <h3 className="text-lg font-semibold text-gray-900 mt-4">Menu Categories & Items</h3>
      {categories.map((cat, catIdx) => (
        <div key={cat.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium" placeholder="Category name (e.g. Starters)" value={cat.name} onChange={(e) => updateCategory(catIdx, e.target.value)} />
            <button onClick={() => removeCategory(catIdx)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
          </div>
          {cat.items.map((item, itemIdx) => (
            <div key={item.id} className="ml-4 p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Item name" value={item.name} onChange={(e) => updateItem(catIdx, itemIdx, { name: e.target.value })} />
                <input className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Price" type="number" value={item.price || ''} onChange={(e) => updateItem(catIdx, itemIdx, { price: Number(e.target.value) })} />
              </div>
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Description (optional)" value={item.description || ''} onChange={(e) => updateItem(catIdx, itemIdx, { description: e.target.value })} />
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Image URL (optional)" value={item.image_url || ''} onChange={(e) => updateItem(catIdx, itemIdx, { image_url: e.target.value })} />
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1"><input type="checkbox" checked={item.is_veg ?? true} onChange={(e) => updateItem(catIdx, itemIdx, { is_veg: e.target.checked })} className="rounded" /> Veg</label>
                <label className="flex items-center gap-1"><input type="checkbox" checked={item.is_bestseller ?? false} onChange={(e) => updateItem(catIdx, itemIdx, { is_bestseller: e.target.checked })} className="rounded" /> Bestseller</label>
                <label className="flex items-center gap-1"><input type="checkbox" checked={item.is_spicy ?? false} onChange={(e) => updateItem(catIdx, itemIdx, { is_spicy: e.target.checked })} className="rounded" /> Spicy</label>
                <label className="flex items-center gap-1"><input type="checkbox" checked={item.is_available ?? true} onChange={(e) => updateItem(catIdx, itemIdx, { is_available: e.target.checked })} className="rounded" /> Available</label>
                <button onClick={() => removeItem(catIdx, itemIdx)} className="text-red-400 hover:text-red-600 ml-auto">Remove</button>
              </div>
            </div>
          ))}
          <button onClick={() => addItem(catIdx)} className="ml-4 text-sm text-primary-600 font-medium">+ Add Item</button>
        </div>
      ))}
      <button onClick={addCategory} className="text-sm text-primary-600 font-medium">+ Add Category</button>
    </>
  );
}

function LinkBioForm({ config, updateConfig }: FormProps) {
  const links = (config.links as BioLink[]) || [];

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Display Name" value={(config.display_name as string) || ''} onChange={(v) => updateConfig('display_name', v)} placeholder="Your Name" />
        <InputField label="Profile Photo URL" value={(config.profile_photo as string) || ''} onChange={(v) => updateConfig('profile_photo', v)} />
      </div>
      <TextArea label="Bio" value={(config.bio as string) || ''} onChange={(v) => updateConfig('bio', v)} placeholder="A short bio..." rows={2} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Button Style</label>
        <div className="flex gap-2">
          {(['rounded', 'sharp', 'pill'] as const).map((l) => (
            <button key={l} onClick={() => updateConfig('layout', l)} className={`px-4 py-2 text-sm border rounded-lg capitalize ${config.layout === l ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200'}`}>{l}</button>
          ))}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-4">Social Profiles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Facebook" value={(config.social_facebook as string) || ''} onChange={(v) => updateConfig('social_facebook', v)} />
        <InputField label="Instagram" value={(config.social_instagram as string) || ''} onChange={(v) => updateConfig('social_instagram', v)} />
        <InputField label="YouTube" value={(config.social_youtube as string) || ''} onChange={(v) => updateConfig('social_youtube', v)} />
        <InputField label="LinkedIn" value={(config.social_linkedin as string) || ''} onChange={(v) => updateConfig('social_linkedin', v)} />
        <InputField label="Twitter/X" value={(config.social_twitter as string) || ''} onChange={(v) => updateConfig('social_twitter', v)} />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-4">Links</h3>
      {links.map((link, i) => (
        <div key={link.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-xl">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={link.icon || 'website'} onChange={(e) => { const arr = [...links]; arr[i] = { ...link, icon: e.target.value }; updateConfig('links', arr); }}>
              {['website', 'whatsapp', 'youtube', 'instagram', 'facebook', 'linkedin', 'email', 'phone', 'maps', 'shop', 'menu', 'booking', 'portfolio', 'blog', 'music', 'podcast'].map((ic) => (
                <option key={ic} value={ic}>{ic}</option>
              ))}
            </select>
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Button Text" value={link.title} onChange={(e) => { const arr = [...links]; arr[i] = { ...link, title: e.target.value }; updateConfig('links', arr); }} />
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="URL" value={link.url} onChange={(e) => { const arr = [...links]; arr[i] = { ...link, url: e.target.value }; updateConfig('links', arr); }} />
          </div>
          <button onClick={() => updateConfig('links', links.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 mt-2">✕</button>
        </div>
      ))}
      <button onClick={() => updateConfig('links', [...links, { id: Date.now().toString(), title: '', url: '', icon: 'website' }])} className="text-sm text-primary-600 font-medium">+ Add Link</button>
    </>
  );
}

function ReviewsForm({ config, updateConfig }: FormProps) {
  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900">Google Reviews Setup</h3>
      <InputField label="Business Name" value={(config.business_name as string) || ''} onChange={(v) => updateConfig('business_name', v)} />
      <InputField label="Google Place ID" value={(config.google_place_id as string) || ''} onChange={(v) => updateConfig('google_place_id', v)} placeholder="ChIJ..." />
      <InputField label="Google Maps URL" value={(config.google_maps_url as string) || ''} onChange={(v) => updateConfig('google_maps_url', v)} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Min stars to redirect to Google</label>
        <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" value={(config.min_stars_for_google as number) || 4} onChange={(e) => updateConfig('min_stars_for_google', Number(e.target.value))}>
          <option value={3}>3+ Stars</option><option value={4}>4+ Stars</option><option value={5}>5 Stars Only</option>
        </select>
      </div>
      <TextArea label="Private Feedback Message" value={(config.feedback_message as string) || ''} onChange={(v) => updateConfig('feedback_message', v)} />
      <TextArea label="Thank You Message" value={(config.thank_you_message as string) || ''} onChange={(v) => updateConfig('thank_you_message', v)} />
    </>
  );
}

function PosterForm({ config, updateConfig }: FormProps) {
  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900">Social Poster Setup</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Business Name" value={(config.business_name as string) || ''} onChange={(v) => updateConfig('business_name', v)} />
        <InputField label="Phone" value={(config.phone as string) || ''} onChange={(v) => updateConfig('phone', v)} />
        <InputField label="Logo URL" value={(config.logo_url as string) || ''} onChange={(v) => updateConfig('logo_url', v)} />
        <InputField label="Tagline" value={(config.tagline as string) || ''} onChange={(v) => updateConfig('tagline', v)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
        <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" value={(config.default_language as string) || 'English'} onChange={(e) => updateConfig('default_language', e.target.value)}>
          <option>English</option><option>Hindi</option><option>Tamil</option><option>Telugu</option><option>Malayalam</option>
        </select>
      </div>
    </>
  );
}

function ChatbotForm({ config, updateConfig }: FormProps) {
  const menuOptions = (config.menu_options as string[]) || [];
  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900">WhatsApp Chatbot Setup</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Business Name" value={(config.business_name as string) || ''} onChange={(v) => updateConfig('business_name', v)} />
        <InputField label="WhatsApp Number" value={(config.whatsapp_number as string) || ''} onChange={(v) => updateConfig('whatsapp_number', v)} placeholder="+91..." />
      </div>
      <TextArea label="Welcome Message" value={(config.welcome_message as string) || ''} onChange={(v) => updateConfig('welcome_message', v)} />
      <h4 className="text-sm font-medium text-gray-700">Menu Options (quick replies)</h4>
      {menuOptions.map((opt, i) => (
        <div key={i} className="flex gap-2">
          <input className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" value={opt} onChange={(e) => { const arr = [...menuOptions]; arr[i] = e.target.value; updateConfig('menu_options', arr); }} />
          <button onClick={() => updateConfig('menu_options', menuOptions.filter((_, j) => j !== i))} className="text-red-400">✕</button>
        </div>
      ))}
      <button onClick={() => updateConfig('menu_options', [...menuOptions, ''])} className="text-sm text-primary-600 font-medium">+ Add Option</button>
    </>
  );
}
