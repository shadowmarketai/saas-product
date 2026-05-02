import { useState, useRef, useEffect } from 'react';

const PRESET_COLORS = [
  '#E85D04', '#D62828', '#003049', '#1A1A2E', '#16213E',
  '#0F3460', '#533483', '#2B2D42', '#8D99AE', '#EF233C',
  '#06D6A0', '#118AB2', '#073B4C', '#FFB703', '#FB8500',
  '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0', '#F72585',
  '#2D6A4F', '#40916C', '#52B788', '#95D5B2', '#D8F3DC',
  '#ffffff', '#f8fafc', '#0f172a', '#1e293b', '#334155',
];

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  onClear?: () => void;
  isDark?: boolean;
}

export function ColorPicker({ label, value, onChange, onClear, isDark }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 w-full px-3 py-2 border rounded-xl text-sm transition-colors ${
          isDark
            ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className={`w-6 h-6 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'}`} style={{ backgroundColor: value || 'transparent' }} />
        <span className={`font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{value || 'Default'}</span>
        {value && onClear && (
          <span
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className={`ml-auto text-xs ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ✕
          </span>
        )}
      </button>
      {open && (
        <div className={`absolute z-50 mt-2 p-3 rounded-xl shadow-xl border w-64 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { onChange(c); setOpen(false); }}
                className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${value === c ? 'border-indigo-500 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-8 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`flex-1 px-2 py-1 border rounded-lg text-sm font-mono ${
                isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
              }`}
              placeholder="#000000"
            />
          </div>
        </div>
      )}
    </div>
  );
}
