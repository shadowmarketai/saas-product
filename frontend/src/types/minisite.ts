export interface SiteFeature {
  title: string;
  description?: string;
  icon?: string;
}

export interface SiteTestimonial {
  name: string;
  text: string;
  role?: string;
  avatar_url?: string;
}

export interface MiniSiteData {
  id: number;
  user_id: number;
  tenant_id: number | null;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  template_id: string;
  site_name: string;
  tagline: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_cta_text: string | null;
  hero_cta_url: string | null;
  about_title: string | null;
  about_text: string | null;
  about_image_url: string | null;
  features: SiteFeature[];
  testimonials: SiteTestimonial[];
  gallery: string[];
  cta_title: string | null;
  cta_subtitle: string | null;
  cta_button_text: string | null;
  cta_button_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsapp: string | null;
  website: string | null;
  linkedin: string | null;
  instagram: string | null;
  github: string | null;
  twitter: string | null;
  youtube: string | null;
  footer_text: string | null;
  custom_colors: Record<string, string>;
  custom_fonts: Record<string, string>;
  view_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export type MiniSiteCreatePayload = Omit<
  MiniSiteData,
  'id' | 'user_id' | 'tenant_id' | 'slug' | 'status' | 'view_count' | 'created_at' | 'updated_at'
>;

export type MiniSiteUpdatePayload = Partial<MiniSiteCreatePayload> & { status?: string };

export type MiniSitePublicData = Omit<
  MiniSiteData,
  'id' | 'user_id' | 'tenant_id' | 'status' | 'view_count' | 'created_at' | 'updated_at'
>;
