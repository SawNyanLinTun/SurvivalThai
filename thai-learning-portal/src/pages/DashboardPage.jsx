import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import ProgressRing from '../components/ProgressRing';

const courses = [
  { id: 1, key: 'beginner', thai: 'ก', progress: 45, lessons: 12, color: 'primary-600', track: 'primary-100', tile: 'bg-primary-100 text-primary-700', tone: 'primary' },
  { id: 2, key: 'intermediate', thai: 'ข', progress: 20, lessons: 15, color: 'accent-500', track: 'accent-100', tile: 'bg-accent-100 text-accent-700', tone: 'accent' },
  { id: 3, key: 'advanced', thai: 'ค', progress: 0, lessons: 20, color: 'highlight-500', track: 'highlight-100', tile: 'bg-highlight-100 text-highlight-700', tone: 'highlight' },
];

const assignments = [
  { id: 1, key: 'pronunciation', dueDate: '2026-10-05', status: 'pending' },
  { id: 2, key: 'writing', dueDate: '2026-10-08', status: 'completed' },
];

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const name = user.email?.split('@')[0];

  const locale = i18n.language === 'my' ? 'my-MM' : 'en-US';
  const formatDate = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });

  const totalLessons = courses.reduce((sum, c) => sum + c.lessons, 0);
  const lessonsDone = courses.reduce((sum, c) => sum + Math.round((c.progress / 100) * c.lessons), 0);
  const stats = [
    { label: t('dashboard.stats.inProgress'), value: courses.filter((c) => c.progress > 0).length, icon: 'book', tile: 'bg-primary-100 text-primary-700' },
    { label: t('dashboard.stats.lessonsDone'), value: `${lessonsDone}/${totalLessons}`, icon: 'check', tile: 'bg-success-100 text-success-700' },
    { label: t('dashboard.stats.pending'), value: assignments.filter((a) => a.status === 'pending').length, icon: 'clock', tile: 'bg-highlight-100 text-highlight-700' },
    { label: t('dashboard.stats.overall'), value: `${Math.round((lessonsDone / totalLessons) * 100)}%`, icon: 'chart', tile: 'bg-accent-100 text-accent-700' },
  ];

  const current = courses.find((c) => c.progress > 0) || courses[0];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-600 to-primary-900 p-6 text-white shadow-lift sm:p-10">
          <div className="bg-dots absolute inset-0" aria-hidden="true" />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-400/30 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h1 className="text-3xl font-extrabold sm:text-4xl">
                {t('dashboard.welcome')}, <span className="text-accent-400">{name}</span>! 👋
              </h1>
              <p className="mt-3 text-white/80">{t('dashboard.heroSubtitle')}</p>
              <Button variant="accent" size="lg" className="mt-6">
                {t('dashboard.continueLearning')}: {t(`courses.titles.${current.key}`)}
                <Icon name="arrowRight" />
              </Button>
            </div>
            <div className="flex items-center gap-4 rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
              <ProgressRing value={current.progress} size={84} stroke={8} color="accent-400" track="white-20" labelClassName="text-white" />
              <div>
                <p className="text-sm text-white/70">{t('dashboard.myCourseProgress')}</p>
                <p className="text-lg font-bold">{t(`courses.titles.${current.key}`)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="flex flex-col gap-3 !p-5 sm:flex-row sm:items-center">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${s.tile}`}>
                <Icon name={s.icon} />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold text-ink">{s.value}</p>
                <p className="text-sm leading-snug text-ink-muted">{s.label}</p>
              </div>
            </Card>
          ))}
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* Courses */}
          <section className="lg:col-span-2">
            <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('dashboard.myCourses')}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {courses.map((course) => (
                <Card key={course.id} hoverable className="flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl font-thai text-3xl font-bold ${course.tile}`}>
                      {course.thai}
                    </span>
                    <ProgressRing value={course.progress} color={course.color} track={course.track} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-ink">{t(`courses.titles.${course.key}`)}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={course.tone}>{t(`courses.${course.key}`)}</Badge>
                    <span className="flex items-center gap-1 text-sm text-ink-muted">
                      <Icon name="book" className="h-4 w-4" />
                      {course.lessons} {t('courses.lessons')}
                    </span>
                  </div>
                  <div className="mt-auto pt-6">
                    <Button variant={course.progress > 0 ? 'primary' : 'tertiary'} className="w-full">
                      {course.progress > 0 ? t('courses.continueCourse') : t('courses.startCourse')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-8">
            <section>
              <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('dashboard.phraseOfDay')}</h2>
              <Card className="relative overflow-hidden border-accent-200 bg-gradient-to-br from-accent-100 to-surface">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent-200/60" aria-hidden="true" />
                <p className="relative font-thai text-4xl font-bold text-ink">สวัสดีครับ</p>
                <p className="relative mt-1 text-sm font-semibold tracking-wide text-accent-700">sa-wat-dee khrap</p>
                <p className="relative mt-3 text-ink-muted">{t('dashboard.phraseMeaning')}</p>
                <Button variant="secondary" size="sm" className="relative mt-4">
                  <Icon name="speaker" className="h-4 w-4" />
                  {t('dashboard.listen')}
                </Button>
              </Card>
            </section>

            <section>
              <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('dashboard.assignments')}</h2>
              <Card className="divide-y divide-primary-100/70 !p-0">
                {assignments.map((a) => {
                  const done = a.status === 'completed';
                  return (
                    <div key={a.id} className="flex items-center gap-4 p-5">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${done ? 'bg-success-100 text-success-700' : 'bg-highlight-100 text-highlight-700'}`}>
                        <Icon name={done ? 'check' : 'document'} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{t(`assignments.${a.key}`)}</p>
                        <p className="flex items-center gap-1 text-sm text-ink-muted">
                          <Icon name="clock" className="h-4 w-4" />
                          {t('dashboard.due')}: {formatDate(a.dueDate)}
                        </p>
                      </div>
                      <Badge tone={done ? 'success' : 'highlight'}>
                        {done ? t('courses.completed') : t('dashboard.pending')}
                      </Badge>
                    </div>
                  );
                })}
              </Card>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
