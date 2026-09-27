import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'my', label: 'မြန်မာ' },
  { code: 'en', label: 'EN' },
];

export default function LanguageToggle({ onDark = false }) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex rounded-full p-1 text-sm font-semibold ${onDark ? 'bg-white/15' : 'bg-orchid-50'}`}
    >
      {languages.map(({ code, label }) => {
        const active = i18n.language === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => changeLanguage(code)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 transition-colors duration-200 ${
              active
                ? 'bg-white text-orchid-700 shadow-sm'
                : onDark
                  ? 'text-white/80 hover:text-white'
                  : 'text-ink-muted hover:text-orchid-700'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
