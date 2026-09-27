import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'my' ? 'en' : 'my';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="
        bg-white text-thai-blue px-4 py-2 rounded-lg font-semibold
        hover:bg-gray-100 transition-colors duration-200
      "
    >
      {i18n.language === 'my' ? 'English' : 'မြန်မာ'}
    </button>
  );
}
