import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import { FONTS, PRESETS, THEME_FIELDS, isValidHex, pickColors } from '../theme/themes';
import { useTheme } from '../theme/ThemeContext';

function ColorRow({ field, value, onChange }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const handleText = (e) => {
    let next = e.target.value.trim();
    if (next && !next.startsWith('#')) next = `#${next}`;
    setDraft(next);
    if (isValidHex(next)) onChange(next.toUpperCase());
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        aria-label={t(`theme.fields.${field}`)}
        className="h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-primary-100 bg-surface p-1"
      />
      <span className="flex-1 text-sm font-semibold text-ink">{t(`theme.fields.${field}`)}</span>
      <input
        type="text"
        value={draft}
        onChange={handleText}
        maxLength={7}
        spellCheck={false}
        aria-label={`${t(`theme.fields.${field}`)} hex`}
        className="w-24 rounded-lg border border-primary-100 bg-page px-2 py-1.5 font-mono text-xs uppercase text-ink focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
      />
    </div>
  );
}

export default function ThemePicker({ onDark = false }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  const base = PRESETS.find((p) => p.id === theme.preset) || PRESETS[0];
  const customized = THEME_FIELDS.some((k) => base[k].toUpperCase() !== theme[k].toUpperCase());

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const choosePreset = (preset) => setTheme({ ...theme, preset: preset.id, ...pickColors(preset) });
  const setColor = (field, value) => setTheme({ ...theme, [field]: value });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t('theme.button')}
        aria-label={t('theme.button')}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          onDark ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
        }`}
      >
        <Icon name="swatch" />
      </button>

      {/* Portal: the sticky header's backdrop-blur would otherwise trap this fixed overlay */}
      {open && createPortal(
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-title"
            className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface text-ink shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-primary-100 bg-surface px-6 py-5">
              <div>
                <h2 id="theme-title" className="text-xl font-extrabold">{t('theme.title')}</h2>
                <p className="mt-1 text-sm text-ink-muted">{t('theme.subtitle')}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('theme.close')}
                className="rounded-full p-2 text-ink-muted hover:bg-primary-50 hover:text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="space-y-8 px-6 py-6">
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-muted">{t('theme.presets')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PRESETS.map((p) => {
                    const active = p.id === theme.preset && !customized;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => choosePreset(p)}
                        aria-pressed={active}
                        className={`rounded-2xl border-2 p-3 text-left transition-all ${
                          active ? 'border-primary-500 ring-4 ring-primary-100' : 'border-primary-100 hover:border-primary-300'
                        }`}
                      >
                        <span className="flex h-6 overflow-hidden rounded-md ring-1 ring-black/5">
                          {['primary', 'accent', 'highlight', 'success', 'background'].map((k) => (
                            <span key={k} className="flex-1" style={{ background: p[k] }} />
                          ))}
                        </span>
                        <span className="mt-2 block text-sm font-bold text-ink">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">{t('theme.custom')}</h3>
                  {customized && (
                    <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-semibold text-accent-700">
                      {t('theme.customized')} · {base.name}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {THEME_FIELDS.map((f) => (
                    <ColorRow key={f} field={f} value={theme[f]} onChange={(v) => setColor(f, v)} />
                  ))}
                </div>
              </section>

              <section>
                <label htmlFor="theme-font" className="mb-3 block text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {t('theme.font')}
                </label>
                <select
                  id="theme-font"
                  value={theme.font}
                  onChange={(e) => setTheme({ ...theme, font: e.target.value })}
                  className="w-full rounded-xl border-2 border-primary-100 bg-surface px-3 py-2.5 text-ink focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                  ))}
                </select>
              </section>

              <button
                type="button"
                onClick={() => choosePreset(base)}
                disabled={!customized}
                className="w-full rounded-xl border-2 border-primary-200 px-4 py-2.5 font-semibold text-primary-700 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('theme.reset')}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
