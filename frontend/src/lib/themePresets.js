/**
 * Theme Presets and Configuration Schema for Custom Form Builder
 * 
 * Standard 13-property theme data structure:
 *  1. preset: 'minimal' | 'modern' | 'professional' | 'creative' | 'dark' | 'pastel' | 'elegant' | 'nature' | 'custom'
 *  2. primaryColor: string (hex)
 *  3. backgroundColor: string (hex)
 *  4. cardColor: string (hex)
 *  5. textColor: string (hex)
 *  6. fontFamily: string (CSS font-family)
 *  7. headerFontSize: string (e.g. '28px')
 *  8. questionFontSize: string (e.g. '14px')
 *  9. descriptionFontSize: string (e.g. '13px')
 * 10. cardRadius: string (e.g. '12px')
 * 11. cardShadow: 'none' | 'sm' | 'md' | 'xl'
 * 12. buttonStyle: 'solid' | 'gradient' | 'pill' | 'outline'
 * 13. headerImage: null | { url: string, name: string, size: string | number }
 */

export const THEME_SCHEMA_KEYS = [
  'preset',
  'primaryColor',
  'backgroundColor',
  'cardColor',
  'textColor',
  'fontFamily',
  'headerFontSize',
  'questionFontSize',
  'descriptionFontSize',
  'cardRadius',
  'cardShadow',
  'buttonStyle',
  'headerImage',
];

export const THEME_PRESETS = [
  {
    preset: 'minimal',
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean white canvas with subtle lines & focus accents',
    primaryColor: '#2563EB',
    backgroundColor: '#F8FAFC',
    cardColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: "'Inter', sans-serif",
    headerFontSize: '28px',
    questionFontSize: '14px',
    descriptionFontSize: '13px',
    cardRadius: '12px',
    cardShadow: 'sm',
    buttonStyle: 'solid',
    headerImage: null,
    swatch: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      accent: '#2563EB',
      text: '#0F172A',
    },
  },
  {
    preset: 'modern',
    id: 'modern',
    name: 'Modern',
    description: 'Deep violet ambient glow with electric purple accents',
    primaryColor: '#8B5CF6',
    backgroundColor: '#0F172A',
    cardColor: '#1E293B',
    textColor: '#F8FAFC',
    fontFamily: "'Poppins', sans-serif",
    headerFontSize: '32px',
    questionFontSize: '15px',
    descriptionFontSize: '14px',
    cardRadius: '16px',
    cardShadow: 'xl',
    buttonStyle: 'gradient',
    headerImage: null,
    swatch: {
      bg: '#0F172A',
      card: '#1E293B',
      accent: '#8B5CF6',
      text: '#F8FAFC',
    },
  },
  {
    preset: 'professional',
    id: 'professional',
    name: 'Professional',
    description: 'Corporate cool slate with deep teal accents',
    primaryColor: '#0F766E',
    backgroundColor: '#F1F5F9',
    cardColor: '#FFFFFF',
    textColor: '#1E293B',
    fontFamily: "'Roboto', sans-serif",
    headerFontSize: '26px',
    questionFontSize: '14px',
    descriptionFontSize: '13px',
    cardRadius: '8px',
    cardShadow: 'md',
    buttonStyle: 'solid',
    headerImage: null,
    swatch: {
      bg: '#F1F5F9',
      card: '#FFFFFF',
      accent: '#0F766E',
      text: '#1E293B',
    },
  },
  {
    preset: 'creative',
    id: 'creative',
    name: 'Creative',
    description: 'Warm peach glow with vibrant sunset coral accents',
    primaryColor: '#F97316',
    backgroundColor: '#FFF7ED',
    cardColor: '#FFFFFF',
    textColor: '#431407',
    fontFamily: "'Poppins', sans-serif",
    headerFontSize: '30px',
    questionFontSize: '15px',
    descriptionFontSize: '13px',
    cardRadius: '24px',
    cardShadow: 'xl',
    buttonStyle: 'gradient',
    headerImage: null,
    swatch: {
      bg: '#FFF7ED',
      card: '#FFFFFF',
      accent: '#F97316',
      text: '#431407',
    },
  },
  {
    preset: 'dark',
    id: 'dark',
    name: 'Dark',
    description: 'Stealth midnight background with neon cyan highlights',
    primaryColor: '#38BDF8',
    backgroundColor: '#090D16',
    cardColor: '#131B2E',
    textColor: '#F1F5F9',
    fontFamily: "'Inter', sans-serif",
    headerFontSize: '28px',
    questionFontSize: '14px',
    descriptionFontSize: '13px',
    cardRadius: '12px',
    cardShadow: 'xl',
    buttonStyle: 'solid',
    headerImage: null,
    swatch: {
      bg: '#090D16',
      card: '#131B2E',
      accent: '#38BDF8',
      text: '#F1F5F9',
    },
  },
  {
    preset: 'pastel',
    id: 'pastel',
    name: 'Pastel',
    description: 'Soft lavender-rose mist with bubblegum pink pills',
    primaryColor: '#EC4899',
    backgroundColor: '#FDF2F8',
    cardColor: '#FFFFFF',
    textColor: '#4A044E',
    fontFamily: "'Poppins', sans-serif",
    headerFontSize: '32px',
    questionFontSize: '15px',
    descriptionFontSize: '14px',
    cardRadius: '28px',
    cardShadow: 'md',
    buttonStyle: 'pill',
    headerImage: null,
    swatch: {
      bg: '#FDF2F8',
      card: '#FFFFFF',
      accent: '#EC4899',
      text: '#4A044E',
    },
  },
  {
    preset: 'elegant',
    id: 'elegant',
    name: 'Elegant',
    description: 'Warm linen ivory with bronze serif typography',
    primaryColor: '#92400E',
    backgroundColor: '#FAF7F2',
    cardColor: '#FFFFFF',
    textColor: '#292524',
    fontFamily: "'Playfair Display', serif",
    headerFontSize: '30px',
    questionFontSize: '15px',
    descriptionFontSize: '13px',
    cardRadius: '6px',
    cardShadow: 'sm',
    buttonStyle: 'outline',
    headerImage: null,
    swatch: {
      bg: '#FAF7F2',
      card: '#FFFFFF',
      accent: '#92400E',
      text: '#292524',
    },
  },
  {
    preset: 'nature',
    id: 'nature',
    name: 'Nature',
    description: 'Botanical mint tones with lush forest emerald accents',
    primaryColor: '#16A34A',
    backgroundColor: '#F0FDF4',
    cardColor: '#FFFFFF',
    textColor: '#064E3B',
    fontFamily: "'Inter', sans-serif",
    headerFontSize: '28px',
    questionFontSize: '14px',
    descriptionFontSize: '13px',
    cardRadius: '16px',
    cardShadow: 'md',
    buttonStyle: 'solid',
    headerImage: null,
    swatch: {
      bg: '#F0FDF4',
      card: '#FFFFFF',
      accent: '#16A34A',
      text: '#064E3B',
    },
  },
];

