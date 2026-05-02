import { useState } from 'react';

interface CardDesign {
  id: string;
  name: string;
  category: string;
  bodyBg: string;
  headerBg: string;
  pattern: string;
  buttonStyle: 'rounded' | 'pill' | 'sharp';
  cardRadius: string;
  nameColor: string;
  subtitleColor: string;
  sectionColor: string;
  contactBg: string;
  socialStyle: 'circle' | 'square' | 'pill';
}

/* ================================================================
   SVG helper — encodes inline SVG for use in CSS background-image
   ================================================================ */
const svg = (s: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(s)}")`;

/* helper to build a wave path SVG */
const wave = (color: string, opacity: string, d: string) =>
  svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'><path fill='${color}' fill-opacity='${opacity}' d='${d}'/></svg>`);

const CARD_DESIGNS: CardDesign[] = [

  // ======================= 1-5 OCEAN & WAVES =======================
  { id: 'ocean-minimal', name: '1 · Ocean Minimal', category: 'Wave',
    bodyBg: '#EBF8FF', headerBg: 'linear-gradient(135deg,#006994,#00C6FF)',
    pattern: `${wave('#006994','0.08','M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,149.3C840,139,960,149,1080,176C1200,203,1320,245,1380,266.7L1440,288L1440,320L0,320Z')} bottom/100% auto no-repeat`,
    buttonStyle:'pill', cardRadius:'24px', nameColor:'#003D5B', subtitleColor:'#006994', sectionColor:'#006994', contactBg:'rgba(0,105,148,0.06)', socialStyle:'circle' },

  { id: 'sunset-wave', name: '2 · Sunset Wave', category: 'Wave',
    bodyBg: '#FFF8F0', headerBg: 'linear-gradient(135deg,#E85D04,#F48C06)',
    pattern: `${wave('#E85D04','0.07','M0,96L60,112C120,128,240,160,360,165.3C480,171,600,149,720,154.7C840,160,960,192,1080,192C1200,192,1320,160,1380,144L1440,128L1440,320L0,320Z')} bottom/100% auto no-repeat`,
    buttonStyle:'rounded', cardRadius:'24px', nameColor:'#370617', subtitleColor:'#E85D04', sectionColor:'#E85D04', contactBg:'rgba(232,93,4,0.06)', socialStyle:'circle' },

  { id: 'purple-wave', name: '3 · Purple Wave', category: 'Wave',
    bodyBg: '#F5F3FF', headerBg: 'linear-gradient(135deg,#7C3AED,#A855F7)',
    pattern: `${wave('#7C3AED','0.06','M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L0,320Z')} bottom/100% auto no-repeat`,
    buttonStyle:'pill', cardRadius:'28px', nameColor:'#3B0764', subtitleColor:'#7C3AED', sectionColor:'#7C3AED', contactBg:'rgba(124,58,237,0.06)', socialStyle:'circle' },

  { id: 'emerald-wave', name: '4 · Emerald Wave', category: 'Wave',
    bodyBg: '#ECFDF5', headerBg: 'linear-gradient(135deg,#059669,#10B981)',
    pattern: `${wave('#059669','0.07','M0,128L80,149.3C160,171,320,213,480,224C640,235,800,213,960,186.7C1120,160,1280,128,1360,112L1440,96L1440,320L0,320Z')} bottom/100% auto no-repeat`,
    buttonStyle:'rounded', cardRadius:'24px', nameColor:'#064E3B', subtitleColor:'#059669', sectionColor:'#059669', contactBg:'rgba(5,150,105,0.06)', socialStyle:'circle' },

  { id: 'coral-wave', name: '5 · Coral Wave', category: 'Wave',
    bodyBg: '#FFF5F5', headerBg: 'linear-gradient(135deg,#E11D48,#FB7185)',
    pattern: `${wave('#E11D48','0.06','M0,192L60,176C120,160,240,128,360,138.7C480,149,600,203,720,218.7C840,235,960,213,1080,192C1200,171,1320,149,1380,138.7L1440,128L1440,320L0,320Z')} bottom/100% auto no-repeat`,
    buttonStyle:'pill', cardRadius:'24px', nameColor:'#881337', subtitleColor:'#E11D48', sectionColor:'#E11D48', contactBg:'rgba(225,29,72,0.05)', socialStyle:'circle' },

  // ======================= 6-10 GALAXY & COSMIC =======================
  { id: 'galaxy-night', name: '6 · Galaxy Night', category: 'Galaxy',
    bodyBg: 'linear-gradient(180deg,#0B0C2A 0%,#1F1C2C 50%,#0B0C2A 100%)',
    headerBg: 'linear-gradient(135deg,#1F1C2C,#928DAB)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'>${Array.from({length:40},(_,i)=>`<circle cx='${(i*37)%200}' cy='${(i*53)%200}' r='${0.4+Math.random()*1.2}' fill='white' opacity='${0.1+Math.random()*0.3}'/>`).join('')}</svg>`)}`,
    buttonStyle:'pill', cardRadius:'24px', nameColor:'#E0E7FF', subtitleColor:'#A5B4FC', sectionColor:'#818CF8', contactBg:'rgba(255,255,255,0.05)', socialStyle:'circle' },

  { id: 'nebula', name: '7 · Nebula', category: 'Galaxy',
    bodyBg: 'linear-gradient(135deg,#0F0526 0%,#2D1B69 50%,#1A0B3A 100%)',
    headerBg: 'linear-gradient(135deg,#7C3AED,#EC4899)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><circle cx='100' cy='100' r='80' fill='#7C3AED' opacity='0.05'/><circle cx='60' cy='60' r='50' fill='#EC4899' opacity='0.04'/>${Array.from({length:20},(_,i)=>`<circle cx='${(i*43)%200}' cy='${(i*67)%200}' r='${0.5+Math.random()}' fill='white' opacity='${0.15+Math.random()*0.2}'/>`).join('')}</svg>`)}`,
    buttonStyle:'pill', cardRadius:'24px', nameColor:'#E9D5FF', subtitleColor:'#C084FC', sectionColor:'#A855F7', contactBg:'rgba(255,255,255,0.04)', socialStyle:'circle' },

  { id: 'aurora-sky', name: '8 · Aurora Sky', category: 'Galaxy',
    bodyBg: 'linear-gradient(180deg,#0F172A 0%,#1E1B4B 40%,#312E81 70%,#1E1B4B 100%)',
    headerBg: 'linear-gradient(135deg,#6366F1,#06B6D4)',
    pattern: '', buttonStyle:'pill', cardRadius:'28px',
    nameColor:'#E0E7FF', subtitleColor:'#A5B4FC', sectionColor:'#818CF8', contactBg:'rgba(255,255,255,0.06)', socialStyle:'circle' },

  { id: 'cosmic-dust', name: '9 · Cosmic Dust', category: 'Galaxy',
    bodyBg: 'linear-gradient(180deg,#000000,#1A1A2E)',
    headerBg: 'linear-gradient(135deg,#434343,#000000)',
    pattern: `${svg(`<svg width='300' height='300' xmlns='http://www.w3.org/2000/svg'>${Array.from({length:60},(_,i)=>`<circle cx='${(i*41)%300}' cy='${(i*59)%300}' r='${0.3+Math.random()*0.8}' fill='white' opacity='${0.05+Math.random()*0.2}'/>`).join('')}</svg>`)}`,
    buttonStyle:'sharp', cardRadius:'16px', nameColor:'#F5F5F5', subtitleColor:'#9CA3AF', sectionColor:'#60A5FA', contactBg:'rgba(255,255,255,0.04)', socialStyle:'square' },

  { id: 'starfield', name: '10 · Starfield', category: 'Galaxy',
    bodyBg: '#030712', headerBg: 'linear-gradient(135deg,#1E3A5F,#2563EB)',
    pattern: `${svg(`<svg width='250' height='250' xmlns='http://www.w3.org/2000/svg'>${Array.from({length:50},(_,i)=>`<circle cx='${(i*31)%250}' cy='${(i*47)%250}' r='${0.3+Math.random()*1.5}' fill='${Math.random()>0.7?"#60A5FA":"white"}' opacity='${0.1+Math.random()*0.35}'/>`).join('')}</svg>`)}`,
    buttonStyle:'rounded', cardRadius:'20px', nameColor:'#DBEAFE', subtitleColor:'#93C5FD', sectionColor:'#60A5FA', contactBg:'rgba(96,165,250,0.06)', socialStyle:'circle' },

  // ======================= 11-15 MESH & GRADIENT =======================
  { id: 'mesh-gradient', name: '11 · Mesh Gradient', category: 'Gradient',
    bodyBg: 'linear-gradient(135deg,#FFDEE9 0%,#B5FFFC 100%)',
    headerBg: 'linear-gradient(135deg,#FF5F6D,#FFC371)',
    pattern: '', buttonStyle:'pill', cardRadius:'28px',
    nameColor:'#5B2333', subtitleColor:'#FF5F6D', sectionColor:'#FF5F6D', contactBg:'rgba(255,255,255,0.6)', socialStyle:'circle' },

  { id: 'gradient-pop', name: '12 · Gradient Pop', category: 'Gradient',
    bodyBg: '#FFFFFF', headerBg: 'linear-gradient(135deg,#6366F1,#EC4899)',
    pattern: '', buttonStyle:'pill', cardRadius:'24px',
    nameColor:'#1E1B4B', subtitleColor:'#6366F1', sectionColor:'#6366F1', contactBg:'rgba(99,102,241,0.05)', socialStyle:'circle' },

  { id: 'rose-garden', name: '13 · Rose Garden', category: 'Gradient',
    bodyBg: 'linear-gradient(180deg,#FFF1F2,#FFE4E6,#FECDD3)',
    headerBg: 'linear-gradient(135deg,#E11D48,#F43F5E)',
    pattern: '', buttonStyle:'pill', cardRadius:'28px',
    nameColor:'#881337', subtitleColor:'#E11D48', sectionColor:'#E11D48', contactBg:'rgba(255,255,255,0.7)', socialStyle:'circle' },

  { id: 'forest-mist', name: '14 · Forest Mist', category: 'Gradient',
    bodyBg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5,#A7F3D0)',
    headerBg: 'linear-gradient(135deg,#065F46,#059669)',
    pattern: '', buttonStyle:'rounded', cardRadius:'24px',
    nameColor:'#064E3B', subtitleColor:'#047857', sectionColor:'#059669', contactBg:'rgba(255,255,255,0.6)', socialStyle:'circle' },

  { id: 'golden-hour', name: '15 · Golden Hour', category: 'Gradient',
    bodyBg: 'linear-gradient(180deg,#FFFBEB,#FEF3C7,#FDE68A)',
    headerBg: 'linear-gradient(135deg,#92400E,#D97706)',
    pattern: '', buttonStyle:'rounded', cardRadius:'20px',
    nameColor:'#451A03', subtitleColor:'#92400E', sectionColor:'#B45309', contactBg:'rgba(255,255,255,0.6)', socialStyle:'circle' },

  // ======================= 16-20 GEOMETRIC =======================
  { id: 'abstract-lines', name: '16 · Abstract Lines', category: 'Geometric',
    bodyBg: '#0F172A', headerBg: 'linear-gradient(135deg,#141E30,#243B55)',
    pattern: `${svg(`<svg width='100' height='100' xmlns='http://www.w3.org/2000/svg'><path d='M0 50 Q25 20 50 50 T100 50' fill='none' stroke='white' stroke-opacity='0.05' stroke-width='0.8'/><path d='M0 70 Q25 40 50 70 T100 70' fill='none' stroke='white' stroke-opacity='0.03' stroke-width='0.8'/></svg>`)}`,
    buttonStyle:'sharp', cardRadius:'12px', nameColor:'#E2E8F0', subtitleColor:'#94A3B8', sectionColor:'#38BDF8', contactBg:'rgba(255,255,255,0.04)', socialStyle:'square' },

  { id: 'geo-triangles', name: '17 · Geo Triangles', category: 'Geometric',
    bodyBg: '#FFFFFF', headerBg: 'linear-gradient(135deg,#FF512F,#DD2476)',
    pattern: `${svg(`<svg width='60' height='60' xmlns='http://www.w3.org/2000/svg'><polygon points='30,0 60,60 0,60' fill='none' stroke='%23FF512F' stroke-opacity='0.06' stroke-width='0.5'/></svg>`)}`,
    buttonStyle:'sharp', cardRadius:'16px', nameColor:'#1E1E1E', subtitleColor:'#DD2476', sectionColor:'#FF512F', contactBg:'rgba(255,81,47,0.04)', socialStyle:'square' },

  { id: 'hexagon-grid', name: '18 · Hexagon Grid', category: 'Geometric',
    bodyBg: '#0F172A', headerBg: 'linear-gradient(135deg,#141E30,#243B55)',
    pattern: `${svg(`<svg width='56' height='100' xmlns='http://www.w3.org/2000/svg'><path d='M28 0L56 14V42L28 56L0 42V14Z' fill='none' stroke='white' stroke-opacity='0.06'/><path d='M28 44L56 58V86L28 100L0 86V58Z' fill='none' stroke='white' stroke-opacity='0.04'/></svg>`)}`,
    buttonStyle:'sharp', cardRadius:'12px', nameColor:'#E2E8F0', subtitleColor:'#94A3B8', sectionColor:'#22D3EE', contactBg:'rgba(255,255,255,0.04)', socialStyle:'square' },

  { id: 'diamond-grid', name: '19 · Diamond Grid', category: 'Geometric',
    bodyBg: '#F8FAFC', headerBg: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    pattern: `${svg(`<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M20 0L40 20L20 40L0 20Z' fill='none' stroke='black' stroke-opacity='0.04'/></svg>`)}`,
    buttonStyle:'rounded', cardRadius:'20px', nameColor:'#1E293B', subtitleColor:'#64748B', sectionColor:'var(--primary)', contactBg:'rgba(0,0,0,0.03)', socialStyle:'circle' },

  { id: 'cross-pattern', name: '20 · Cross Pattern', category: 'Geometric',
    bodyBg: '#1A1A2E', headerBg: 'linear-gradient(135deg,#16213E,#0F3460)',
    pattern: `${svg(`<svg width='60' height='60' xmlns='http://www.w3.org/2000/svg'><path d='M30 15V45M15 30H45' stroke='white' stroke-opacity='0.04' stroke-width='0.5'/></svg>`)}`,
    buttonStyle:'rounded', cardRadius:'20px', nameColor:'#FFFFFF', subtitleColor:'#94A3B8', sectionColor:'#E94560', contactBg:'rgba(255,255,255,0.05)', socialStyle:'circle' },

  // ======================= 21-25 PARTICLE & TECH =======================
  { id: 'particle-field', name: '21 · Particle Field', category: 'Tech',
    bodyBg: '#000000', headerBg: 'linear-gradient(135deg,#000000,#003333)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'>${Array.from({length:35},(_,i)=>`<circle cx='${(i*39)%200}' cy='${(i*57)%200}' r='${0.8+Math.random()*1.5}' fill='%2300FFFF' opacity='${0.08+Math.random()*0.2}'/>`).join('')}</svg>`)}`,
    buttonStyle:'pill', cardRadius:'20px', nameColor:'#00FFFF', subtitleColor:'#0EA5E9', sectionColor:'#00FFFF', contactBg:'rgba(0,255,255,0.04)', socialStyle:'circle' },

  { id: 'circuit-board', name: '22 · Circuit Board', category: 'Tech',
    bodyBg: '#0F2027', headerBg: 'linear-gradient(135deg,#0F2027,#2C5364)',
    pattern: `${svg(`<svg width='100' height='100' xmlns='http://www.w3.org/2000/svg'><path d='M10 50H40M60 50H90M50 10V40M50 60V90' stroke='%2300FFAA' stroke-opacity='0.06' stroke-width='0.5'/><circle cx='50' cy='50' r='3' fill='%2300FFAA' opacity='0.08'/><circle cx='10' cy='50' r='2' fill='%2300FFAA' opacity='0.06'/><circle cx='90' cy='50' r='2' fill='%2300FFAA' opacity='0.06'/></svg>`)}`,
    buttonStyle:'sharp', cardRadius:'12px', nameColor:'#A7F3D0', subtitleColor:'#6EE7B7', sectionColor:'#34D399', contactBg:'rgba(52,211,153,0.06)', socialStyle:'square' },

  { id: 'neon-grid', name: '23 · Neon Grid', category: 'Tech',
    bodyBg: '#0A0A0F', headerBg: 'linear-gradient(135deg,#FF00FF,#00FFFF)',
    pattern: `${svg(`<svg width='80' height='80' xmlns='http://www.w3.org/2000/svg'><rect width='80' height='80' fill='none' stroke='%23FF00FF' stroke-opacity='0.06'/><rect x='20' y='20' width='40' height='40' fill='none' stroke='%2300FFFF' stroke-opacity='0.04'/></svg>`)}`,
    buttonStyle:'pill', cardRadius:'24px', nameColor:'#EEEEFF', subtitleColor:'#00FFFF', sectionColor:'#FF00FF', contactBg:'rgba(255,255,255,0.04)', socialStyle:'circle' },

  { id: 'digital-rain', name: '24 · Digital Rain', category: 'Tech',
    bodyBg: '#000800', headerBg: 'linear-gradient(180deg,#003300,#001100)',
    pattern: `${svg(`<svg width='120' height='200' xmlns='http://www.w3.org/2000/svg'>${Array.from({length:25},(_,i)=>`<text x='${(i*14)%120}' y='${(i*31)%200}' fill='%2300FF00' opacity='${0.03+Math.random()*0.08}' font-size='10' font-family='monospace'>${String.fromCharCode(0x30A0+Math.floor(Math.random()*96))}</text>`).join('')}</svg>`)}`,
    buttonStyle:'sharp', cardRadius:'8px', nameColor:'#00FF00', subtitleColor:'#22C55E', sectionColor:'#00FF00', contactBg:'rgba(0,255,0,0.04)', socialStyle:'square' },

  { id: 'blueprint', name: '25 · Blueprint', category: 'Tech',
    bodyBg: '#1E3A5F', headerBg: 'linear-gradient(135deg,#0D2137,#1E3A5F)',
    pattern: `${svg(`<svg width='100' height='100' xmlns='http://www.w3.org/2000/svg'><rect width='100' height='100' fill='none' stroke='white' stroke-opacity='0.06'/><line x1='50' y1='0' x2='50' y2='100' stroke='white' stroke-opacity='0.04'/><line x1='0' y1='50' x2='100' y2='50' stroke='white' stroke-opacity='0.04'/></svg>`)}`,
    buttonStyle:'sharp', cardRadius:'4px', nameColor:'#BFDBFE', subtitleColor:'#93C5FD', sectionColor:'#60A5FA', contactBg:'rgba(255,255,255,0.05)', socialStyle:'square' },

  // ======================= 26-30 TEXTURE =======================
  { id: 'noise-texture', name: '26 · Noise Texture', category: 'Texture',
    bodyBg: '#1F1F1F', headerBg: 'linear-gradient(135deg,#000000,#333333)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence baseFrequency='0.7' numOctaves='4'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.04'/></svg>`)}`,
    buttonStyle:'sharp', cardRadius:'12px', nameColor:'#F5F5F5', subtitleColor:'#A1A1AA', sectionColor:'#FBBF24', contactBg:'rgba(255,255,255,0.04)', socialStyle:'square' },

  { id: 'paper-texture', name: '27 · Paper', category: 'Texture',
    bodyBg: '#FAF9F6', headerBg: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><filter id='p'><feTurbulence baseFrequency='0.9' numOctaves='5'/></filter><rect width='200' height='200' filter='url(%23p)' opacity='0.02'/></svg>`)}`,
    buttonStyle:'rounded', cardRadius:'16px', nameColor:'#292524', subtitleColor:'#78716C', sectionColor:'var(--primary)', contactBg:'rgba(0,0,0,0.02)', socialStyle:'circle' },

  { id: 'brushed-metal', name: '28 · Brushed Metal', category: 'Texture',
    bodyBg: 'linear-gradient(180deg,#C0C0C0,#D4D4D8,#A1A1AA)',
    headerBg: 'linear-gradient(135deg,#3F3F46,#52525B)',
    pattern: `${svg(`<svg width='200' height='4' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='2' x2='200' y2='2' stroke='white' stroke-opacity='0.08' stroke-width='0.5'/></svg>`)} repeat-y`,
    buttonStyle:'sharp', cardRadius:'12px', nameColor:'#18181B', subtitleColor:'#3F3F46', sectionColor:'#18181B', contactBg:'rgba(255,255,255,0.4)', socialStyle:'square' },

  { id: 'chalkboard', name: '29 · Chalkboard', category: 'Texture',
    bodyBg: '#2D4A3E', headerBg: 'linear-gradient(135deg,#1B3029,#2D4A3E)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><filter id='c'><feTurbulence baseFrequency='0.65' numOctaves='3'/></filter><rect width='200' height='200' filter='url(%23c)' opacity='0.03'/></svg>`)}`,
    buttonStyle:'rounded', cardRadius:'16px', nameColor:'#FFFFFF', subtitleColor:'#A7F3D0', sectionColor:'#FDE68A', contactBg:'rgba(255,255,255,0.06)', socialStyle:'circle' },

  { id: 'linen', name: '30 · Linen Fabric', category: 'Texture',
    bodyBg: '#F5F0E8', headerBg: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    pattern: `${svg(`<svg width='8' height='8' xmlns='http://www.w3.org/2000/svg'><path d='M0 0H8M0 4H8' stroke='%23000' stroke-opacity='0.03' stroke-width='0.3'/><path d='M0 0V8M4 0V8' stroke='%23000' stroke-opacity='0.02' stroke-width='0.3'/></svg>`)}`,
    buttonStyle:'rounded', cardRadius:'20px', nameColor:'#3E2723', subtitleColor:'#795548', sectionColor:'var(--primary)', contactBg:'rgba(0,0,0,0.03)', socialStyle:'circle' },

  // ======================= 31-35 ELEGANT & LUXURY =======================
  { id: 'gold-luxury', name: '31 · Gold Luxury', category: 'Elegant',
    bodyBg: '#1C1917', headerBg: 'linear-gradient(135deg,#92400E,#B45309)',
    pattern: `${svg(`<svg width='60' height='60' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='60' x2='60' y2='0' stroke='%23D4AF37' stroke-opacity='0.06' stroke-width='0.5'/></svg>`)}`,
    buttonStyle:'sharp', cardRadius:'8px', nameColor:'#FDE68A', subtitleColor:'#D97706', sectionColor:'#F59E0B', contactBg:'rgba(217,119,6,0.08)', socialStyle:'square' },

  { id: 'marble-white', name: '32 · White Marble', category: 'Elegant',
    bodyBg: '#FAFAF9', headerBg: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><filter id='m'><feTurbulence baseFrequency='0.02' numOctaves='3' seed='2'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23m)' opacity='0.06'/></svg>`)}`,
    buttonStyle:'rounded', cardRadius:'20px', nameColor:'#1C1917', subtitleColor:'#57534E', sectionColor:'var(--primary)', contactBg:'rgba(0,0,0,0.02)', socialStyle:'circle' },

  { id: 'champagne', name: '33 · Champagne', category: 'Elegant',
    bodyBg: '#FAF7F2', headerBg: 'linear-gradient(135deg,#78716C,#A8A29E)',
    pattern: '', buttonStyle:'pill', cardRadius:'20px',
    nameColor:'#292524', subtitleColor:'#78716C', sectionColor:'#57534E', contactBg:'rgba(0,0,0,0.03)', socialStyle:'circle' },

  { id: 'rose-gold', name: '34 · Rose Gold', category: 'Elegant',
    bodyBg: '#FFF5F6', headerBg: 'linear-gradient(135deg,#B76E79,#D4A0A7)',
    pattern: '', buttonStyle:'pill', cardRadius:'24px',
    nameColor:'#5C2A2F', subtitleColor:'#B76E79', sectionColor:'#B76E79', contactBg:'rgba(183,110,121,0.06)', socialStyle:'circle' },

  { id: 'ruby-dark', name: '35 · Ruby Dark', category: 'Elegant',
    bodyBg: '#1A0A10', headerBg: 'linear-gradient(135deg,#9B1B30,#C41E3A)',
    pattern: `${svg(`<svg width='80' height='80' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='80' x2='80' y2='0' stroke='%23FFD700' stroke-opacity='0.04' stroke-width='0.3'/><line x1='40' y1='80' x2='80' y2='40' stroke='%23FFD700' stroke-opacity='0.03' stroke-width='0.3'/></svg>`)}`,
    buttonStyle:'sharp', cardRadius:'8px', nameColor:'#FECDD3', subtitleColor:'#FB7185', sectionColor:'#FFD700', contactBg:'rgba(255,215,0,0.04)', socialStyle:'square' },

  // ======================= 36-40 NATURE =======================
  { id: 'sakura', name: '36 · Sakura', category: 'Nature',
    bodyBg: '#FFF0F3', headerBg: 'linear-gradient(135deg,#BE185D,#EC4899)',
    pattern: `${svg(`<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><circle cx='25' cy='25' r='10' fill='%23EC4899' opacity='0.05'/><circle cx='85' cy='60' r='7' fill='%23F472B6' opacity='0.04'/><circle cx='50' cy='100' r='12' fill='%23FBCFE8' opacity='0.06'/></svg>`)}`,
    buttonStyle:'pill', cardRadius:'28px', nameColor:'#831843', subtitleColor:'#BE185D', sectionColor:'#DB2777', contactBg:'rgba(236,72,153,0.05)', socialStyle:'circle' },

  { id: 'fresh-leaf', name: '37 · Fresh Leaf', category: 'Nature',
    bodyBg: '#F0FDF4', headerBg: 'linear-gradient(135deg,#166534,#15803D)',
    pattern: `${svg(`<svg width='80' height='80' xmlns='http://www.w3.org/2000/svg'><ellipse cx='40' cy='60' rx='25' ry='15' fill='%2316a34a' opacity='0.04' transform='rotate(-30 40 60)'/><ellipse cx='60' cy='20' rx='20' ry='12' fill='%2316a34a' opacity='0.03' transform='rotate(20 60 20)'/></svg>`)}`,
    buttonStyle:'rounded', cardRadius:'24px', nameColor:'#14532D', subtitleColor:'#166534', sectionColor:'#15803D', contactBg:'rgba(22,101,52,0.05)', socialStyle:'circle' },

  { id: 'sand-dunes', name: '38 · Sand Dunes', category: 'Nature',
    bodyBg: 'linear-gradient(180deg,#FEF3C7,#FDE68A,#FBBF24)',
    headerBg: 'linear-gradient(135deg,#78350F,#92400E)',
    pattern: `${wave('#78350F','0.06','M0,192L120,160C240,128,480,64,720,80C960,96,1200,192,1320,240L1440,288L1440,320L0,320Z')} bottom/100% auto no-repeat`,
    buttonStyle:'rounded', cardRadius:'20px', nameColor:'#451A03', subtitleColor:'#78350F', sectionColor:'#92400E', contactBg:'rgba(255,255,255,0.5)', socialStyle:'circle' },

  { id: 'ice-crystal', name: '39 · Ice Crystal', category: 'Nature',
    bodyBg: 'linear-gradient(180deg,#EFF6FF,#DBEAFE,#BFDBFE)',
    headerBg: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
    pattern: `${svg(`<svg width='80' height='80' xmlns='http://www.w3.org/2000/svg'><path d='M40 0V80M0 40H80M12 12L68 68M68 12L12 68' stroke='%233B82F6' stroke-opacity='0.04' stroke-width='0.5'/></svg>`)}`,
    buttonStyle:'rounded', cardRadius:'24px', nameColor:'#1E3A8A', subtitleColor:'#2563EB', sectionColor:'#1D4ED8', contactBg:'rgba(255,255,255,0.6)', socialStyle:'circle' },

  { id: 'lavender', name: '40 · Lavender Field', category: 'Nature',
    bodyBg: 'linear-gradient(180deg,#F5F3FF,#EDE9FE,#DDD6FE)',
    headerBg: 'linear-gradient(135deg,#6D28D9,#7C3AED)',
    pattern: '', buttonStyle:'pill', cardRadius:'28px',
    nameColor:'#4C1D95', subtitleColor:'#6D28D9', sectionColor:'#7C3AED', contactBg:'rgba(255,255,255,0.6)', socialStyle:'circle' },

  // ======================= 41-45 MODERN =======================
  { id: 'glassmorphism', name: '41 · Glassmorphism', category: 'Modern',
    bodyBg: 'linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.7))',
    headerBg: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    pattern: '', buttonStyle:'rounded', cardRadius:'24px',
    nameColor:'#1E293B', subtitleColor:'#64748B', sectionColor:'var(--primary)', contactBg:'rgba(255,255,255,0.5)', socialStyle:'circle' },

  { id: 'synthwave', name: '42 · Synthwave', category: 'Modern',
    bodyBg: '#120320', headerBg: 'linear-gradient(135deg,#FF2975,#F222FF)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'>${Array.from({length:10},(_,i)=>`<line x1='0' y1='${120+i*8}' x2='200' y2='${120+i*8}' stroke='%23FF2975' stroke-opacity='${0.15-i*0.012}' stroke-width='0.5'/>`).join('')}<line x1='100' y1='120' x2='0' y2='200' stroke='%238B31FF' stroke-opacity='0.06'/><line x1='100' y1='120' x2='200' y2='200' stroke='%238B31FF' stroke-opacity='0.06'/></svg>`)}`,
    buttonStyle:'pill', cardRadius:'20px', nameColor:'#F8E3FF', subtitleColor:'#F222FF', sectionColor:'#FF2975', contactBg:'rgba(255,41,117,0.06)', socialStyle:'circle' },

  { id: 'modern-split', name: '43 · Modern Split', category: 'Modern',
    bodyBg: '#FFFFFF', headerBg: 'linear-gradient(135deg,#111827,#1F2937)',
    pattern: '', buttonStyle:'sharp', cardRadius:'16px',
    nameColor:'#111827', subtitleColor:'#6B7280', sectionColor:'#111827', contactBg:'#F9FAFB', socialStyle:'square' },

  { id: 'candy-pink', name: '44 · Candy Pink', category: 'Modern',
    bodyBg: '#FDF2F8', headerBg: 'linear-gradient(135deg,#EC4899,#F472B6)',
    pattern: '', buttonStyle:'pill', cardRadius:'28px',
    nameColor:'#831843', subtitleColor:'#DB2777', sectionColor:'#EC4899', contactBg:'rgba(236,72,153,0.05)', socialStyle:'circle' },

  { id: 'electric-blue', name: '45 · Electric Blue', category: 'Modern',
    bodyBg: '#FFFFFF', headerBg: 'linear-gradient(135deg,#2563EB,#06B6D4)',
    pattern: '', buttonStyle:'pill', cardRadius:'24px',
    nameColor:'#1E3A8A', subtitleColor:'#2563EB', sectionColor:'#2563EB', contactBg:'rgba(37,99,235,0.04)', socialStyle:'circle' },

  // ======================= 46-50 ARTISTIC =======================
  { id: 'watercolor', name: '46 · Watercolor', category: 'Artistic',
    bodyBg: '#FEFCE8', headerBg: 'linear-gradient(135deg,#7C3AED,#EC4899,#F59E0B)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><circle cx='40' cy='150' r='50' fill='%23EC4899' opacity='0.04'/><circle cx='160' cy='170' r='40' fill='%237C3AED' opacity='0.03'/><circle cx='100' cy='180' r='60' fill='%23F59E0B' opacity='0.03'/></svg>`)}`,
    buttonStyle:'pill', cardRadius:'28px', nameColor:'#4C1D95', subtitleColor:'#7C3AED', sectionColor:'#EC4899', contactBg:'rgba(255,255,255,0.6)', socialStyle:'circle' },

  { id: 'ink-spread', name: '47 · Ink Spread', category: 'Artistic',
    bodyBg: '#FAFAFA', headerBg: 'linear-gradient(135deg,#000000,#434343)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><circle cx='100' cy='190' r='70' fill='%23000' opacity='0.03'/><circle cx='60' cy='180' r='40' fill='%23333' opacity='0.02'/></svg>`)}`,
    buttonStyle:'sharp', cardRadius:'4px', nameColor:'#000000', subtitleColor:'#434343', sectionColor:'#000000', contactBg:'rgba(0,0,0,0.03)', socialStyle:'square' },

  { id: 'sunburst', name: '48 · Sunburst', category: 'Artistic',
    bodyBg: '#FFFBEB', headerBg: 'linear-gradient(135deg,#F97316,#FBBF24)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'>${Array.from({length:12},(_,i)=>{const a=i*30*Math.PI/180;return`<line x1='100' y1='100' x2='${100+Math.cos(a)*100}' y2='${100+Math.sin(a)*100}' stroke='%23F97316' stroke-opacity='0.04' stroke-width='1'/>`}).join('')}</svg>`)}`,
    buttonStyle:'rounded', cardRadius:'20px', nameColor:'#7C2D12', subtitleColor:'#EA580C', sectionColor:'#F97316', contactBg:'rgba(249,115,22,0.05)', socialStyle:'circle' },

  { id: 'mandala', name: '49 · Mandala', category: 'Artistic',
    bodyBg: '#FFFBEB', headerBg: 'linear-gradient(135deg,#92400E,#D97706)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><circle cx='100' cy='100' r='90' fill='none' stroke='%23D97706' stroke-opacity='0.04'/><circle cx='100' cy='100' r='60' fill='none' stroke='%23D97706' stroke-opacity='0.05'/><circle cx='100' cy='100' r='30' fill='none' stroke='%23D97706' stroke-opacity='0.06'/>${Array.from({length:8},(_,i)=>{const a=i*45*Math.PI/180;return`<line x1='${100+Math.cos(a)*30}' y1='${100+Math.sin(a)*30}' x2='${100+Math.cos(a)*90}' y2='${100+Math.sin(a)*90}' stroke='%23D97706' stroke-opacity='0.03' stroke-width='0.5'/>`}).join('')}</svg>`)}`,
    buttonStyle:'rounded', cardRadius:'20px', nameColor:'#451A03', subtitleColor:'#92400E', sectionColor:'#D97706', contactBg:'rgba(217,119,6,0.05)', socialStyle:'circle' },

  { id: 'spiral-vortex', name: '50 · Spiral Vortex', category: 'Artistic',
    bodyBg: '#0F172A', headerBg: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'>${Array.from({length:6},(_,i)=>`<circle cx='100' cy='100' r='${20+i*15}' fill='none' stroke='%236366F1' stroke-opacity='${0.08-i*0.01}' stroke-width='0.5' stroke-dasharray='${4+i*2} ${8+i*3}'/>`).join('')}</svg>`)}`,
    buttonStyle:'pill', cardRadius:'24px', nameColor:'#E0E7FF', subtitleColor:'#A5B4FC', sectionColor:'#818CF8', contactBg:'rgba(99,102,241,0.06)', socialStyle:'circle' },

  // ======================= 51-55 BOLD & VIBRANT =======================
  { id: 'fire-flames', name: '51 · Fire', category: 'Bold',
    bodyBg: 'linear-gradient(180deg,#1A0000,#3D0000)', headerBg: 'linear-gradient(135deg,#FF416C,#FF4B2B)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><ellipse cx='60' cy='200' rx='40' ry='80' fill='%23FF4B2B' opacity='0.06'/><ellipse cx='140' cy='200' rx='50' ry='90' fill='%23FF416C' opacity='0.05'/></svg>`)}`,
    buttonStyle:'sharp', cardRadius:'12px', nameColor:'#FEE2E2', subtitleColor:'#FCA5A5', sectionColor:'#FF416C', contactBg:'rgba(255,65,108,0.06)', socialStyle:'square' },

  { id: 'neon-purple', name: '52 · Neon Purple', category: 'Bold',
    bodyBg: '#0A0015', headerBg: 'linear-gradient(135deg,#A855F7,#6366F1)',
    pattern: `${svg(`<svg width='100' height='100' xmlns='http://www.w3.org/2000/svg'><circle cx='50' cy='50' r='40' fill='none' stroke='%23A855F7' stroke-opacity='0.06'/><circle cx='50' cy='50' r='25' fill='none' stroke='%236366F1' stroke-opacity='0.04'/></svg>`)}`,
    buttonStyle:'pill', cardRadius:'24px', nameColor:'#E9D5FF', subtitleColor:'#C084FC', sectionColor:'#A855F7', contactBg:'rgba(168,85,247,0.06)', socialStyle:'circle' },

  { id: 'tropical', name: '53 · Tropical', category: 'Bold',
    bodyBg: 'linear-gradient(180deg,#ECFDF5,#D1FAE5)', headerBg: 'linear-gradient(135deg,#059669,#FBBF24)',
    pattern: '', buttonStyle:'pill', cardRadius:'28px',
    nameColor:'#064E3B', subtitleColor:'#059669', sectionColor:'#D97706', contactBg:'rgba(255,255,255,0.6)', socialStyle:'circle' },

  { id: 'crimson-dark', name: '54 · Crimson Dark', category: 'Bold',
    bodyBg: '#18080E', headerBg: 'linear-gradient(135deg,#DC143C,#8B0000)',
    pattern: '', buttonStyle:'sharp', cardRadius:'12px',
    nameColor:'#FECDD3', subtitleColor:'#FDA4AF', sectionColor:'#FB7185', contactBg:'rgba(255,255,255,0.04)', socialStyle:'square' },

  { id: 'ocean-deep', name: '55 · Deep Ocean', category: 'Bold',
    bodyBg: 'linear-gradient(180deg,#001220,#002B4D)', headerBg: 'linear-gradient(135deg,#0077B6,#00B4D8)',
    pattern: `${svg(`<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'>${Array.from({length:15},(_,i)=>`<circle cx='${(i*41)%200}' cy='${(i*67)%200}' r='${2+Math.random()*4}' fill='%2300B4D8' opacity='${0.02+Math.random()*0.04}'/>`).join('')}</svg>`)}`,
    buttonStyle:'rounded', cardRadius:'20px', nameColor:'#CFFAFE', subtitleColor:'#67E8F9', sectionColor:'#22D3EE', contactBg:'rgba(34,211,238,0.06)', socialStyle:'circle' },

  // ======================= 56-60 MINIMAL & CORPORATE =======================
  { id: 'classic-white', name: '56 · Classic White', category: 'Minimal',
    bodyBg: '#FFFFFF', headerBg: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    pattern: '', buttonStyle:'rounded', cardRadius:'24px',
    nameColor:'#1A1A2E', subtitleColor:'#6B7280', sectionColor:'var(--primary)', contactBg:'rgba(0,0,0,0.03)', socialStyle:'circle' },

  { id: 'pure-minimal', name: '57 · Pure Minimal', category: 'Minimal',
    bodyBg: '#FFFFFF', headerBg: 'linear-gradient(135deg,#111827,#374151)',
    pattern: '', buttonStyle:'sharp', cardRadius:'12px',
    nameColor:'#111827', subtitleColor:'#6B7280', sectionColor:'#111827', contactBg:'#F9FAFB', socialStyle:'square' },

  { id: 'soft-gray', name: '58 · Soft Gray', category: 'Minimal',
    bodyBg: '#F9FAFB', headerBg: 'linear-gradient(135deg,#4B5563,#6B7280)',
    pattern: '', buttonStyle:'rounded', cardRadius:'20px',
    nameColor:'#1F2937', subtitleColor:'#6B7280', sectionColor:'#4B5563', contactBg:'rgba(0,0,0,0.03)', socialStyle:'circle' },

  { id: 'navy-corporate', name: '59 · Navy Corp', category: 'Minimal',
    bodyBg: '#FFFFFF', headerBg: 'linear-gradient(135deg,#1B2A4A,#2C4A7C)',
    pattern: '', buttonStyle:'rounded', cardRadius:'16px',
    nameColor:'#0D1B2A', subtitleColor:'#1B2A4A', sectionColor:'#1B2A4A', contactBg:'rgba(27,42,74,0.04)', socialStyle:'circle' },

  { id: 'holographic', name: '60 · Holographic', category: 'Modern',
    bodyBg: 'linear-gradient(135deg,#F0ABFC,#A5B4FC,#67E8F9,#86EFAC,#FDE68A,#FCA5A5)',
    headerBg: 'linear-gradient(135deg,#7C3AED,#2563EB,#06B6D4)',
    pattern: '', buttonStyle:'pill', cardRadius:'28px',
    nameColor:'#1E1B4B', subtitleColor:'#4338CA', sectionColor:'#6D28D9', contactBg:'rgba(255,255,255,0.5)', socialStyle:'circle' },
];

