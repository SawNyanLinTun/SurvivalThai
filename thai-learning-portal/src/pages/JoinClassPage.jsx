import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function JoinClassPage() {
  const navigate = useNavigate();
  const { joinClass, refreshProfile, signOut } = useAuth();
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) {
      setError(t('common.error'));
      return;
    }

    setError('');
    setSubmitting(true);
    const { error } = await joinClass(code);
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    await refreshProfile();
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-thai-blue mb-2">
                {t('auth.joinClassTitle')}
              </h1>
              <p className="text-gray-600">{t('auth.joinClassHint')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('auth.classCode')}
                type="text"
                placeholder="ABC123"
                required
                error={error}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? t('common.loading') : t('auth.joinButton')}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-300 text-center">
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:underline"
              >
                {t('dashboard.logout')}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