export const DEFAULT_THEME = {
  preset: 'minimal',
  primaryColor: '#2563EB',
  backgroundColor: '#F8FAFC',
  cardColor: '#FFFFFF',
  textColor: '#0F172A',
  fontFamily: "'Inter', sans-serif",
  headerFontSize: '28px',
  questionFontSize: '14px',
  descriptionFontSize: '13px',
  cardRadius: '12px',
  cardShadow: 'sm',
  buttonStyle: 'solid',
  headerImage: null,
};

/**
 * Normalizes and validates a theme configuration object, ensuring
 * all 13 core keys are populated with standard fallbacks.
 */
export const sanitizeTheme = (incomingTheme = {}) => {
  return {
    preset: incomingTheme.preset || incomingTheme.activePreset || DEFAULT_THEME.preset,
    primaryColor: incomingTheme.primaryColor || DEFAULT_THEME.primaryColor,
    backgroundColor: incomingTheme.backgroundColor || DEFAULT_THEME.backgroundColor,
    cardColor: incomingTheme.cardColor || DEFAULT_THEME.cardColor,
    textColor: incomingTheme.textColor || DEFAULT_THEME.textColor,
    fontFamily: incomingTheme.fontFamily || DEFAULT_THEME.fontFamily,
    headerFontSize: incomingTheme.headerFontSize || DEFAULT_THEME.headerFontSize,
    questionFontSize: incomingTheme.questionFontSize || DEFAULT_THEME.questionFontSize,
    descriptionFontSize: incomingTheme.descriptionFontSize || DEFAULT_THEME.descriptionFontSize,
    cardRadius: incomingTheme.cardRadius || incomingTheme.borderRadius || DEFAULT_THEME.cardRadius,
    cardShadow: incomingTheme.cardShadow || incomingTheme.shadow || DEFAULT_THEME.cardShadow,
    buttonStyle: incomingTheme.buttonStyle || DEFAULT_THEME.buttonStyle,
    headerImage: incomingTheme.headerImage || null,
  };
};

export const FONT_FAMILIES = [
  { label: 'Inter (Modern Sans)', value: "'Inter', sans-serif" },
  { label: 'Poppins (Geometric)', value: "'Poppins', sans-serif" },
  { label: 'Roboto (Crisp Neutral)', value: "'Roboto', sans-serif" },
  { label: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
  { label: 'JetBrains Mono (Monospace)', value: "'JetBrains Mono', monospace" },
];

export const HEADER_FONT_SIZES = [
  { label: 'Small (22px)', value: '22px' },
  { label: 'Medium (28px)', value: '28px' },
  { label: 'Large (34px)', value: '34px' },
  { label: 'Extra Large (40px)', value: '40px' },
];

export const QUESTION_FONT_SIZES = [
  { label: 'Small (13px)', value: '13px' },
  { label: 'Medium (14px)', value: '14px' },
  { label: 'Large (16px)', value: '16px' },
];

export const DESCRIPTION_FONT_SIZES = [
  { label: 'Small (12px)', value: '12px' },
  { label: 'Medium (13px)', value: '13px' },
  { label: 'Large (14px)', value: '14px' },
];

export const CARD_RADII = [
  { label: 'Sharp (0px)', value: '0px' },
  { label: 'Subtle (8px)', value: '8px' },
  { label: 'Smooth (16px)', value: '16px' },
  { label: 'Pill (28px)', value: '28px' },
];
export const BORDER_RADII = CARD_RADII; // alias for backwards compatibility

export const CARD_SHADOWS = [
  { label: 'None', value: 'none' },
  { label: 'Subtle', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Elevated', value: 'xl' },
];
export const SHADOW_OPTIONS = CARD_SHADOWS; // alias for backwards compatibility

export const BUTTON_STYLES = [
  { label: 'Classic Solid', value: 'solid', desc: 'Flat bold accent fill' },
  { label: 'Modern Gradient', value: 'gradient', desc: 'Multi-color vibrant sheen' },
  { label: 'Rounded Pill', value: 'pill', desc: 'High radius capsule button' },
  { label: 'Clean Outline', value: 'outline', desc: 'Border with subtle hover glow' },
];

export const QUICK_COLOR_PALETTES = [
  '#2563EB', // Blue
  '#4F46E5', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#0F766E', // Teal
  '#06B6D4', // Cyan
  '#0F172A', // Slate
];
