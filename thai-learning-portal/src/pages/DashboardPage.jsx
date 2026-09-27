import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ProgressRing from '../components/ProgressRing';
import Certificate from '../components/classroom/Certificate';
import { TextArea } from '../components/Form';
import { useAuth } from '../auth/AuthContext';
import { displayName } from '../auth/helpers';
import { sendStudentMessage, submitAssignment, useStudentClass } from '../data/studentStore';
import { ASSIGNMENT_TYPES, ITEM_TYPES } from '../data/classMeta';
import { daysUntil, formatDate, formatTime } from '../utils/format';

const itemIcon = Object.fromEntries(ITEM_TYPES.map((x) => [x.id, x.icon]));
const typeIcon = Object.fromEntries(ASSIGNMENT_TYPES.map((x) => [x.id, x.icon]));

function SubmitModal({ cls, userId, assignment, onDone, onClose }) {
  const { t } = useTranslation();
  const [content, setContent] = useState(assignment.submission?.content ?? '');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const needsFile = assignment.type === 'pronunciation';

  const submit = async (e) => {
    e.preventDefault();
    if (needsFile && !file && !assignment.submission?.file_path) return setError(t('student.recordingRequired'));
    if (!needsFile && !content.trim()) return setError(t('auth.required'));
    setBusy(true);
    setError('');
    try {
      await submitAssignment({ classId: cls.id, userId, assignment, content: content.trim(), file });
      await onDone();
      onClose();
    } catch (err) {
      setError(t(`student.errors.${err.message}`, { defaultValue: t('auth.errors.server_error') }));
      setBusy(false);
    }
  };

  return (
    <Modal title={assignment.title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5" noValidate>
        {assignment.instructions && (
          <div className="rounded-2xl bg-page p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">{t('classroom.assignments.instructions')}</p>
            <p className="mt-1 whitespace-pre-wrap text-ink">{assignment.instructions}</p>
          </div>
        )}
        {needsFile && (
          <div>
            <label htmlFor="recording" className="mb-1.5 block text-sm font-semibold text-ink">
              {t('student.recording')}
            </label>
            <input
              id="recording"
              type="file"
              accept="audio/*"
              capture="user"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-xl file:border-0 file:bg-primary-50 file:px-4 file:py-2.5 file:font-semibold file:text-primary-700"
            />
            <p className="mt-1.5 text-xs text-ink-muted">{t('student.recordingHint')}</p>
          </div>
        )}
        <TextArea
          label={needsFile ? t('student.note') : t('student.answer')}
          rows={needsFile ? 2 : 6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error && <p className="text-sm font-medium text-highlight-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? t('common.loading') : assignment.submission ? t('student.resubmit') : t('student.submit')}
        </Button>
      </form>
    </Modal>
  );
}

function Messages({ cls, userId, messages, teacherName, onSent }) {
  const { t, i18n } = useTranslation();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const canReply = cls.isOpen && cls.settings?.allowMessages;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setError('');
    try {
      await sendStudentMessage({ classId: cls.id, userId, text });
      await onSent();
    } catch {
      setDraft(text);
      setError(t('auth.errors.server_error'));
    }
  };

  return (
    <Card className="flex flex-col !p-0">
      <div className="max-h-96 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && <p className="py-6 text-center text-sm text-ink-muted">{t('classroom.messages.noMessages')}</p>}
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          const announcement = !m.thread_student_id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  mine ? 'rounded-br-md bg-primary-600 text-on-primary' : 'rounded-bl-md bg-page text-ink'
                }`}
              >
                {!mine && (
                  <p className="flex items-center gap-1 text-xs font-bold text-accent-700">
                    {announcement && <Icon name="megaphone" className="h-3.5 w-3.5" />}
                    {announcement ? t('classroom.messages.announcements') : teacherName || t('auth.teacher')}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-[11px] ${mine ? 'text-on-primary/70' : 'text-ink-faint'}`}>{formatTime(m.created_at, i18n.language)}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {canReply ? (
        <form onSubmit={send} className="flex items-end gap-2 border-t border-primary-100 p-3">
          <label htmlFor="student-message" className="sr-only">{t('classroom.messages.placeholder')}</label>
          <textarea
            id="student-message"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) send(e);
            }}
            placeholder={t('student.messageTeacher')}
            className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border-2 border-primary-100 bg-surface px-4 py-2.5 text-ink placeholder:text-ink-faint focus:border-primary-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label={t('classroom.messages.send')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-on-primary hover:bg-primary-700 disabled:opacity-40"
          >
            <Icon name="send" />
          </button>
        </form>
      ) : (
        <p className="border-t border-primary-100 px-4 py-3 text-xs text-ink-muted">{t('student.repliesClosed')}</p>
      )}
      {error && <p className="px-4 pb-3 text-sm text-highlight-600">{error}</p>}
    </Card>
  );
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const name = displayName(profile);
  const { loading, error, cls, messages, certificate, teacherName, refresh } = useStudentClass(profile.id);
  const [submitting, setSubmitting] = useState(null);
  const [openLesson, setOpenLesson] = useState(null);
  const [showCert, setShowCert] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <Spinner label={t('common.loading')} />
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
          <EmptyState icon="clock" title={t('student.notAvailableTitle')} text={error ? t('auth.errors.server_error') : t('student.notAvailableText')} />
        </main>
      </div>
    );
  }

  const lang = i18n.language;
  const daysLeft = daysUntil(cls.end_date);
  const submittedCount = cls.assignments.filter((a) => a.submission).length;
  const pending = cls.assignments.filter((a) => !a.submission);
  const lessonCount = cls.modules.reduce((n, m) => n + m.items.length, 0);

  const stats = [
    { label: t('student.stats.lessons'), value: lessonCount, icon: 'book', tile: 'bg-primary-100 text-primary-700' },
    { label: t('student.stats.submitted'), value: `${submittedCount}/${cls.assignments.length}`, icon: 'check', tile: 'bg-success-100 text-success-700' },
    { label: t('dashboard.stats.pending'), value: pending.length, icon: 'clock', tile: 'bg-highlight-100 text-highlight-700' },
    {
      label: t('student.stats.daysLeft'),
      value: Math.max(daysLeft, 0),
      icon: 'chart',
      tile: 'bg-accent-100 text-accent-700',
    },
  ];

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
              <p className="mt-3 text-lg font-semibold">{cls.name}</p>
              <p className="mt-1 text-white/80">
                {cls.isOpen
                  ? t('student.classRuns', { end: formatDate(cls.end_date, lang), count: daysLeft })
                  : t('student.classEnded', { end: formatDate(cls.end_date, lang) })}
              </p>
              <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/90 ring-1 ring-white/15">
                <Icon name="clock" className="h-4 w-4" />
                {t('student.dataNotice', { date: formatDate(cls.purge_after, lang) })}
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
              <ProgressRing value={cls.progress} size={84} stroke={8} color="accent-400" track="white-20" labelClassName="text-white" />
              <div>
                <p className="text-sm text-white/70">{t('dashboard.myCourseProgress')}</p>
                <p className="text-lg font-bold">{t(`courses.${cls.level}`)}</p>
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
          <div className="space-y-10 lg:col-span-2">
            {/* Assignments */}
            <section>
              <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('dashboard.assignments')}</h2>
              {cls.assignments.length === 0 ? (
                <EmptyState icon="document" title={t('student.noAssignments')} />
              ) : (
                <Card className="divide-y divide-primary-100/70 !p-0">
                  {cls.assignments.map((a) => {
                    const sub = a.submission;
                    const graded = sub?.status === 'graded';
                    return (
                      <div key={a.id} className="flex flex-wrap items-center gap-4 p-5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
                          <Icon name={typeIcon[a.type]} />
                        </span>
                        <div className="min-w-[12rem] flex-1">
                          <p className="font-bold text-ink">{a.title}</p>
                          <p className="text-sm text-ink-muted">
                            {t(`classroom.assignmentTypes.${a.type}`)}
                            {a.due_date && ` · ${t('dashboard.due')}: ${formatDate(a.due_date, lang)}`}
                            {` · ${t('classroom.assignments.pointsCount', { count: a.points })}`}
                          </p>
                        </div>
                        {graded && cls.settings?.showGrades ? (
                          <Badge tone="success">{t('student.score', { score: sub.score, points: a.points })}</Badge>
                        ) : sub ? (
                          <Badge tone="primary">{t('student.submitted')}</Badge>
                        ) : (
                          <Badge tone="highlight">{t('dashboard.pending')}</Badge>
                        )}
                        {cls.isOpen && !graded && (
                          <Button size="sm" variant={sub ? 'secondary' : 'primary'} onClick={() => setSubmitting(a)}>
                            {sub ? t('student.resubmit') : t('student.submit')}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </Card>
              )}
            </section>

            {/* Modules */}
            <section>
              <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('student.lessons')}</h2>
              {cls.modules.length === 0 ? (
                <EmptyState icon="modules" title={t('student.noLessons')} />
              ) : (
                <div className="space-y-4">
                  {cls.modules.map((m) => (
                    <Card key={m.id} className="!p-0">
                      <h3 className="border-b border-primary-100 px-5 py-4 font-bold text-ink">{m.title}</h3>
                      <ul className="divide-y divide-primary-100/70">
                        {m.items.map((item) => (
                          <li key={item.id} className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                                <Icon name={itemIcon[item.type]} className="h-4 w-4" />
                              </span>
                              {item.url ? (
                                <a href={item.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-medium text-ink hover:text-primary-700 hover:underline">
                                  {item.title}
                                </a>
                              ) : item.content ? (
                                <button
                                  type="button"
                                  onClick={() => setOpenLesson(openLesson === item.id ? null : item.id)}
                                  aria-expanded={openLesson === item.id}
                                  className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left font-medium text-ink hover:text-primary-700"
                                >
                                  <span className="truncate">{item.title}</span>
                                  <Icon name={openLesson === item.id ? 'chevronUp' : 'chevronDown'} className="h-4 w-4 shrink-0" />
                                </button>
                              ) : (
                                <span className="min-w-0 flex-1 truncate font-medium text-ink">{item.title}</span>
                              )}
                            </div>
                            {openLesson === item.id && (
                              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-page p-4 text-ink">{item.content}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {certificate && (
              <section>
                <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('classroom.tabs.certificate')}</h2>
                <Card className="flex items-center gap-4 border-accent-200 bg-gradient-to-br from-accent-100 to-surface">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-400 text-on-accent">
                    <Icon name="trophy" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">{t('student.certificateReady')}</p>
                    <p className="text-xs text-ink-muted">{certificate.number}</p>
                  </div>
                  <Button size="sm" onClick={() => setShowCert(true)}>{t('classroom.certificate.view')}</Button>
                </Card>
              </section>
            )}

            <section>
              <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('classroom.tabs.messages')}</h2>
              <Messages cls={cls} userId={profile.id} messages={messages} teacherName={teacherName} onSent={refresh} />
            </section>

            <section>
              <h2 className="mb-5 text-2xl font-extrabold text-ink">{t('dashboard.phraseOfDay')}</h2>
              <Card className="relative overflow-hidden border-accent-200 bg-gradient-to-br from-accent-100 to-surface">
                <p className="relative font-thai text-4xl font-bold text-ink">สวัสดีครับ</p>
                <p className="relative mt-1 text-sm font-semibold tracking-wide text-accent-700">sa-wat-dee khrap</p>
                <p className="relative mt-3 text-ink-muted">{t('dashboard.phraseMeaning')}</p>
              </Card>
            </section>
          </aside>
        </div>
      </main>

      {submitting && (
        <SubmitModal cls={cls} userId={profile.id} assignment={submitting} onDone={refresh} onClose={() => setSubmitting(null)} />
      )}
      {showCert && certificate && (
        <Modal
          title={t('classroom.tabs.certificate')}
          onClose={() => setShowCert(false)}
          size="lg"
          footer={
            <Button onClick={() => window.print()}>
              <Icon name="document" /> {t('classroom.certificate.print')}
            </Button>
          }
        >
          <div className="print-area">
            <Certificate
              cert={cls.certificate}
              courseName={certificate.class_name}
              studentName={certificate.student_name}
              number={certificate.number}
              date={certificate.issued_on}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
