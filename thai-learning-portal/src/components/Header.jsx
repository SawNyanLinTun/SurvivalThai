import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="bg-thai-blue text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">🎓 SurvivalThai</div>
        <LanguageToggle />
      </div>
    </header>
  );
}
