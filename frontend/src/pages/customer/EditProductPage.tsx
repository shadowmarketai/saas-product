import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GradientButton } from '@/components/ui/GradientButton';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import type { Theme } from '@/components/ui/ThemeSelector';
import { VCardRenderer } from '@/components/renderers/VCardRenderer';
import { QRMenuRenderer } from '@/components/renderers/QRMenuRenderer';
import { LinkBioRenderer } from '@/components/renderers/LinkBioRenderer';
import { WebsiteRenderer } from '@/components/renderers/WebsiteRenderer';
import { GoogleReviewsRenderer } from '@/components/renderers/GoogleReviewsRenderer';
import { SocialPosterRenderer } from '@/components/renderers/SocialPosterRenderer';
import { WhatsAppChatbotRenderer } from '@/components/renderers/WhatsAppChatbotRenderer';
import { QRCodeSVG } from 'qrcode.react';
import { CardDesignSelector } from '@/components/ui/CardDesignSelector';
import api from '@/services/api';
import type { Product } from '@/types';

export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<Product>(`/products/${id}`).then((r) => {
      setProduct(r.data);
      setConfig(r.data.config_data as Record<string, unknown>);
    }).catch(() => navigate('/dashboard')).finally(() => setLoading(false));
  }, [id, navigate]);

  const updateConfig = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const applyTheme = (theme: Theme) => {
    setConfig((prev) => ({
      ...prev, theme_id: theme.id, theme_primary: theme.primary,
      theme_secondary: theme.secondary, theme_accent: theme.accent,
      theme_bg: theme.bg, theme_text: theme.text,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    await api.put(`/products/${product.id}`, { config_data: config });
    setSaving(false);
    setSaved(true);
  };

  const togglePublish = async () => {
    if (!product) return;
    const action = product.is_published ? 'unpublish' : 'publish';
    const res = await api.patch<Product>(`/products/${product.id}/${action}`);
    setProduct(res.data);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!product) return null;

  const publicUrl = `${window.location.origin}/p/${product.slug}`;

  const renderEditForm = () => {
    switch (product.product_type) {
      case 'vcard': return <VCardEditFields config={config} updateConfig={updateConfig} />;
      case 'website': return <WebsiteEditFields config={config} updateConfig={updateConfig} />;
      case 'qr_menu': return <QRMenuEditFields config={config} updateConfig={updateConfig} />;
      case 'link_in_bio': return <LinkBioEditFields config={config} updateConfig={updateConfig} />;
      case 'google_reviews': return <GoogleReviewsEditFields config={config} updateConfig={updateConfig} />;
      case 'social_poster': return <SocialPosterEditFields config={config} updateConfig={updateConfig} />;
      case 'whatsapp_chatbot': return <WhatsAppChatbotEditFields config={config} updateConfig={updateConfig} />;
    }
  };

  const renderPreview = () => {
    switch (product.product_type) {
      case 'vcard': return <VCardRenderer data={config} slug={product.slug} preview />;
      case 'website': return <WebsiteRenderer data={config} preview />;
      case 'qr_menu': return <QRMenuRenderer data={config} preview />;
      case 'link_in_bio': return <LinkBioRenderer data={config} preview />;
      case 'google_reviews': return <GoogleReviewsRenderer data={config} preview />;
      case 'social_poster': return <SocialPosterRenderer data={config} preview />;
      case 'whatsapp_chatbot': return <WhatsAppChatbotRenderer data={config} preview />;
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600 text-2xl">&larr;</button>
          <div>
            <h1 className="text-2xl font-bold text-heading">{product.name}</h1>
            <p className="text-sm text-gray-500">{product.product_type.replace(/_/g, ' ')} &middot; {product.is_published ? 'Published' : 'Draft'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={togglePublish} className={`px-4 py-2 rounded-xl text-sm font-medium border ${product.is_published ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
            {product.is_published ? 'Unpublish' : 'Publish'}
          </button>
          <GradientButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </GradientButton>
        </div>
      </motion.div>

      {product.is_published && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
          <QRCodeSVG value={publicUrl} size={64} />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Your product is live!</p>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm text-green-700 bg-green-100 px-2 py-0.5 rounded">{publicUrl}</code>
              <button onClick={() => navigator.clipboard.writeText(publicUrl)} className="text-xs text-green-600 hover:text-green-800 font-medium">Copy</button>
              <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:text-green-800 font-medium">Open</a>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-md border border-theme space-y-6 overflow-y-auto max-h-[75vh]">
          <ThemeSelector selected={(config.theme_id as string) || ''} onSelect={applyTheme} />

          <details className="group">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">Custom Colors</summary>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ColorPicker label="Primary" value={(config.theme_primary as string) || '#003049'} onChange={(c) => updateConfig('theme_primary', c)} />
              <ColorPicker label="Secondary" value={(config.theme_secondary as string) || '#669BBC'} onChange={(c) => updateConfig('theme_secondary', c)} />
              <ColorPicker label="Background" value={(config.theme_bg as string) || '#FFFFFF'} onChange={(c) => updateConfig('theme_bg', c)} />
              <ColorPicker label="Text" value={(config.theme_text as string) || '#1A1A2E'} onChange={(c) => updateConfig('theme_text', c)} />
            </div>
          </details>

          <hr className="border-theme" />
          {renderEditForm()}
        </div>

        <div className="bg-gray-100 rounded-2xl p-4 overflow-y-auto max-h-[75vh]">
          <div className="text-center text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">Live Preview</div>
          <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== Shared Helpers ========== */

function InputField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" rows={rows} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-heading flex items-center gap-2">{children}</h3>;
}

type ConfigProps = { config: Record<string, unknown>; updateConfig: (k: string, v: unknown) => void };

/* ========== vCard ========== */

function VCardEditFields({ config, updateConfig }: ConfigProps) {
  return (
    <>
      <CardDesignSelector
        selected={(config.card_design as string) || 'classic-white'}
        onSelect={(d) => updateConfig('card_design', d.id)}
      />
      <hr className="border-theme" />
      <SectionTitle>💼 Edit Card Info</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Full Name" value={(config.full_name as string) || ''} onChange={(v) => updateConfig('full_name', v)} />
        <InputField label="Designation" value={(config.designation as string) || ''} onChange={(v) => updateConfig('designation', v)} />
        <InputField label="Company" value={(config.company as string) || ''} onChange={(v) => updateConfig('company', v)} />
        <InputField label="Phone" value={(config.phone as string) || ''} onChange={(v) => updateConfig('phone', v)} />
        <InputField label="WhatsApp" value={(config.whatsapp as string) || ''} onChange={(v) => updateConfig('whatsapp', v)} />
        <InputField label="Email" value={(config.email as string) || ''} onChange={(v) => updateConfig('email', v)} type="email" />
        <InputField label="Website" value={(config.website as string) || ''} onChange={(v) => updateConfig('website', v)} />
        <InputField label="Business Hours" value={(config.business_hours as string) || ''} onChange={(v) => updateConfig('business_hours', v)} placeholder="Mon-Sat: 9AM-6PM" />
      </div>
      <InputField label="Address" value={(config.address as string) || ''} onChange={(v) => updateConfig('address', v)} />
      <InputField label="Google Maps URL" value={(config.google_maps as string) || ''} onChange={(v) => updateConfig('google_maps', v)} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Services (comma separated)</label>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Web Design, SEO, Marketing"
          value={Array.isArray(config.services) ? (config.services as string[]).join(', ') : ''}
          onChange={(e) => updateConfig('services', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        />
      </div>
      <SectionTitle>🔗 Social Links</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Facebook" value={(config.facebook as string) || ''} onChange={(v) => updateConfig('facebook', v)} placeholder="https://facebook.com/..." />
        <InputField label="Instagram" value={(config.instagram as string) || ''} onChange={(v) => updateConfig('instagram', v)} placeholder="https://instagram.com/..." />
        <InputField label="LinkedIn" value={(config.linkedin as string) || ''} onChange={(v) => updateConfig('linkedin', v)} placeholder="https://linkedin.com/in/..." />
        <InputField label="YouTube" value={(config.youtube as string) || ''} onChange={(v) => updateConfig('youtube', v)} placeholder="https://youtube.com/..." />
      </div>
      <InputField label="Profile Photo URL" value={(config.profile_photo as string) || ''} onChange={(v) => updateConfig('profile_photo', v)} />
      <InputField label="Logo URL" value={(config.logo_url as string) || ''} onChange={(v) => updateConfig('logo_url', v)} />
    </>
  );
}

/* ========== Website ========== */

function WebsiteEditFields({ config, updateConfig }: ConfigProps) {
  const services = (config.services as { name: string; description: string; icon: string }[]) || [];
  const testimonials = (config.testimonials as { name: string; text: string; rating: number }[]) || [];
  const faq = (config.faq as { question: string; answer: string }[]) || [];

  const addService = () => updateConfig('services', [...services, { name: '', description: '', icon: '✨' }]);
  const updateService = (i: number, field: string, val: string) => {
    const updated = [...services];
    updated[i] = { ...updated[i], [field]: field === 'rating' ? Number(val) : val };
    updateConfig('services', updated);
  };
  const removeService = (i: number) => updateConfig('services', services.filter((_, idx) => idx !== i));

  const addTestimonial = () => updateConfig('testimonials', [...testimonials, { name: '', text: '', rating: 5 }]);
  const updateTestimonial = (i: number, field: string, val: string) => {
    const updated = [...testimonials];
    updated[i] = { ...updated[i], [field]: field === 'rating' ? Number(val) : val };
    updateConfig('testimonials', updated);
  };
  const removeTestimonial = (i: number) => updateConfig('testimonials', testimonials.filter((_, idx) => idx !== i));

  const addFaq = () => updateConfig('faq', [...faq, { question: '', answer: '' }]);
  const updateFaq = (i: number, field: string, val: string) => {
    const updated = [...faq];
    updated[i] = { ...updated[i], [field]: val };
    updateConfig('faq', updated);
  };
  const removeFaq = (i: number) => updateConfig('faq', faq.filter((_, idx) => idx !== i));

  return (
    <>
      <SectionTitle>🌐 Edit Website</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Business Name" value={(config.business_name as string) || ''} onChange={(v) => updateConfig('business_name', v)} />
        <InputField label="Tagline" value={(config.tagline as string) || ''} onChange={(v) => updateConfig('tagline', v)} />
        <InputField label="Phone" value={(config.phone as string) || ''} onChange={(v) => updateConfig('phone', v)} />
        <InputField label="WhatsApp" value={(config.whatsapp as string) || ''} onChange={(v) => updateConfig('whatsapp', v)} />
        <InputField label="Email" value={(config.email as string) || ''} onChange={(v) => updateConfig('email', v)} type="email" />
        <InputField label="CTA Text" value={(config.cta_text as string) || ''} onChange={(v) => updateConfig('cta_text', v)} placeholder="Get Started" />
      </div>
      <TextAreaField label="About" value={(config.about as string) || ''} onChange={(v) => updateConfig('about', v)} rows={4} />
      <InputField label="Address" value={(config.address as string) || ''} onChange={(v) => updateConfig('address', v)} />
      <InputField label="Hero Image URL" value={(config.hero_image as string) || ''} onChange={(v) => updateConfig('hero_image', v)} />
      <InputField label="Logo URL" value={(config.logo_url as string) || ''} onChange={(v) => updateConfig('logo_url', v)} />

      <details className="group">
        <summary className="text-sm font-semibold text-gray-700 cursor-pointer">Services ({services.length})</summary>
        <div className="mt-3 space-y-3">
          {services.map((s, i) => (
            <div key={i} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <input className="px-3 py-1.5 border rounded-lg text-sm" placeholder="Icon" value={s.icon || ''} onChange={(e) => updateService(i, 'icon', e.target.value)} />
                <input className="px-3 py-1.5 border rounded-lg text-sm" placeholder="Name" value={s.name} onChange={(e) => updateService(i, 'name', e.target.value)} />
                <input className="px-3 py-1.5 border rounded-lg text-sm" placeholder="Description" value={s.description} onChange={(e) => updateService(i, 'description', e.target.value)} />
              </div>
              <button onClick={() => removeService(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
            </div>
          ))}
          <button onClick={addService} className="text-sm text-primary-600 font-medium hover:text-primary-800">+ Add Service</button>
        </div>
      </details>

      <details className="group">
        <summary className="text-sm font-semibold text-gray-700 cursor-pointer">Testimonials ({testimonials.length})</summary>
        <div className="mt-3 space-y-3">
          {testimonials.map((t, i) => (
            <div key={i} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
              <div className="flex-1 space-y-2">
                <input className="w-full px-3 py-1.5 border rounded-lg text-sm" placeholder="Name" value={t.name} onChange={(e) => updateTestimonial(i, 'name', e.target.value)} />
                <textarea className="w-full px-3 py-1.5 border rounded-lg text-sm resize-none" rows={2} placeholder="Review text" value={t.text} onChange={(e) => updateTestimonial(i, 'text', e.target.value)} />
                <select className="px-3 py-1.5 border rounded-lg text-sm" value={t.rating} onChange={(e) => updateTestimonial(i, 'rating', e.target.value)}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
              </div>
              <button onClick={() => removeTestimonial(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
            </div>
          ))}
          <button onClick={addTestimonial} className="text-sm text-primary-600 font-medium hover:text-primary-800">+ Add Testimonial</button>
        </div>
      </details>

      <details className="group">
        <summary className="text-sm font-semibold text-gray-700 cursor-pointer">FAQ ({faq.length})</summary>
        <div className="mt-3 space-y-3">
          {faq.map((f, i) => (
            <div key={i} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
              <div className="flex-1 space-y-2">
                <input className="w-full px-3 py-1.5 border rounded-lg text-sm" placeholder="Question" value={f.question} onChange={(e) => updateFaq(i, 'question', e.target.value)} />
                <textarea className="w-full px-3 py-1.5 border rounded-lg text-sm resize-none" rows={2} placeholder="Answer" value={f.answer} onChange={(e) => updateFaq(i, 'answer', e.target.value)} />
              </div>
              <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
            </div>
          ))}
          <button onClick={addFaq} className="text-sm text-primary-600 font-medium hover:text-primary-800">+ Add FAQ</button>
        </div>
      </details>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gallery (image URLs, one per line)</label>
        <textarea className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm resize-none" rows={3}
          placeholder="https://example.com/image1.jpg"
          value={Array.isArray(config.gallery) ? (config.gallery as string[]).join('\n') : ''}
          onChange={(e) => updateConfig('gallery', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
        />
      </div>
    </>
  );
}

/* ========== QR Menu ========== */

function QRMenuEditFields({ config, updateConfig }: ConfigProps) {
  const categories = (config.categories as { id: string; name: string; items: { id: string; name: string; description?: string; price: number; is_veg?: boolean; is_bestseller?: boolean; is_spicy?: boolean; is_available?: boolean }[] }[]) || [];

  const addCategory = () => {
    const id = `cat_${Date.now()}`;
    updateConfig('categories', [...categories, { id, name: 'New Category', items: [] }]);
  };

  const updateCategory = (i: number, name: string) => {
    const updated = [...categories];
    updated[i] = { ...updated[i], name };
    updateConfig('categories', updated);
  };

  const removeCategory = (i: number) => updateConfig('categories', categories.filter((_, idx) => idx !== i));

  const addItem = (catIdx: number) => {
    const updated = [...categories];
    const id = `item_${Date.now()}`;
    updated[catIdx] = { ...updated[catIdx], items: [...updated[catIdx].items, { id, name: '', price: 0, is_veg: true, is_available: true }] };
    updateConfig('categories', updated);
  };

  const updateItem = (catIdx: number, itemIdx: number, field: string, val: unknown) => {
    const updated = [...categories];
    const items = [...updated[catIdx].items];
    items[itemIdx] = { ...items[itemIdx], [field]: val };
    updated[catIdx] = { ...updated[catIdx], items };
    updateConfig('categories', updated);
  };

  const removeItem = (catIdx: number, itemIdx: number) => {
    const updated = [...categories];
    updated[catIdx] = { ...updated[catIdx], items: updated[catIdx].items.filter((_, idx) => idx !== itemIdx) };
    updateConfig('categories', updated);
  };

  return (
    <>
      <SectionTitle>🍽️ Edit Menu</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Restaurant Name" value={(config.restaurant_name as string) || ''} onChange={(v) => updateConfig('restaurant_name', v)} />
        <InputField label="Tagline" value={(config.tagline as string) || ''} onChange={(v) => updateConfig('tagline', v)} />
        <InputField label="Currency Symbol" value={(config.currency as string) || '₹'} onChange={(v) => updateConfig('currency', v)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" value={(config.layout as string) || 'list'} onChange={(e) => updateConfig('layout', e.target.value)}>
            <option value="list">List</option>
            <option value="grid">Grid</option>
          </select>
        </div>
      </div>
      <InputField label="Logo URL" value={(config.logo_url as string) || ''} onChange={(v) => updateConfig('logo_url', v)} />
      <InputField label="Banner URL" value={(config.banner_url as string) || ''} onChange={(v) => updateConfig('banner_url', v)} />

      <div className="space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">Categories & Items</h4>
          <button onClick={addCategory} className="text-sm text-primary-600 font-medium hover:text-primary-800">+ Add Category</button>
        </div>
        {categories.map((cat, ci) => (
          <div key={cat.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <input className="flex-1 px-3 py-1.5 border rounded-lg text-sm font-medium" value={cat.name} onChange={(e) => updateCategory(ci, e.target.value)} />
              <button onClick={() => removeCategory(ci)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
            </div>
            {cat.items.map((item, ii) => (
              <div key={item.id} className="bg-white p-3 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className="px-3 py-1.5 border rounded-lg text-sm" placeholder="Item name" value={item.name} onChange={(e) => updateItem(ci, ii, 'name', e.target.value)} />
                  <input type="number" className="px-3 py-1.5 border rounded-lg text-sm" placeholder="Price" value={item.price || ''} onChange={(e) => updateItem(ci, ii, 'price', Number(e.target.value))} />
                </div>
                <input className="w-full px-3 py-1.5 border rounded-lg text-sm" placeholder="Description" value={item.description || ''} onChange={(e) => updateItem(ci, ii, 'description', e.target.value)} />
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1"><input type="checkbox" checked={item.is_veg !== false} onChange={(e) => updateItem(ci, ii, 'is_veg', e.target.checked)} /> Veg</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={item.is_bestseller || false} onChange={(e) => updateItem(ci, ii, 'is_bestseller', e.target.checked)} /> Bestseller</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={item.is_spicy || false} onChange={(e) => updateItem(ci, ii, 'is_spicy', e.target.checked)} /> Spicy</label>
                  <button onClick={() => removeItem(ci, ii)} className="text-red-400 hover:text-red-600 ml-auto">Remove</button>
                </div>
              </div>
            ))}
            <button onClick={() => addItem(ci)} className="text-xs text-primary-600 font-medium">+ Add Item</button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ========== Link-in-Bio ========== */

function LinkBioEditFields({ config, updateConfig }: ConfigProps) {
  const links = (config.links as { id: string; title: string; url: string; icon?: string }[]) || [];

  const addLink = () => {
    const id = `link_${Date.now()}`;
    updateConfig('links', [...links, { id, title: '', url: '', icon: 'website' }]);
  };
  const updateLink = (i: number, field: string, val: string) => {
    const updated = [...links];
    updated[i] = { ...updated[i], [field]: val };
    updateConfig('links', updated);
  };
  const removeLink = (i: number) => updateConfig('links', links.filter((_, idx) => idx !== i));

  return (
    <>
      <SectionTitle>🔗 Edit Bio Page</SectionTitle>
      <InputField label="Display Name" value={(config.display_name as string) || ''} onChange={(v) => updateConfig('display_name', v)} />
      <TextAreaField label="Bio" value={(config.bio as string) || ''} onChange={(v) => updateConfig('bio', v)} rows={2} />
      <InputField label="Profile Photo URL" value={(config.profile_photo as string) || ''} onChange={(v) => updateConfig('profile_photo', v)} />
      <InputField label="Cover Image URL" value={(config.cover_image as string) || ''} onChange={(v) => updateConfig('cover_image', v)} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Layout Style</label>
        <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" value={(config.layout as string) || 'rounded'} onChange={(e) => updateConfig('layout', e.target.value)}>
          <option value="rounded">Rounded</option>
          <option value="pill">Pill</option>
          <option value="sharp">Sharp</option>
        </select>
      </div>

      <SectionTitle>🔗 Social Links</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Facebook" value={(config.social_facebook as string) || ''} onChange={(v) => updateConfig('social_facebook', v)} />
        <InputField label="Instagram" value={(config.social_instagram as string) || ''} onChange={(v) => updateConfig('social_instagram', v)} />
        <InputField label="YouTube" value={(config.social_youtube as string) || ''} onChange={(v) => updateConfig('social_youtube', v)} />
        <InputField label="LinkedIn" value={(config.social_linkedin as string) || ''} onChange={(v) => updateConfig('social_linkedin', v)} />
        <InputField label="Twitter / X" value={(config.social_twitter as string) || ''} onChange={(v) => updateConfig('social_twitter', v)} />
      </div>

      <SectionTitle>🔗 Links</SectionTitle>
      <div className="space-y-3">
        {links.map((link, i) => (
          <div key={link.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <input className="px-3 py-1.5 border rounded-lg text-sm" placeholder="Title" value={link.title} onChange={(e) => updateLink(i, 'title', e.target.value)} />
              <input className="px-3 py-1.5 border rounded-lg text-sm" placeholder="URL" value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} />
              <select className="px-3 py-1.5 border rounded-lg text-sm" value={link.icon || 'website'} onChange={(e) => updateLink(i, 'icon', e.target.value)}>
                {['website','whatsapp','youtube','instagram','facebook','linkedin','email','phone','maps','shop','menu','booking','portfolio','blog','music','podcast'].map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <button onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
          </div>
        ))}
        <button onClick={addLink} className="text-sm text-primary-600 font-medium hover:text-primary-800">+ Add Link</button>
      </div>
    </>
  );
}

/* ========== Google Reviews ========== */

function GoogleReviewsEditFields({ config, updateConfig }: ConfigProps) {
  const reviews = (config.sample_reviews as { name: string; rating: number; text: string; date: string }[]) || [];

  const addReview = () => updateConfig('sample_reviews', [...reviews, { name: '', rating: 5, text: '', date: new Date().toISOString().split('T')[0] }]);
  const updateReview = (i: number, field: string, val: string) => {
    const updated = [...reviews];
    updated[i] = { ...updated[i], [field]: field === 'rating' ? Number(val) : val };
    updateConfig('sample_reviews', updated);
  };
  const removeReview = (i: number) => updateConfig('sample_reviews', reviews.filter((_, idx) => idx !== i));

  return (
    <>
      <SectionTitle>⭐ Edit Review Collection</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Business Name" value={(config.business_name as string) || ''} onChange={(v) => updateConfig('business_name', v)} />
        <InputField label="Tagline" value={(config.tagline as string) || ''} onChange={(v) => updateConfig('tagline', v)} placeholder="We'd love your feedback!" />
        <InputField label="Google Review URL" value={(config.google_review_url as string) || ''} onChange={(v) => updateConfig('google_review_url', v)} placeholder="https://g.page/r/..." />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Stars for Google</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" value={String(config.min_stars_for_google || 4)} onChange={(e) => updateConfig('min_stars_for_google', Number(e.target.value))}>
            {[3,4,5].map(n => <option key={n} value={n}>{n}+ Stars → Google</option>)}
          </select>
        </div>
      </div>
      <InputField label="Logo URL" value={(config.logo_url as string) || ''} onChange={(v) => updateConfig('logo_url', v)} />
      <InputField label="Rating Average" value={String(config.rating_average || '')} onChange={(v) => updateConfig('rating_average', Number(v))} placeholder="4.8" />
      <InputField label="Rating Count" value={String(config.rating_count || '')} onChange={(v) => updateConfig('rating_count', Number(v))} placeholder="256" />
      <TextAreaField label="Thank You Message" value={(config.thank_you_message as string) || ''} onChange={(v) => updateConfig('thank_you_message', v)} placeholder="Thank you for your feedback!" />
      <TextAreaField label="Feedback Prompt" value={(config.feedback_prompt as string) || ''} onChange={(v) => updateConfig('feedback_prompt', v)} placeholder="How was your experience?" />

      <details className="group">
        <summary className="text-sm font-semibold text-gray-700 cursor-pointer">Sample Reviews ({reviews.length})</summary>
        <div className="mt-3 space-y-3">
          {reviews.map((r, i) => (
            <div key={i} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <input className="px-3 py-1.5 border rounded-lg text-sm" placeholder="Name" value={r.name} onChange={(e) => updateReview(i, 'name', e.target.value)} />
                  <select className="px-3 py-1.5 border rounded-lg text-sm" value={r.rating} onChange={(e) => updateReview(i, 'rating', e.target.value)}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                  <input type="date" className="px-3 py-1.5 border rounded-lg text-sm" value={r.date} onChange={(e) => updateReview(i, 'date', e.target.value)} />
                </div>
                <textarea className="w-full px-3 py-1.5 border rounded-lg text-sm resize-none" rows={2} placeholder="Review text" value={r.text} onChange={(e) => updateReview(i, 'text', e.target.value)} />
              </div>
              <button onClick={() => removeReview(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
            </div>
          ))}
          <button onClick={addReview} className="text-sm text-primary-600 font-medium hover:text-primary-800">+ Add Review</button>
        </div>
      </details>
    </>
  );
}

/* ========== Social Poster ========== */

function SocialPosterEditFields({ config, updateConfig }: ConfigProps) {
  const posters = (config.posters as { id: string; title: string; image_url?: string; caption?: string; category: string }[]) || [];
  const events = (config.upcoming_events as { name: string; date: string; type: string }[]) || [];

  const addPoster = () => {
    const id = `poster_${Date.now()}`;
    updateConfig('posters', [...posters, { id, title: '', category: 'Custom', image_url: '', caption: '' }]);
  };
  const updatePoster = (i: number, field: string, val: string) => {
    const updated = [...posters];
    updated[i] = { ...updated[i], [field]: val };
    updateConfig('posters', updated);
  };
  const removePoster = (i: number) => updateConfig('posters', posters.filter((_, idx) => idx !== i));

  const addEvent = () => updateConfig('upcoming_events', [...events, { name: '', date: '', type: 'Festival' }]);
  const updateEvent = (i: number, field: string, val: string) => {
    const updated = [...events];
    updated[i] = { ...updated[i], [field]: val };
    updateConfig('upcoming_events', updated);
  };
  const removeEvent = (i: number) => updateConfig('upcoming_events', events.filter((_, idx) => idx !== i));

  return (
    <>
      <SectionTitle>🎨 Edit Social Poster</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Business Name" value={(config.business_name as string) || ''} onChange={(v) => updateConfig('business_name', v)} />
        <InputField label="Logo URL" value={(config.logo_url as string) || ''} onChange={(v) => updateConfig('logo_url', v)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma separated)</label>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
          placeholder="Festival, Offer, Product, Event"
          value={Array.isArray(config.categories) ? (config.categories as string[]).join(', ') : ''}
          onChange={(e) => updateConfig('categories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
        />
      </div>

      <details className="group">
        <summary className="text-sm font-semibold text-gray-700 cursor-pointer">Posters ({posters.length})</summary>
        <div className="mt-3 space-y-3">
          {posters.map((p, i) => (
            <div key={p.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className="px-3 py-1.5 border rounded-lg text-sm" placeholder="Title" value={p.title} onChange={(e) => updatePoster(i, 'title', e.target.value)} />
                  <select className="px-3 py-1.5 border rounded-lg text-sm" value={p.category} onChange={(e) => updatePoster(i, 'category', e.target.value)}>
                    {['Festival','Offer','Product','Event','Custom'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input className="w-full px-3 py-1.5 border rounded-lg text-sm" placeholder="Image URL" value={p.image_url || ''} onChange={(e) => updatePoster(i, 'image_url', e.target.value)} />
                <textarea className="w-full px-3 py-1.5 border rounded-lg text-sm resize-none" rows={2} placeholder="Caption" value={p.caption || ''} onChange={(e) => updatePoster(i, 'caption', e.target.value)} />
              </div>
              <button onClick={() => removePoster(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
            </div>
          ))}
          <button onClick={addPoster} className="text-sm text-primary-600 font-medium hover:text-primary-800">+ Add Poster</button>
        </div>
      </details>

      <details className="group">
        <summary className="text-sm font-semibold text-gray-700 cursor-pointer">Upcoming Events ({events.length})</summary>
        <div className="mt-3 space-y-3">
          {events.map((ev, i) => (
            <div key={i} className="flex gap-2 items-center bg-gray-50 p-3 rounded-xl">
              <input className="flex-1 px-3 py-1.5 border rounded-lg text-sm" placeholder="Event name" value={ev.name} onChange={(e) => updateEvent(i, 'name', e.target.value)} />
              <input type="date" className="px-3 py-1.5 border rounded-lg text-sm" value={ev.date} onChange={(e) => updateEvent(i, 'date', e.target.value)} />
              <select className="px-3 py-1.5 border rounded-lg text-sm" value={ev.type} onChange={(e) => updateEvent(i, 'type', e.target.value)}>
                {['Festival','Holiday','Season','National'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={() => removeEvent(i)} className="text-red-400 hover:text-red-600">×</button>
            </div>
          ))}
          <button onClick={addEvent} className="text-sm text-primary-600 font-medium hover:text-primary-800">+ Add Event</button>
        </div>
      </details>
    </>
  );
}

/* ========== WhatsApp Chatbot ========== */

function WhatsAppChatbotEditFields({ config, updateConfig }: ConfigProps) {
  const menuOptions = (config.menu_options as { label: string; response: string }[]) || [];
  const autoReplies = (config.auto_replies as { keyword: string; reply: string }[]) || [];

  const addMenuOption = () => updateConfig('menu_options', [...menuOptions, { label: '', response: '' }]);
  const updateMenuOption = (i: number, field: string, val: string) => {
    const updated = [...menuOptions];
    updated[i] = { ...updated[i], [field]: val };
    updateConfig('menu_options', updated);
  };
  const removeMenuOption = (i: number) => updateConfig('menu_options', menuOptions.filter((_, idx) => idx !== i));

  const addAutoReply = () => updateConfig('auto_replies', [...autoReplies, { keyword: '', reply: '' }]);
  const updateAutoReply = (i: number, field: string, val: string) => {
    const updated = [...autoReplies];
    updated[i] = { ...updated[i], [field]: val };
    updateConfig('auto_replies', updated);
  };
  const removeAutoReply = (i: number) => updateConfig('auto_replies', autoReplies.filter((_, idx) => idx !== i));

  return (
    <>
      <SectionTitle>💬 Edit WhatsApp Chatbot</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Business Name" value={(config.business_name as string) || ''} onChange={(v) => updateConfig('business_name', v)} />
        <InputField label="WhatsApp Number" value={(config.whatsapp_number as string) || ''} onChange={(v) => updateConfig('whatsapp_number', v)} placeholder="+91XXXXXXXXXX" />
      </div>
      <InputField label="Logo URL" value={(config.logo_url as string) || ''} onChange={(v) => updateConfig('logo_url', v)} />
      <TextAreaField label="Welcome Message" value={(config.welcome_message as string) || ''} onChange={(v) => updateConfig('welcome_message', v)} placeholder="Hello! Welcome to our business. How can we help?" />
      <TextAreaField label="Away Message" value={(config.away_message as string) || ''} onChange={(v) => updateConfig('away_message', v)} placeholder="We're currently closed. We'll get back to you soon!" />
      <InputField label="Business Hours" value={(config.business_hours as string) || ''} onChange={(v) => updateConfig('business_hours', v)} placeholder="Mon-Sat: 9AM-6PM" />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
        <input className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
          placeholder="Auto-Reply, Smart Menu, Lead Collection"
          value={Array.isArray(config.features) ? (config.features as string[]).join(', ') : ''}
          onChange={(e) => updateConfig('features', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
        />
      </div>

      <details className="group" open>
        <summary className="text-sm font-semibold text-gray-700 cursor-pointer">Menu Options ({menuOptions.length})</summary>
        <div className="mt-3 space-y-3">
          {menuOptions.map((opt, i) => (
            <div key={i} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl">
              <div className="flex-1 space-y-2">
                <input className="w-full px-3 py-1.5 border rounded-lg text-sm" placeholder="Option label (e.g. View Menu)" value={opt.label} onChange={(e) => updateMenuOption(i, 'label', e.target.value)} />
                <textarea className="w-full px-3 py-1.5 border rounded-lg text-sm resize-none" rows={2} placeholder="Bot response when selected" value={opt.response} onChange={(e) => updateMenuOption(i, 'response', e.target.value)} />
              </div>
              <button onClick={() => removeMenuOption(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
            </div>
          ))}
          <button onClick={addMenuOption} className="text-sm text-primary-600 font-medium hover:text-primary-800">+ Add Menu Option</button>
        </div>
      </details>

      <details className="group">
        <summary className="text-sm font-semibold text-gray-700 cursor-pointer">Auto-Replies ({autoReplies.length})</summary>
        <div className="mt-3 space-y-3">
          {autoReplies.map((ar, i) => (
            <div key={i} className="flex gap-2 items-center bg-gray-50 p-3 rounded-xl">
              <input className="flex-1 px-3 py-1.5 border rounded-lg text-sm" placeholder="Keyword (e.g. price, hours)" value={ar.keyword} onChange={(e) => updateAutoReply(i, 'keyword', e.target.value)} />
              <input className="flex-1 px-3 py-1.5 border rounded-lg text-sm" placeholder="Auto-reply message" value={ar.reply} onChange={(e) => updateAutoReply(i, 'reply', e.target.value)} />
              <button onClick={() => removeAutoReply(i)} className="text-red-400 hover:text-red-600">×</button>
            </div>
          ))}
          <button onClick={addAutoReply} className="text-sm text-primary-600 font-medium hover:text-primary-800">+ Add Auto-Reply</button>
        </div>
      </details>
    </>
  );
}
