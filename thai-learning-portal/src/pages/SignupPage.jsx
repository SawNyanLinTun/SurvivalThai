import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, verifySignupCode, resendSignupCode } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [code, setCode] = useState('');
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = t('common.error');
    if (!formData.email) newErrors.email = t('common.error');
    if (!formData.password) newErrors.password = t('common.error');
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    const { data, error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName
    );
    setSubmitting(false);

    if (error) {
      setErrors({ form: error.message });
      return;
    }

    if (data.session) {
      navigate('/dashboard');
    } else {
      setAwaitingCode(true);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) {
      setErrors({ code: t('common.error') });
      return;
    }

    setErrors({});
    setSubmitting(true);
    const { error } = await verifySignupCode(formData.email, code);
    setSubmitting(false);

    if (error) {
      setErrors({ code: error.message });
      return;
    }

    navigate('/dashboard');
  };

  const handleResend = async () => {
    setErrors({});
    setSubmitting(true);
    const { error } = await resendSignupCode(formData.email);
    setSubmitting(false);

    if (error) {
      setErrors({ code: error.message });
      return;
    }
    setResent(true);
  };

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-thai-blue mb-2">
                {awaitingCode ? t('auth.enterCodeTitle') : t('auth.signupTitle')}
              </h1>
            </div>

            {awaitingCode ? (
              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-sm text-gray-600 text-center mb-2">
                  {t('auth.enterCodeHint', { email: formData.email })}
                </p>

                <Input
                  label={t('auth.code')}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  required
                  error={errors.code}
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                />

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? t('common.loading') : t('auth.verifyButton')}
                </Button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={submitting}
                  className="w-full text-sm text-thai-blue hover:underline"
                >
                  {resent ? t('auth.codeResent') : t('auth.resendCode')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t('auth.fullName')}
                  type="text"
                  required
                  error={errors.fullName}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />

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

                <Input
                  label={t('auth.confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  required
                  error={errors.confirmPassword}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                />

                {errors.form && (
                  <p className="text-thai-red text-sm">{errors.form}</p>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? t('common.loading') : t('auth.signupButton')}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-300 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.haveAccount')}{' '}
                <Link to="/" className="text-thai-blue font-semibold hover:underline">
                  {t('auth.loginButton')}
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
