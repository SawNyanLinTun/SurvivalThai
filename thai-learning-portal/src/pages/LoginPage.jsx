import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) newErrors.email = t('common.error');
    if (!formData.password) newErrors.password = t('common.error');

    if (Object.keys(newErrors).length === 0) {
      localStorage.setItem('user', JSON.stringify(formData));
      navigate('/dashboard');
    } else {
      setErrors(newErrors);
    }
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
                placeholder="test@example.com"
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

              <Button type="submit" className="w-full">
                {t('auth.loginButton')}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-300 space-y-3">
              <div className="bg-thai-blue bg-opacity-10 p-4 rounded-lg">
                <p className="text-sm text-dark-text mb-2">
                  <strong>📧 Test Email:</strong> test@example.com
                </p>
                <p className="text-sm text-dark-text">
                  <strong>🔑 Password:</strong> anything
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
