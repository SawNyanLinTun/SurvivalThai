import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo';
import LanguageToggle from '../components/LanguageToggle';
import Icon from '../components/Icon';

const features = [
  { key: 'auth.feature1', icon: 'language' },
  { key: 'auth.feature2', icon: 'speaker' },
  { key: 'auth.feature3', icon: 'document' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) newErrors.email = t('auth.required');
    if (!formData.password) newErrors.password = t('auth.required');

    if (Object.keys(newErrors).length === 0) {
      localStorage.setItem('user', JSON.stringify(formData));
      navigate('/dashboard');
    } else {
      setErrors(newErrors);
    }
  };

  const fillDemo = () => {
    setFormData({ email: 'test@example.com', password: 'demo1234' });
    setErrors({});
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Hero panel */}
      <aside className="relative overflow-hidden bg-gradient-to-br from-orchid-600 via-orchid-700 to-orchid-900 px-6 pb-10 pt-6 text-white sm:px-10 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-dots absolute inset-0" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-marigold-400/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-coral-500/30 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center justify-between">
          <Logo light />
          <div className="lg:hidden">
            <LanguageToggle onDark />
          </div>
        </div>

        <div className="relative mt-10 lg:mt-0">
          <p className="font-thai text-6xl font-bold text-marigold-400 sm:text-7xl lg:text-8xl">สวัสดี</p>
          <p className="mt-1 text-sm font-medium uppercase tracking-[0.2em] text-orchid-200">sa-wat-dee</p>
          <h1 className="mt-6 max-w-md text-3xl font-extrabold leading-tight sm:text-4xl">
            {t('auth.heroTitle')}
          </h1>
          <p className="mt-3 max-w-md text-orchid-100">{t('auth.heroSubtitle')}</p>

          <ul className="mt-8 hidden space-y-3 sm:block">
            {features.map(({ key, icon }) => (
              <li key={key} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-marigold-400 ring-1 ring-white/15">
                  <Icon name={icon} />
                </span>
                <span className="font-medium">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-10 hidden text-sm text-orchid-200 lg:block">🇲🇲 → 🇹🇭 &nbsp;{t('auth.learners')}</p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col bg-cream">
        <div className="hidden justify-end p-6 lg:flex">
          <LanguageToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink">{t('auth.loginButton')}</h2>
            <p className="mt-2 text-ink-muted">{t('auth.subtitle')}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <Input
                label={t('auth.email')}
                type="email"
                icon="mail"
                autoComplete="email"
                placeholder="test@example.com"
                required
                error={errors.email}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label={t('auth.password')}
                type="password"
                icon="lock"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                error={errors.password}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              <Button type="submit" size="lg" className="w-full">
                {t('auth.loginButton')}
                <Icon name="arrowRight" />
              </Button>
            </form>

            <button
              type="button"
              onClick={fillDemo}
              className="group mt-8 flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-marigold-200 bg-marigold-100/60 p-4 text-left transition-colors hover:border-marigold-400 hover:bg-marigold-100"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-marigold-400 text-ink">
                <Icon name="sparkles" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink">{t('auth.demoTitle')}</span>
                <span className="block truncate text-sm text-ink-muted">
                  test@example.com · {t('auth.demoHint')}
                </span>
              </span>
              <Icon name="arrowRight" className="h-5 w-5 text-marigold-700 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
