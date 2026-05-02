import { lazy, Suspense } from 'react';
import type { VCardPublicData } from '@/types/vcard';
import ConfigurableTemplate from './templates/ConfigurableTemplate';
import { templateConfigs } from './templates/templateConfigs';

/** 10 hand-crafted templates with unique layouts & animations */
const handCrafted: Record<string, React.LazyExoticComponent<React.ComponentType<VCardTemplateProps>>> = {
  'minimal-clean': lazy(() => import('./templates/MinimalClean')),
  'glass-wave': lazy(() => import('./templates/GlassWave')),
  'dark-luxury': lazy(() => import('./templates/DarkLuxury')),
  'neon-cyber': lazy(() => import('./templates/NeonCyber')),
  'gradient-mesh': lazy(() => import('./templates/GradientMesh')),
  'corporate-classic': lazy(() => import('./templates/CorporateClassic')),
  'nature-organic': lazy(() => import('./templates/NatureOrganic')),
  'bold-modern': lazy(() => import('./templates/BoldModern')),
  'neumorphic-soft': lazy(() => import('./templates/NeumorphicSoft')),
  'geometric-abstract': lazy(() => import('./templates/GeometricAbstract')),
};

/** Index config templates by id for O(1) lookup */
const configMap = new Map(templateConfigs.map((c) => [c.id, c]));

export interface VCardTemplateProps {
  card: VCardPublicData;
  onAction?: (action: string) => void;
  preview?: boolean;
}

/** Master template list — 10 hand-crafted + 50 config-driven = 60 total */
export const TEMPLATE_LIST = [
  // Hand-crafted (unique layouts)
  { id: 'minimal-clean', name: 'Minimal Clean', category: 'Minimal', description: 'Clean whitespace design with elegant typography' },
  { id: 'glass-wave', name: 'Glass Wave', category: 'Corporate', description: 'Glassmorphism with fluid wave background' },
  { id: 'dark-luxury', name: 'Dark Luxury', category: 'Premium', description: 'Dark theme with gold foil accents' },
  { id: 'neon-cyber', name: 'Neon Cyber', category: 'Creative', description: 'Cyberpunk neon glow aesthetic' },
  { id: 'gradient-mesh', name: 'Gradient Mesh', category: 'Creative', description: 'Vibrant mesh gradient backgrounds' },
  { id: 'corporate-classic', name: 'Corporate Classic', category: 'Corporate', description: 'Professional navy & white business card' },
  { id: 'nature-organic', name: 'Nature Organic', category: 'Lifestyle', description: 'Earthy tones with organic shapes' },
  { id: 'bold-modern', name: 'Bold Modern', category: 'Creative', description: 'Big typography and bold colors' },
  { id: 'neumorphic-soft', name: 'Neumorphic Soft', category: 'Minimal', description: 'Soft neumorphism with subtle shadows' },
  { id: 'geometric-abstract', name: 'Geometric Abstract', category: 'Creative', description: 'Abstract geometric pattern overlay' },
  // Config-driven (50 templates)
  ...templateConfigs.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    description: c.description,
  })),
];

export function VCardRenderer({ card, onAction, preview }: VCardTemplateProps) {
  const templateId = card.template_id;

  // Check hand-crafted templates first
  const HandCrafted = handCrafted[templateId];
  if (HandCrafted) {
    return (
      <Suspense fallback={<Spinner />}>
        <HandCrafted card={card} onAction={onAction} preview={preview} />
      </Suspense>
    );
  }

  // Fall back to config-driven template
  const config = configMap.get(templateId);
  if (config) {
    return (
      <ConfigurableTemplate card={card} onAction={onAction} preview={preview} config={config} />
    );
  }

  // Ultimate fallback: minimal-clean
  const Fallback = handCrafted['minimal-clean'];
  return (
    <Suspense fallback={<Spinner />}>
      <Fallback card={card} onAction={onAction} preview={preview} />
    </Suspense>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
