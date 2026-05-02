import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VCardRenderer } from '@/components/renderers/VCardRenderer';
import { QRMenuRenderer } from '@/components/renderers/QRMenuRenderer';
import { LinkBioRenderer } from '@/components/renderers/LinkBioRenderer';
import { WebsiteRenderer } from '@/components/renderers/WebsiteRenderer';
import { GoogleReviewsRenderer } from '@/components/renderers/GoogleReviewsRenderer';
import { SocialPosterRenderer } from '@/components/renderers/SocialPosterRenderer';
import { WhatsAppChatbotRenderer } from '@/components/renderers/WhatsAppChatbotRenderer';
import { DeviceFrame3D } from '@/components/three/DeviceFrame3D';
import type { Product } from '@/types';

export function ProductViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/public/products/${slug}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setProduct(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Track view
  useEffect(() => {
    if (!slug || !product) return;
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/public/products/${slug}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'view' }),
    }).catch(() => {});
  }, [slug, product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        <p className="text-gray-500 mt-2">This product may have been removed or is not yet published.</p>
      </div>
    );
  }

  const config = product.config_data as Record<string, unknown>;

  switch (product.product_type) {
    case 'vcard':
      return (
        <DeviceFrame3D type="phone">
          <VCardRenderer data={config} slug={slug} />
        </DeviceFrame3D>
      );
    case 'qr_menu':
      return (
        <DeviceFrame3D type="phone">
          <QRMenuRenderer data={config} />
        </DeviceFrame3D>
      );
    case 'link_in_bio':
      return (
        <DeviceFrame3D type="phone">
          <LinkBioRenderer data={config} />
        </DeviceFrame3D>
      );
    case 'website':
      return (
        <DeviceFrame3D type="laptop">
          <WebsiteRenderer data={config} />
        </DeviceFrame3D>
      );
    case 'google_reviews':
      return (
        <DeviceFrame3D type="phone">
          <GoogleReviewsRenderer data={config} />
        </DeviceFrame3D>
      );
    case 'social_poster':
      return (
        <DeviceFrame3D type="laptop">
          <SocialPosterRenderer data={config} />
        </DeviceFrame3D>
      );
    case 'whatsapp_chatbot':
      return (
        <DeviceFrame3D type="phone">
          <WhatsAppChatbotRenderer data={config} />
        </DeviceFrame3D>
      );
    default:
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <p className="text-6xl mb-4">🚧</p>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-500 mt-2">This product type viewer is coming soon.</p>
        </div>
      );
  }
}
