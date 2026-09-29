import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) newErrors.email = t('common.error');
    if (!formData.password) newErrors.password = t('common.error');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    const { error } = await signIn(formData.email, formData.password);
    setSubmitting(false);

    if (error) {
      setErrors({ form: error.message });
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-thai-blue mb-2">
                {t('auth.login')}
              </h1>
              <p className="text-gray-600">{t('auth.features')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('auth.email')}
                type="email"
                placeholder="you@example.com"
                required
                error={errors.email}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label={t('auth.password')}
                type="password"
                placeholder="••••••••"
                required
                error={errors.password}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              {errors.form && (
                <p className="text-thai-red text-sm">{errors.form}</p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? t('common.loading') : t('auth.loginButton')}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-300 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.noAccount')}{' '}
                <Link to="/signup" className="text-thai-blue font-semibold hover:underline">
                  {t('auth.signup')}
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
