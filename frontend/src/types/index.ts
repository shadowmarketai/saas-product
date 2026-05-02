export type UserRole = 'super_admin' | 'franchise_owner' | 'customer';

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  avatar_url: string | null;
  tenant_id: number | null;
  created_at: string;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  subdomain: string | null;
  custom_domain: string | null;
  logo_url: string | null;
  brand_color_primary: string;
  brand_color_secondary: string;
  tier: 'silver' | 'gold' | 'platinum';
  is_active: boolean;
  onboarding_fee_paid: boolean;
  owner_id: number | null;
  created_at: string;
}

export type ProductType =
  | 'vcard'
  | 'website'
  | 'google_reviews'
  | 'qr_menu'
  | 'social_poster'
  | 'link_in_bio'
  | 'whatsapp_chatbot';

export interface Product {
  id: number;
  product_type: ProductType;
  name: string;
  slug: string;
  config_data: Record<string, unknown>;
  is_published: boolean;
  is_active: boolean;
  template_id: number | null;
  customer_id: number;
  tenant_id: number | null;
  created_by_id: number;
  created_at: string;
}

export interface Template {
  id: number;
  product_type: ProductType;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  industry: string | null;
  style: string | null;
  is_premium: boolean;
  config_json: Record<string, unknown>;
}

export interface Plan {
  id: number;
  name: string;
  product_type: string;
  tier: 'starter' | 'pro' | 'business' | 'enterprise';
  price_amount: number;
  price_currency: string;
  billing_cycle: string;
  features: Record<string, unknown>;
}

export interface Subscription {
  id: number;
  plan_id: number;
  customer_id: number;
  tenant_id: number | null;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  created_at: string;
}

export interface Commission {
  id: number;
  tenant_id: number;
  subscription_id: number;
  amount: number;
  percentage: number;
  status: 'pending' | 'processing' | 'paid';
  payout_date: string | null;
  created_at: string;
}

export interface Analytics {
  product_id: number;
  total_views: number;
  total_clicks: number;
  total_scans: number;
  total_leads: number;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
