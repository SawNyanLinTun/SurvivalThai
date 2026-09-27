import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import ProgressRing from '../components/ProgressRing';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../auth/AuthContext';
import { displayName } from '../auth/helpers';
import Spinner from '../components/Spinner';
import { pendingSubmissions, useClassesState } from '../data/classStore';
import { TONES, classProgress } from '../data/classMeta';
import { formatDate } from '../utils/format';

const progressTone = (p) => (p >= 50 ? 'bg-success-500' : p >= 25 ? 'bg-accent-400' : 'bg-highlight-500');

function NewClassButton({ variant = 'primary', size = 'md' }) {
  const { t } = useTranslation();
  return (
    <Link
      to="/teacher/classes/new"
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus-visible:ring-4 ${
        size === 'lg' ? 'px-6 py-3.5 text-lg' : 'px-5 py-2.5'
      } ${
        variant === 'accent'
          ? 'bg-accent-400 text-on-accent hover:bg-accent-500 focus-visible:ring-accent-200'
          : 'bg-primary-600 text-on-primary hover:bg-primary-700 focus-visible:ring-primary-200'
      }`}
    >
      <Icon name="plus" />
      {t('classroom.newClass')}
    </Link>
  );
}

export default function TeacherDashboardPage() {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const name = displayName(profile);
  const { classes, loaded } = useClassesState();
  const fmt = (iso) => formatDate(iso, i18n.language, { month: 'short', day: 'numeric' });

  const submissions = classes.flatMap((c) => pendingSubmissions(c).map((s) => ({ ...s, cls: c })));
  const students = classes.flatMap((c) => c.students.map((s) => ({ ...s, cls: c })));
  const avgProgress = students.length ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length) : 0;
  const firstToReview = submissions[0]?.cls;

  const stats = [
    { label: t('teacher.stats.students'), value: students.length, icon: 'users', tile: 'bg-primary-100 text-primary-700' },
    { label: t('teacher.stats.classes'), value: classes.filter((c) => c.published).length, icon: 'teacher', tile: 'bg-success-100 text-success-700' },
    { label: t('teacher.stats.toReview'), value: submissions.length, icon: 'document', tile: 'bg-highlight-100 text-highlight-700' },
    { label: t('teacher.stats.avgProgress'), value: `${avgProgress}%`, icon: 'chart', tile: 'bg-accent-100 text-accent-700' },
  ];

  if (!loaded) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <Spinner label={t('common.loading')} />
      </div>
    );
  }

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
            <div className="flex flex-wrap gap-3">
              <NewClassButton variant="accent" size="lg" />
              {firstToReview && (
                <Link
                  to={`/teacher/classes/${firstToReview.id}/assignments`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3.5 font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25"
                >
                  {t('teacher.reviewNow')} ({submissions.length})
                  <Icon name="arrowRight" />
                </Link>
              )}
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
          {/* Classes */}
          <section className="lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-extrabold text-ink">{t('teacher.myClasses')}</h2>
              <NewClassButton />
            </div>
            {classes.length === 0 ? (
              <EmptyState
                icon="teacher"
                title={t('classroom.noClassesTitle')}
                text={t('classroom.noClassesText')}
                action={<NewClassButton />}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {classes.map((c) => {
                  const tone = TONES[c.tone];
                  return (
                    <Card key={c.id} hoverable className="flex flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl font-thai text-3xl font-bold ${tone.tile}`}>
                          {c.letter}
                        </span>
                        <ProgressRing value={classProgress(c)} color={tone.ring} track={tone.track} />
                      </div>
                      <h3 className="mt-4 break-words text-lg font-bold text-ink">{c.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                        <Badge tone={c.tone}>{t('teacher.studentsCount', { count: c.students.length })}</Badge>
                        {!c.published && <Badge tone="neutral">{t('classroom.draft')}</Badge>}
                      </div>
                      {c.schedule && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-ink-muted">
                          <Icon name="clock" className="h-4 w-4" />
                          {c.schedule}
                        </p>
                      )}
                      <div className="mt-auto pt-6">
                        <Link
                          to={`/teacher/classes/${c.id}/modules`}
                          className="flex w-full items-center justify-center rounded-xl border-2 border-primary-200 bg-surface px-5 py-2.5 font-semibold text-primary-700 transition-all hover:border-primary-400 hover:bg-primary-50"
                        >
                          {t('teacher.manage')}
                        </Link>
                      </div>
                    </Card>
                  );
                })}
                <Link
                  to="/teacher/classes/new"
                  className="flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary-200 p-6 text-primary-700 transition-colors hover:border-primary-400 hover:bg-primary-50"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
                    <Icon name="plus" className="h-7 w-7" />
                  </span>
                  <span className="font-bold">{t('classroom.newClass')}</span>
                </Link>
              </div>
            )}
          </section>

          {/* Submissions to review */}
          <aside>
            <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('teacher.submissions')}</h2>
            {submissions.length === 0 ? (
              <EmptyState icon="check" title={t('classroom.allCaughtUp')} />
            ) : (
              <Card className="divide-y divide-primary-100/70 !p-0">
                {submissions.map((s) => (
                  <div key={`${s.assignment.id}-${s.studentId}`} className="flex items-center gap-4 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-200 font-bold text-accent-700">
                      {s.student?.name[0] || '?'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{s.student?.name}</p>
                      <p className="truncate text-sm text-ink-muted">{s.assignment.title}</p>
                      <p className="text-xs text-ink-faint">
                        {t('teacher.submitted')}: {fmt(s.submittedAt)}
                      </p>
                    </div>
                    <Link
                      to={`/teacher/classes/${s.cls.id}/assignments`}
                      className="rounded-xl bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-100"
                    >
                      {t('teacher.review')}
                    </Link>
                  </div>
                ))}
              </Card>
            )}
          </aside>
        </div>

        {/* Student progress */}
        {students.length > 0 && (
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
                    <tr key={`${s.cls.id}-${s.id}`} className="transition-colors hover:bg-primary-50/60">
                      <td className="px-5 py-3.5 font-semibold text-ink">{s.name}</td>
                      <td className="px-5 py-3.5 text-ink-muted">{s.cls.name}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-primary-100">
                            <div className={`h-full rounded-full ${progressTone(s.progress)}`} style={{ width: `${s.progress}%` }} />
                          </div>
                          <span className="w-10 font-semibold tabular-nums text-ink">{s.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink-muted">{s.lastActive ? fmt(s.lastActive) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
