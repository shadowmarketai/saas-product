import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LinkBioRenderer } from '@/components/renderers/LinkBioRenderer';
import type { LinkBioData } from '@/components/renderers/LinkBioRenderer';
import type { Product } from '@/types';

export function LinkBioPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/public/products/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json() as Promise<Product>;
      })
      .then((data) => setProduct(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

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
        <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
        <p className="text-gray-500 mt-2">This link-in-bio page may have been removed or is not yet published.</p>
      </div>
    );
  }

  const config = product.config_data as unknown as LinkBioData;

  return <LinkBioRenderer data={config} />;
}
