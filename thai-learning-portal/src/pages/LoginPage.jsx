import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo';
import LanguageToggle from '../components/LanguageToggle';
import Icon from '../components/Icon';
import ThemePicker from '../components/ThemePicker';
import { useAuth } from '../auth/AuthContext';
import { homeFor } from '../auth/helpers';

const roles = [
  { id: 'student', icon: 'student' },
  { id: 'teacher', icon: 'teacher' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const features = [
  { key: 'auth.feature1', icon: 'language' },
  { key: 'auth.feature2', icon: 'speaker' },
  { key: 'auth.feature3', icon: 'document' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn, joinClass, notice, clearNotice } = useAuth();
  const [role, setRole] = useState('student');
  const [mode, setMode] = useState('login'); // 'login' | 'join' (students only)
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', joinCode: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const joining = role === 'student' && mode === 'join';
  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  const chooseRole = (id) => {
    setRole(id);
    setMode('login');
    setFormError(null);
    clearNotice();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) newErrors.email = t('auth.required');
    else if (!EMAIL_PATTERN.test(formData.email)) newErrors.email = t('auth.invalidEmail');
    if (!formData.password) newErrors.password = t('auth.required');
    if (joining) {
      if (!formData.fullName.trim()) newErrors.fullName = t('auth.required');
      if (!/^[A-Za-z0-9]{6}$/.test(formData.joinCode.trim())) newErrors.joinCode = t('auth.errors.invalid_code');
      if (formData.password && formData.password.length < 8) newErrors.password = t('auth.errors.weak_password');
    }
    setErrors(newErrors);
    setFormError(null);
    clearNotice();
    if (Object.keys(newErrors).length) return;

    setBusy(true);
    try {
      const email = formData.email.trim();
      const profile = joining
        ? await joinClass({ joinCode: formData.joinCode.trim(), fullName: formData.fullName.trim(), email, password: formData.password })
        : await signIn({ email, password: formData.password, role });
      navigate(homeFor(profile.role));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const shownError = formError || notice;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Hero panel */}
      <aside className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-900 px-6 pb-10 pt-6 text-white sm:px-10 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-dots absolute inset-0" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-400/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-highlight-500/30 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center justify-between">
          <Logo light />
          <div className="flex items-center gap-2 lg:hidden">
            <ThemePicker onDark />
            <LanguageToggle onDark />
          </div>
        </div>

        <div className="relative mt-10 lg:mt-0">
          <p className="font-thai text-6xl font-bold text-accent-400 sm:text-7xl lg:text-8xl">สวัสดี</p>
          <p className="mt-1 text-sm font-medium uppercase tracking-[0.2em] text-white/70">sa-wat-dee</p>
          <h1 className="mt-6 max-w-md text-3xl font-extrabold leading-tight sm:text-4xl">
            {t('auth.heroTitle')}
          </h1>
          <p className="mt-3 max-w-md text-white/80">{t('auth.heroSubtitle')}</p>

          <ul className="mt-8 hidden space-y-3 sm:block">
            {features.map(({ key, icon }) => (
              <li key={key} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-400 ring-1 ring-white/15">
                  <Icon name={icon} />
                </span>
                <span className="font-medium">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-10 hidden text-sm text-white/70 lg:block">🇲🇲 → 🇹🇭 &nbsp;{t('auth.learners')}</p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col bg-page">
        <div className="hidden items-center justify-end gap-3 p-6 lg:flex">
          <ThemePicker />
          <LanguageToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink">
              {joining ? t('auth.joinTitle') : t('auth.loginButton')}
            </h2>
            <p className="mt-2 text-ink-muted">{joining ? t('auth.joinSubtitle') : t('auth.subtitle')}</p>

            <fieldset className="mt-8">
              <legend className="mb-2 text-sm font-semibold text-ink">{t('auth.roleLabel')}</legend>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => {
                  const active = r.id === role;
                  return (
                    <label
                      key={r.id}
                      className={`relative flex cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 transition-all has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary-100 ${
                        active
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-primary-100 bg-surface hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.id}
                        checked={active}
                        onChange={() => chooseRole(r.id)}
                        className="sr-only"
                      />
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-primary-600 text-on-primary' : 'bg-primary-50 text-primary-700'}`}>
                        <Icon name={r.icon} />
                      </span>
                      <span className="font-bold text-ink">{t(`auth.${r.id}`)}</span>
                      <span className="text-xs leading-snug text-ink-muted">{t(`auth.${r.id}Desc`)}</span>
                      {active && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-on-primary">
                          <Icon name="check" className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {shownError && (
              <div role="alert" className="mt-6 rounded-2xl border border-highlight-200 bg-highlight-100/60 px-4 py-3 text-sm font-medium text-highlight-700">
                {t(`auth.errors.${shownError}`, { defaultValue: t('auth.errors.server_error') })}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  joining ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
                aria-hidden={!joining}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={`space-y-5 transition-opacity duration-200 ${
                      joining ? 'opacity-100 delay-100' : 'opacity-0'
                    }`}
                  >
                    <Input
                      label={t('auth.joinCode')}
                      icon="userPlus"
                      autoComplete="off"
                      placeholder="KB7Q2M"
                      maxLength={6}
                      required
                      tabIndex={joining ? undefined : -1}
                      error={errors.joinCode}
                      value={formData.joinCode}
                      onChange={(e) => setFormData({ ...formData, joinCode: e.target.value.toUpperCase() })}
                      className="font-mono uppercase tracking-[0.3em]"
                    />
                    <Input
                      label={t('auth.fullName')}
                      icon="student"
                      autoComplete="name"
                      required
                      tabIndex={joining ? undefined : -1}
                      error={errors.fullName}
                      value={formData.fullName}
                      onChange={set('fullName')}
                    />
                  </div>
                </div>
              </div>

              <Input
                label={t('auth.email')}
                type="email"
                icon="mail"
                autoComplete="email"
                placeholder="name@example.com"
                required
                error={errors.email}
                value={formData.email}
                onChange={set('email')}
              />

              <Input
                label={t('auth.password')}
                type="password"
                icon="lock"
                autoComplete={joining ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                required
                error={errors.password}
                value={formData.password}
                onChange={set('password')}
              />

              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? t('common.loading') : joining ? t('auth.joinButton') : t('auth.loginAs', { role: t(`auth.${role}`) })}
                {!busy && <Icon name="arrowRight" />}
              </Button>
            </form>

            {role === 'student' && (
              <button
                type="button"
                onClick={() => {
                  setMode(joining ? 'login' : 'join');
                  setErrors({});
                  setFormError(null);
                }}
                className="group mt-8 flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-accent-200 bg-accent-100/60 p-4 text-left transition-colors hover:border-accent-400 hover:bg-accent-100"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-400 text-on-accent">
                  <Icon name={joining ? 'lock' : 'userPlus'} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">{joining ? t('auth.haveAccount') : t('auth.newStudent')}</span>
                  <span className="block text-sm text-ink-muted">{joining ? t('auth.backToLogin') : t('auth.joinHint')}</span>
                </span>
                <Icon name="arrowRight" className="h-5 w-5 text-accent-700 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            {role === 'teacher' && <p className="mt-8 text-center text-sm text-ink-muted">{t('auth.teacherHint')}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
