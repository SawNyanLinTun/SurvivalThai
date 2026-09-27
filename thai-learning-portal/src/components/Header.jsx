import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';
import Logo from './Logo';
import Icon from './Icon';

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const name = user?.email?.split('@')[0];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-orchid-100/70 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          {user && (
            <>
              <div className="hidden items-center gap-2 border-l border-orchid-100 pl-3 sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-marigold-200 font-bold uppercase text-marigold-700">
                  {name?.[0] || '?'}
                </span>
                <span className="max-w-[10rem] truncate text-sm font-semibold text-ink">{name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title={t('dashboard.logout')}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-ink-muted transition-colors hover:bg-coral-100 hover:text-coral-700"
              >
                <Icon name="logout" />
                <span className="hidden md:inline">{t('dashboard.logout')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
