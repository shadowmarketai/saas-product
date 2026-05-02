import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { minisiteApi } from '@/services/minisiteApi';
import { SiteRenderer } from '@/components/minisite/SiteRenderer';
import { siteTemplateConfigs } from '@/components/minisite/siteTemplateConfigs';
import type { MiniSitePublicData } from '@/types/minisite';

const configMap = new Map(siteTemplateConfigs.map((c) => [c.id, c]));

export function MiniSitePublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [site, setSite] = useState<MiniSitePublicData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    minisiteApi.getPublic(slug).then(setSite).catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Site Not Found</h1>
          <p className="text-sm text-gray-500">This website doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const config = configMap.get(site.template_id) || siteTemplateConfigs[0];

  return <SiteRenderer site={site} config={config} />;
}
