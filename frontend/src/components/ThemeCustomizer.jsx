import React, { useRef } from 'react';
import {
  Palette,
  X,
  RotateCcw,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Type,
  Sparkles,
  Layers,
  Check,
  ChevronRight,
  Sliders,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  THEME_PRESETS,
  DEFAULT_THEME,
  FONT_FAMILIES,
  HEADER_FONT_SIZES,
  QUESTION_FONT_SIZES,
  DESCRIPTION_FONT_SIZES,
  CARD_RADII,
  CARD_SHADOWS,
  BUTTON_STYLES,
  QUICK_COLOR_PALETTES,
} from '../lib/themePresets';

const ThemeCustomizer = ({
  theme,
  setTheme,
  onClose,
  onReset,
  onSave,
  saving = false,
  hasChanges = false,
  saveStatus = null,
}) => {
  const fileInputRef = useRef(null);

  // Apply a preset
  const handleSelectPreset = (preset) => {
    setTheme((prev) => ({
      ...prev,
      preset: preset.preset,
      primaryColor: preset.primaryColor,
      backgroundColor: preset.backgroundColor,
      cardColor: preset.cardColor,
      textColor: preset.textColor,
      fontFamily: preset.fontFamily,
      headerFontSize: preset.headerFontSize,
      questionFontSize: preset.questionFontSize,
      descriptionFontSize: preset.descriptionFontSize,
      cardRadius: preset.cardRadius,
      cardShadow: preset.cardShadow,
      buttonStyle: preset.buttonStyle,
      headerImage: prev.headerImage || null,
    }));
  };

  // Handle local header image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large (max 10MB).');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setTheme((prev) => ({
      ...prev,
      headerImage: {
        url: localUrl,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2),
      },
      preset: 'custom',
    }));
  };

  // Remove header image
  const handleRemoveImage = () => {
    if (theme.headerImage?.url) {
      URL.revokeObjectURL(theme.headerImage.url);
    }
    setTheme((prev) => ({
      ...prev,
      headerImage: null,
      preset: 'custom',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generic theme updater
  const updateTheme = (key, value) => {
    setTheme((prev) => ({
      ...prev,
      [key]: value,
      preset: 'custom', // Mark as custom when manual override occurs
    }));
  };

  const activePreset = theme.preset || theme.activePreset;
  const currentRadius = theme.cardRadius || theme.borderRadius;
  const currentShadow = theme.cardShadow || theme.shadow;

  return (
    <aside className="w-full md:w-96 bg-white border-l border-slate-200/90 flex flex-col h-full shadow-2xl z-30 transition-all">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 leading-none">
              Theme Options
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Customize appearance & preview live
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 text-xs text-slate-500 hover:text-slate-900 px-2"
            title="Reset to default theme"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              aria-label="Close theme sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Customization Controls */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-7 text-xs">
        {/* SECTION A: THEME PRESETS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Theme Presets
            </Label>
            <span className="text-[10px] text-slate-400">8 Curated Styles</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {THEME_PRESETS.map((preset) => {
              const isSelected = activePreset === preset.preset;
              return (
                <button
                  key={preset.preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`group relative text-left p-2.5 rounded-xl border transition-all text-xs ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                  }`}
                >
                  {/* Swatch Preview Bar */}
                  <div
                    className="h-10 w-full rounded-lg mb-2 p-1.5 border flex items-end justify-between shadow-2xs overflow-hidden relative"
                    style={{ backgroundColor: preset.swatch.bg }}
                  >
                    <div
                      className="w-10 h-5 rounded border shadow-2xs flex items-center justify-center"
                      style={{ backgroundColor: preset.swatch.card }}
                    >
                      <div
                        className="w-4 h-1.5 rounded-full"
                        style={{ backgroundColor: preset.swatch.accent }}
                      />
                    </div>
                    <div
                      className="h-2.5 w-2.5 rounded-full shadow-2xs"
                      style={{ backgroundColor: preset.swatch.accent }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{preset.name}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION B: HEADER IMAGE BANNER */}
        <section className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <Label className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              Header Image
            </Label>
            {theme.headerImage && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                Uploaded
              </Badge>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          {theme.headerImage ? (
            <div className="space-y-2.5">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
                <img
                  src={theme.headerImage.url}
                  alt="Header Banner Preview"
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs bg-white/90 hover:bg-white text-slate-900"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="truncate max-w-[180px]">{theme.headerImage.name}</span>
                <span>{theme.headerImage.size} MB</span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30 group"
            >
              <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 mx-auto mb-1.5 transition-colors" />
              <p className="font-semibold text-slate-700 text-xs">
                Choose header banner image
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG, WEBP up to 10MB (Local preview)
              </p>
            </div>
          )}
        </section>

        {/* SECTION C: COLORS */}
        <section className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <Label className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              Colors
            </Label>
            <span className="text-[10px] text-slate-400">Hex & Palettes</span>
          </div>

          {/* Quick Color Palette Shortcuts for Primary */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-600 block">
              Quick Theme Palettes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_COLOR_PALETTES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateTheme('primaryColor', color)}
                  className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${
                    theme.primaryColor === color ? 'scale-125 ring-2 ring-indigo-500/50 shadow-xs' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Select ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Color 1: Primary Accent */}
          <div className="flex items-center justify-between bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800 text-xs">Theme / Primary Color</p>
              <p className="text-[10px] text-slate-400">Buttons, focus rings & accents</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono text-slate-600 uppercase">
                {theme.primaryColor}
              </span>
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => updateTheme('primaryColor', e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0 bg-transparent"
              />
            </div>
          </div>

          {/* Color 2: Background Canvas */}
          <div className="flex items-center justify-between bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800 text-xs">Background Color</p>
              <p className="text-[10px] text-slate-400">Page canvas behind form</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono text-slate-600 uppercase">
                {theme.backgroundColor}
              </span>
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0 bg-transparent"
              />
            </div>
          </div>

          {/* Color 3: Form Card Surface */}
          <div className="flex items-center justify-between bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800 text-xs">Form Card Color</p>
              <p className="text-[10px] text-slate-400">Surface of questions card</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono text-slate-600 uppercase">
                {theme.cardColor}
              </span>
              <input
                type="color"
                value={theme.cardColor}
                onChange={(e) => updateTheme('cardColor', e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0 bg-transparent"
              />
            </div>
          </div>

          {/* Color 4: Text Color */}
          <div className="flex items-center justify-between bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800 text-xs">Text & Heading Color</p>
              <p className="text-[10px] text-slate-400">Question labels & headings</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono text-slate-600 uppercase">
                {theme.textColor}
              </span>
              <input
                type="color"
                value={theme.textColor}
                onChange={(e) => updateTheme('textColor', e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0 bg-transparent"
              />
            </div>
          </div>
        </section>

        {/* SECTION D: TYPOGRAPHY */}
        <section className="space-y-3.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <Label className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Type className="w-3.5 h-3.5 text-emerald-500" />
              Typography
            </Label>
          </div>

          {/* Font Family Selection */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-slate-700">Font Family</Label>
            <select
              value={theme.fontFamily}
              onChange={(e) => updateTheme('fontFamily', e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium cursor-pointer"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Header Font Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-slate-700">Header Size</Label>
              <span className="text-[10px] font-mono text-slate-400">{theme.headerFontSize}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {HEADER_FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => updateTheme('headerFontSize', size.value)}
                  className={`py-1.5 rounded-lg border text-center transition font-semibold text-[11px] ${
                    theme.headerFontSize === size.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {size.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Question Font Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-slate-700">Question Size</Label>
              <span className="text-[10px] font-mono text-slate-400">{theme.questionFontSize}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {QUESTION_FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => updateTheme('questionFontSize', size.value)}
                  className={`py-1.5 rounded-lg border text-center transition font-semibold text-[11px] ${
                    theme.questionFontSize === size.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {size.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Description Font Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-slate-700">Description Size</Label>
              <span className="text-[10px] font-mono text-slate-400">{theme.descriptionFontSize}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {DESCRIPTION_FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => updateTheme('descriptionFontSize', size.value)}
                  className={`py-1.5 rounded-lg border text-center transition font-semibold text-[11px] ${
                    theme.descriptionFontSize === size.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {size.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION E: FORM APPEARANCE */}
        <section className="space-y-3.5 pt-3 border-t border-slate-100 pb-2">
          <div className="flex items-center justify-between">
            <Label className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              Form Appearance
            </Label>
          </div>

          {/* Card Corner Radius */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-slate-700">Card Corner Radius</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {CARD_RADII.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => updateTheme('cardRadius', r.value)}
                  className={`py-1.5 rounded-lg border text-center transition font-semibold text-[11px] ${
                    currentRadius === r.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {r.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Card Shadow */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-slate-700">Card Shadow</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {CARD_SHADOWS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => updateTheme('cardShadow', s.value)}
                  className={`py-1.5 rounded-lg border text-center transition font-semibold text-[11px] ${
                    currentShadow === s.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button Style */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-slate-700">Submit Button Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {BUTTON_STYLES.map((btn) => (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => updateTheme('buttonStyle', btn.value)}
                  className={`p-2 rounded-xl border text-left transition ${
                    theme.buttonStyle === btn.value
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-800">{btn.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{btn.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Save Action Bar at the Bottom */}
      {onSave && (
        <div className="p-4 border-t border-slate-200 bg-slate-50/90 shrink-0 space-y-2">
          {saveStatus && (
            <div
              className={`p-2 rounded-lg text-xs flex items-center gap-1.5 animate-in fade-in ${
                saveStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {saveStatus.type === 'success' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              )}
              <span className="truncate">{saveStatus.message}</span>
            </div>
          )}

          <Button
            type="button"
            onClick={onSave}
            disabled={saving || !hasChanges}
            className={`w-full h-9 font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 ${
              hasChanges
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed hover:bg-slate-200'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Theme...</span>
              </>
            ) : hasChanges ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Theme</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Theme Saved</span>
              </>
            )}
          </Button>
        </div>
      )}
    </aside>
  );
};

export default ThemeCustomizer;
