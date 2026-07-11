import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const THEME_PRESETS = [
  { id: 'default', name: 'Default', color: '#18181b', light: ['0.205 0 0', '0.985 0 0', '0.97 0 0'], dark: ['0.922 0 0', '0.205 0 0', '0.269 0 0'] },
  { id: 'zinc', name: 'Zinc', color: '#71717a', light: ['0.274 0.006 286', '0.985 0 0', '0.967 0.001 286'], dark: ['0.871 0.006 286', '0.210 0.006 286', '0.274 0.006 286'] },
  { id: 'slate', name: 'Slate', color: '#475569', light: ['0.279 0.041 260', '0.984 0.003 248', '0.968 0.007 248'], dark: ['0.869 0.022 252', '0.208 0.042 266', '0.279 0.041 260'] },
  { id: 'stone', name: 'Stone', color: '#78716c', light: ['0.268 0.007 34', '0.985 0.002 106', '0.970 0.001 106'], dark: ['0.869 0.005 56', '0.216 0.006 56', '0.268 0.007 34'] },
  { id: 'red', name: 'Ruby', color: '#dc2626', light: ['0.577 0.245 27', '0.985 0 0', '0.936 0.032 17'], dark: ['0.637 0.237 25', '0.971 0.013 17', '0.269 0.092 26'] },
  { id: 'orange', name: 'Sunset', color: '#ea580c', light: ['0.646 0.222 41', '0.985 0 0', '0.954 0.038 75'], dark: ['0.705 0.213 47', '0.980 0.016 73', '0.279 0.077 45'] },
  { id: 'amber', name: 'Amber', color: '#d97706', light: ['0.666 0.179 58', '0.985 0 0', '0.962 0.059 96'], dark: ['0.769 0.188 70', '0.987 0.022 95', '0.286 0.066 54'] },
  { id: 'yellow', name: 'Lemon', color: '#ca8a04', light: ['0.681 0.162 76', '0.985 0 0', '0.973 0.071 104'], dark: ['0.795 0.184 86', '0.987 0.026 102', '0.286 0.063 73'] },
  { id: 'lime', name: 'Lime', color: '#65a30d', light: ['0.648 0.200 132', '0.985 0 0', '0.967 0.067 123'], dark: ['0.768 0.233 130', '0.986 0.031 121', '0.274 0.072 132'] },
  { id: 'green', name: 'Emerald', color: '#16a34a', light: ['0.627 0.194 149', '0.985 0 0', '0.962 0.044 157'], dark: ['0.696 0.170 162', '0.979 0.021 166', '0.266 0.065 153'] },
  { id: 'teal', name: 'Teal', color: '#0d9488', light: ['0.600 0.118 184', '0.985 0 0', '0.953 0.051 181'], dark: ['0.704 0.140 183', '0.984 0.014 181', '0.277 0.045 192'] },
  { id: 'cyan', name: 'Cyan', color: '#0891b2', light: ['0.609 0.126 222', '0.985 0 0', '0.956 0.045 203'], dark: ['0.715 0.143 215', '0.984 0.019 201', '0.302 0.056 230'] },
  { id: 'sky', name: 'Sky', color: '#0284c7', light: ['0.588 0.158 242', '0.985 0 0', '0.951 0.026 237'], dark: ['0.685 0.169 238', '0.977 0.013 236', '0.293 0.066 243'] },
  { id: 'blue', name: 'Ocean', color: '#2563eb', light: ['0.546 0.245 263', '0.985 0 0', '0.932 0.032 255'], dark: ['0.623 0.214 260', '0.970 0.014 255', '0.282 0.091 267'] },
  { id: 'indigo', name: 'Indigo', color: '#4f46e5', light: ['0.511 0.262 277', '0.985 0 0', '0.930 0.034 272'], dark: ['0.585 0.233 277', '0.969 0.016 274', '0.270 0.105 281'] },
  { id: 'violet', name: 'Violet', color: '#7c3aed', light: ['0.541 0.281 293', '0.985 0 0', '0.943 0.029 294'], dark: ['0.606 0.250 293', '0.977 0.014 292', '0.283 0.124 292'] },
  { id: 'purple', name: 'Purple', color: '#9333ea', light: ['0.558 0.288 302', '0.985 0 0', '0.946 0.033 307'], dark: ['0.627 0.265 304', '0.977 0.014 308', '0.291 0.112 305'] },
  { id: 'fuchsia', name: 'Fuchsia', color: '#c026d3', light: ['0.591 0.293 323', '0.985 0 0', '0.952 0.037 318'], dark: ['0.667 0.295 322', '0.977 0.017 320', '0.293 0.100 325'] },
  { id: 'pink', name: 'Rose Pink', color: '#db2777', light: ['0.592 0.249 0', '0.985 0 0', '0.948 0.028 342'], dark: ['0.656 0.241 354', '0.971 0.014 343', '0.284 0.091 356'] },
  { id: 'rose', name: 'Rose', color: '#e11d48', light: ['0.586 0.253 17', '0.985 0 0', '0.941 0.030 12'], dark: ['0.645 0.246 16', '0.969 0.015 12', '0.271 0.105 12'] },
  { id: 'coffee', name: 'Coffee', color: '#92400e', light: ['0.428 0.117 46', '0.985 0 0', '0.952 0.030 63'], dark: ['0.680 0.148 56', '0.978 0.018 62', '0.270 0.052 48'] },
];