const DESIGN_CATEGORIES = ['All', 'Wave', 'Galaxy', 'Gradient', 'Geometric', 'Tech', 'Texture', 'Elegant', 'Nature', 'Modern', 'Artistic', 'Bold', 'Minimal'];

interface CardDesignSelectorProps {
  selected: string;
  onSelect: (design: CardDesign) => void;
}

export function CardDesignSelector({ selected, onSelect }: CardDesignSelectorProps) {
  const [category, setCategory] = useState('All');
  const filtered = category === 'All' ? CARD_DESIGNS : CARD_DESIGNS.filter((d) => d.category === category);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        🖼️ Card Design ({CARD_DESIGNS.length} backgrounds)
      </label>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
        {DESIGN_CATEGORIES.map((cat) => (
          <button key={cat} type="button" onClick={() => setCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {cat} {cat !== 'All' ? `(${CARD_DESIGNS.filter(d => d.category === cat).length})` : ''}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {filtered.map((design) => {
          const isSelected = selected === design.id;
          return (
            <button key={design.id} type="button" onClick={() => onSelect(design)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all ${isSelected ? 'border-blue-500 shadow-lg scale-[1.04] ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-400 hover:shadow-md'}`}>
              <div className="h-28 relative" style={{ background: design.bodyBg, backgroundImage: design.pattern || undefined, backgroundSize: design.pattern?.includes('repeat') ? undefined : 'cover' }}>
                <div className="h-9 rounded-b-[10px]" style={{ background: design.headerBg }} />
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full border-2 bg-white/20" style={{ borderColor: design.bodyBg.startsWith('linear') || design.bodyBg.startsWith('#F') || design.bodyBg === '#FFFFFF' || design.bodyBg.startsWith('#FAF') ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                <div className="mt-2.5 px-2 space-y-0.5">
                  <div className="h-1.5 rounded mx-auto w-12" style={{ backgroundColor: design.nameColor, opacity: 0.8 }} />
                  <div className="h-1 rounded mx-auto w-8" style={{ backgroundColor: design.subtitleColor, opacity: 0.5 }} />
                </div>
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1">
                  <div className="flex-1 h-2.5" style={{ background: design.headerBg, borderRadius: design.buttonStyle === 'pill' ? '99px' : design.buttonStyle === 'sharp' ? '3px' : '6px' }} />
                  <div className="flex-1 h-2.5 opacity-70" style={{ background: design.headerBg, borderRadius: design.buttonStyle === 'pill' ? '99px' : design.buttonStyle === 'sharp' ? '3px' : '6px' }} />
                </div>
                {isSelected && <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow">✓</div>}
              </div>
              <div className="px-1.5 py-1.5 bg-white border-t border-gray-100">
                <p className="text-[10px] font-semibold text-gray-800 truncate">{design.name}</p>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-400 mt-2 text-center">{filtered.length} designs &middot; Click to apply instantly</p>
    </div>
  );
}

export { CARD_DESIGNS };
export type { CardDesign };
