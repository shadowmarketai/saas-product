export interface VCardLink {
  label: string;
  url: string;
  icon?: string;
}

export interface VCardService {
  title: string;
  description?: string;
  icon?: string;
}

export interface VCardTestimonial {
  name: string;
  text: string;
  role?: string;
  avatar_url?: string;
}

export interface VCardDocument {
  name: string;
  url: string;
  file_type?: string;
}

export interface VCardData {
  id: number;
  user_id: number;
  tenant_id: number | null;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  template_id: string;
  name: string;
  title: string | null;
  company: string | null;
  profile_image_url: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  website: string | null;
  linkedin: string | null;
  instagram: string | null;
  github: string | null;
  twitter: string | null;
  youtube: string | null;
  custom_links: VCardLink[];
  bio: string | null;
  services: VCardService[];
  gallery: string[];
  video_url: string | null;
  testimonials: VCardTestimonial[];
  documents: VCardDocument[];
  custom_colors: Record<string, string>;
  custom_fonts: Record<string, string>;
  view_count: number;
  click_count: number;
  share_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export type VCardCreatePayload = Omit<
  VCardData,
  'id' | 'user_id' | 'tenant_id' | 'slug' | 'status' | 'view_count' | 'click_count' | 'share_count' | 'created_at' | 'updated_at'
>;

export type VCardUpdatePayload = Partial<VCardCreatePayload> & { status?: string };

export interface VCardPublicData {
  slug: string;
  template_id: string;
  name: string;
  title: string | null;
  company: string | null;
  profile_image_url: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  website: string | null;
  linkedin: string | null;
  instagram: string | null;
  github: string | null;
  twitter: string | null;
  youtube: string | null;
  custom_links: VCardLink[];
  bio: string | null;
  services: VCardService[];
  gallery: string[];
  video_url: string | null;
  testimonials: VCardTestimonial[];
  documents: VCardDocument[];
  custom_colors: Record<string, string>;
  custom_fonts: Record<string, string>;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
}
