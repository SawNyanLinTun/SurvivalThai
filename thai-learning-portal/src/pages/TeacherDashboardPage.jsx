import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

function defaultEndDate() {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 10);
}

function emptyForm() {
  return { name: '', level: 'beginner', endDate: defaultEndDate(), published: true };
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, profile, signOut } = useAuth();

  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const [expandedClassId, setExpandedClassId] = useState(null);
  const [roster, setRoster] = useState({});
  const [regeneratingId, setRegeneratingId] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setClassesLoading(true);
    setClassesError('');
    const { data, error } = await supabase
      .from('classes')
      .select('id, name, level, join_code, published, end_date, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setClassesError(error.message);
    } else {
      setClasses(data ?? []);
    }
    setClassesLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.endDate) {
      setCreateError(t('common.error'));
      return;
    }

    setCreateError('');
    setCreating(true);
    const { data, error } = await supabase
      .from('classes')
      .insert({
        teacher_id: user.id,
        name: form.name,
        level: form.level,
        end_date: form.endDate,
        published: form.published,
      })
      .select('id, name, level, join_code, published, end_date, created_at')
      .single();
    setCreating(false);

    if (error) {
      setCreateError(error.message);
      return;
    }

    setClasses((prev) => [data, ...prev]);
    setForm(emptyForm());
    setShowCreate(false);
  };

  const handleRegenerate = async (classId) => {
    setRegeneratingId(classId);
    const { data, error } = await supabase.rpc('regenerate_join_code', {
      p_class_id: classId,
    });
    setRegeneratingId(null);

    if (error) {
      setClassesError(error.message);
      return;
    }
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, join_code: data } : c))
    );
  };

  const toggleRoster = async (classId) => {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
      return;
    }
    setExpandedClassId(classId);
    if (roster[classId]) return;

    setRoster((prev) => ({ ...prev, [classId]: { loading: true, error: '', students: [] } }));
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, progress, last_active')
      .eq('class_id', classId)
      .eq('role', 'student')
      .order('full_name');

    setRoster((prev) => ({
      ...prev,
      [classId]: { loading: false, error: error?.message ?? '', students: data ?? [] },
    }));
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isMy = i18n.language === 'my';

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      <Header />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className={`text-4xl font-bold text-thai-blue mb-2 ${isMy ? 'font-myanmar' : ''}`}>
              {t('teacher.welcome')}, {profile?.full_name || user.email}! 👋
            </h1>
            <p className="text-gray-600">{t('teacher.subtitle')}</p>
          </div>
          <Button onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? t('common.cancel') : t('teacher.createClass')}
          </Button>
        </div>

        {showCreate && (
          <Card className="mb-8">
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label={t('teacher.className')}
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <div className="mb-4">
                <label className="block text-dark-text font-medium mb-2">
                  {t('teacher.level')}
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-thai-blue"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {t(`courses.${level}`)}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label={t('teacher.endDate')}
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />

              <label className="flex items-center gap-2 text-dark-text">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                {t('teacher.published')}
              </label>

              {createError && <p className="text-thai-red text-sm">{createError}</p>}

              <Button type="submit" disabled={creating}>
                {creating ? t('common.loading') : t('teacher.createButton')}
              </Button>
            </form>
          </Card>
        )}

        {classesError && <p className="text-thai-red mb-4">{classesError}</p>}

        {classesLoading ? (
          <p className="text-gray-600">{t('common.loading')}</p>
        ) : classes.length === 0 ? (
          <p className="text-gray-600 mb-12">{t('teacher.noClasses')}</p>
        ) : (
          <div className="space-y-4 mb-12">
            {classes.map((cls) => (
              <Card key={cls.id}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-thai-blue mb-1">{cls.name}</h3>
                    <p className="text-gray-600 text-sm">{t(`courses.${cls.level}`)}</p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        cls.published
                          ? 'bg-thai-green bg-opacity-20 text-thai-green'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {cls.published ? t('teacher.publishedBadge') : t('teacher.unpublishedBadge')}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">{t('teacher.joinCode')}</p>
                    <p className="text-2xl font-mono font-bold text-thai-blue tracking-widest">
                      {cls.join_code}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRegenerate(cls.id)}
                      disabled={regeneratingId === cls.id}
                      className="text-sm text-thai-blue hover:underline mt-1"
                    >
                      {regeneratingId === cls.id
                        ? t('common.loading')
                        : t('teacher.regenerateCode')}
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggleRoster(cls.id)}
                    className="text-sm text-thai-blue font-semibold hover:underline"
                  >
                    {expandedClassId === cls.id ? t('teacher.hideRoster') : t('teacher.viewRoster')}
                  </button>

                  {expandedClassId === cls.id && (
                    <div className="mt-4">
                      {roster[cls.id]?.loading ? (
                        <p className="text-gray-600 text-sm">{t('common.loading')}</p>
                      ) : roster[cls.id]?.error ? (
                        <p className="text-thai-red text-sm">{roster[cls.id].error}</p>
                      ) : roster[cls.id]?.students.length === 0 ? (
                        <p className="text-gray-600 text-sm">{t('teacher.noStudents')}</p>
                      ) : (
                        <div className="space-y-2">
                          {roster[cls.id].students.map((s) => (
                            <div
                              key={s.id}
                              className="flex flex-wrap justify-between items-center gap-2 text-sm border-b border-gray-100 pb-2"
                            >
                              <span className="text-dark-text font-medium">
                                {s.full_name || s.email}
                              </span>
                              <span className="text-gray-500">{s.email}</span>
                              <span className="text-thai-blue font-semibold">{s.progress}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Button variant="danger" onClick={handleLogout}>
            {t('dashboard.logout')}
          </Button>
        </div>
      </div>
    </div>
  );
}
