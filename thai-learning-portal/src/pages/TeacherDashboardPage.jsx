import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import ProgressRing from '../components/ProgressRing';
import { displayName, getUser } from '../auth';

// Demo data until the backend exists
const classes = [
  { id: 1, key: 'beginner', thai: 'ก', students: 24, schedule: 'Mon, Wed · 18:00', progress: 52, color: 'primary-600', track: 'primary-100', tile: 'bg-primary-100 text-primary-700', tone: 'primary' },
  { id: 2, key: 'intermediate', thai: 'ข', students: 16, schedule: 'Tue, Thu · 18:30', progress: 34, color: 'accent-500', track: 'accent-100', tile: 'bg-accent-100 text-accent-700', tone: 'accent' },
  { id: 3, key: 'advanced', thai: 'ค', students: 9, schedule: 'Sat · 10:00', progress: 12, color: 'highlight-500', track: 'highlight-100', tile: 'bg-highlight-100 text-highlight-700', tone: 'highlight' },
];

const submissions = [
  { id: 1, student: 'Aung Aung', assignment: 'pronunciation', course: 'beginner', submitted: '2026-09-26' },
  { id: 2, student: 'Hnin Wai', assignment: 'writing', course: 'intermediate', submitted: '2026-09-25' },
  { id: 3, student: 'Kyaw Zin', assignment: 'pronunciation', course: 'beginner', submitted: '2026-09-25' },
];

const students = [
  { id: 1, name: 'Aung Aung', course: 'beginner', progress: 68, lastActive: '2026-09-27' },
  { id: 2, name: 'Hnin Wai', course: 'intermediate', progress: 41, lastActive: '2026-09-26' },
  { id: 3, name: 'Kyaw Zin', course: 'beginner', progress: 23, lastActive: '2026-09-21' },
  { id: 4, name: 'Thiri Min', course: 'advanced', progress: 12, lastActive: '2026-09-25' },
  { id: 5, name: 'Zaw Lin', course: 'intermediate', progress: 55, lastActive: '2026-09-27' },
];

const progressTone = (p) => (p >= 50 ? 'bg-success-500' : p >= 25 ? 'bg-accent-400' : 'bg-highlight-500');

export default function TeacherDashboardPage() {
  const { t, i18n } = useTranslation();
  const name = displayName(getUser());

  const locale = i18n.language === 'my' ? 'my-MM' : 'en-US';
  const formatDate = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(locale, { month: 'short', day: 'numeric' });

  const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);
  const avgProgress = Math.round(
    classes.reduce((sum, c) => sum + c.progress * c.students, 0) / totalStudents
  );

  const stats = [
    { label: t('teacher.stats.students'), value: totalStudents, icon: 'users', tile: 'bg-primary-100 text-primary-700' },
    { label: t('teacher.stats.classes'), value: classes.length, icon: 'teacher', tile: 'bg-success-100 text-success-700' },
    { label: t('teacher.stats.toReview'), value: submissions.length, icon: 'document', tile: 'bg-highlight-100 text-highlight-700' },
    { label: t('teacher.stats.avgProgress'), value: `${avgProgress}%`, icon: 'chart', tile: 'bg-accent-100 text-accent-700' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-600 to-primary-900 p-6 text-white shadow-lift sm:p-10">
          <div className="bg-dots absolute inset-0" aria-hidden="true" />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-400/30 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <Badge tone="accent">{t('auth.teacher')}</Badge>
              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                {t('dashboard.welcome')}, <span className="text-accent-400">{name}</span>! 👋
              </h1>
              <p className="mt-3 text-white/80">{t('teacher.heroSubtitle')}</p>
            </div>
            <Button variant="accent" size="lg" className="shrink-0">
              {t('teacher.reviewNow')} ({submissions.length})
              <Icon name="arrowRight" />
            </Button>
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
          {/* Classes */}
          <section className="lg:col-span-2">
            <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('teacher.myClasses')}</h2>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {classes.map((c) => (
                <Card key={c.id} hoverable className="flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl font-thai text-3xl font-bold ${c.tile}`}>
                      {c.thai}
                    </span>
                    <ProgressRing value={c.progress} color={c.color} track={c.track} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-ink">{t(`courses.titles.${c.key}`)}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                    <Badge tone={c.tone}>{t('teacher.studentsCount', { count: c.students })}</Badge>
                    <span className="flex items-center gap-1">
                      <Icon name="clock" className="h-4 w-4" />
                      {c.schedule}
                    </span>
                  </div>
                  <div className="mt-auto pt-6">
                    <Button variant="tertiary" className="w-full">{t('teacher.manage')}</Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Submissions to review */}
          <aside>
            <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('teacher.submissions')}</h2>
            <Card className="divide-y divide-primary-100/70 !p-0">
              {submissions.map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-200 font-bold text-accent-700">
                    {s.student[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{s.student}</p>
                    <p className="truncate text-sm text-ink-muted">{t(`assignments.${s.assignment}`)}</p>
                    <p className="text-xs text-ink-faint">
                      {t('teacher.submitted')}: {formatDate(s.submitted)}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">{t('teacher.review')}</Button>
                </div>
              ))}
            </Card>
          </aside>
        </div>

        {/* Student progress */}
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('teacher.studentProgress')}</h2>
          <Card className="overflow-x-auto !p-0">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-primary-100 text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t('teacher.table.student')}</th>
                  <th className="px-5 py-3 font-semibold">{t('teacher.table.course')}</th>
                  <th className="px-5 py-3 font-semibold">{t('teacher.table.progress')}</th>
                  <th className="px-5 py-3 font-semibold">{t('teacher.table.lastActive')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100/70">
                {students.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-primary-50/60">
                    <td className="px-5 py-3.5 font-semibold text-ink">{s.name}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{t(`courses.${s.course}`)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-primary-100">
                          <div className={`h-full rounded-full ${progressTone(s.progress)}`} style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="w-10 font-semibold tabular-nums text-ink">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">{formatDate(s.lastActive)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      </main>
    </div>
  );
}