export const FONT_OPTIONS = [
  ['Geist', 'Geist'], ['Inter', 'Inter'], ['Roboto', 'Roboto'], ['Open Sans', 'Open Sans'],
  ['Lato', 'Lato'], ['Montserrat', 'Montserrat'], ['Poppins', 'Poppins'], ['Nunito', 'Nunito'],
  ['Raleway', 'Raleway'], ['Ubuntu', 'Ubuntu'], ['Manrope', 'Manrope'], ['DM Sans', 'DM Sans'],
  ['Plus Jakarta Sans', 'Plus Jakarta Sans'], ['Work Sans', 'Work Sans'], ['Outfit', 'Outfit'],
  ['Rubik', 'Rubik'], ['Mulish', 'Mulish'], ['Barlow', 'Barlow'], ['Figtree', 'Figtree'],
  ['Source Sans 3', 'Source Sans 3'], ['Merriweather', 'Merriweather'], ['Playfair Display', 'Playfair Display'],
  ['Roboto Slab', 'Roboto Slab'], ['JetBrains Mono', 'JetBrains Mono'],
].map(([id, name]) => ({ id, name }));

const getStored = (key, fallback) => {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getStored('theme', 'system'));
  const [preset, setPreset] = useState(() => getStored('theme-preset', 'default'));
  const [font, setFont] = useState(() => getStored('dashboard-font', 'Geist'));

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
      root.classList.toggle('dark', resolved === 'dark');
      root.classList.toggle('light', resolved === 'light');
      root.dataset.themePreset = preset;
      const selected = THEME_PRESETS.find(item => item.id === preset) || THEME_PRESETS[0];
      const colors = resolved === 'dark' ? selected.dark : selected.light;
      root.style.setProperty('--primary', `oklch(${colors[0]})`);
      root.style.setProperty('--primary-foreground', `oklch(${colors[1]})`);
      root.style.setProperty('--accent', `oklch(${colors[2]})`);
      root.style.setProperty('--ring', `oklch(${colors[0]})`);
      root.style.setProperty('--sidebar-primary', `oklch(${colors[0]})`);
    };
    apply();
    localStorage.setItem('theme', theme);
    localStorage.setItem('theme-preset', preset);
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme, preset]);

  useEffect(() => {
    const root = document.documentElement;
    const oldLink = document.getElementById('dashboard-google-font');
    if (oldLink) oldLink.remove();
    if (font !== 'Geist') {
      const link = document.createElement('link');
      link.id = 'dashboard-google-font';
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${font.replaceAll(' ', '+')}:wght@300;400;500;600;700;800&display=swap`;
      document.head.appendChild(link);
    }
    root.style.setProperty('--dashboard-font', `'${font}', system-ui, sans-serif`);
    localStorage.setItem('dashboard-font', font);
  }, [font]);

  const restoreDefaults = () => { setTheme('system'); setPreset('default'); setFont('Geist'); };

  return <ThemeContext.Provider value={{ theme, setTheme, preset, setPreset, font, setFont, restoreDefaults }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
