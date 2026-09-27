import { Link, Navigate, NavLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import Icon from '../../components/Icon';
import { useClass, pendingSubmissions } from '../../data/classStore';
import { TONES } from '../../data/classMeta';
import ModulesTab from '../../components/classroom/ModulesTab';
import AssignmentsTab from '../../components/classroom/AssignmentsTab';
import StudentsTab from '../../components/classroom/StudentsTab';
import MessagesTab from '../../components/classroom/MessagesTab';
import CertificateTab from '../../components/classroom/CertificateTab';
import SettingsTab from '../../components/classroom/SettingsTab';

const TABS = [
  { id: 'modules', icon: 'modules', Component: ModulesTab },
  { id: 'assignments', icon: 'document', Component: AssignmentsTab },
  { id: 'students', icon: 'users', Component: StudentsTab },
  { id: 'messages', icon: 'chat', Component: MessagesTab },
  { id: 'certificate', icon: 'trophy', Component: CertificateTab },
  { id: 'settings', icon: 'cog', Component: SettingsTab },
];

export default function ClassWorkspacePage() {
  const { t } = useTranslation();
  const { classId, tab = 'modules' } = useParams();
  const cls = useClass(classId);

  if (!cls) return <Navigate to="/teacher" replace />;
  const current = TABS.find((x) => x.id === tab);
  if (!current) return <Navigate to={`/teacher/classes/${classId}/modules`} replace />;

  const counts = {
    modules: cls.modules.length,
    assignments: pendingSubmissions(cls).length || null,
    students: cls.students.length,
  };
  const { Component } = current;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Link to="/teacher" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-primary-700">
          <Icon name="arrowLeft" className="h-4 w-4" />
          {t('classroom.backToDashboard')}
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-thai text-3xl font-bold ${TONES[cls.tone].tile}`}>
            {cls.letter}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-extrabold text-ink sm:text-3xl">{cls.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              <Badge tone={cls.published ? 'success' : 'neutral'}>
                {cls.published ? t('classroom.published') : t('classroom.draft')}
              </Badge>
              <span>{t(`courses.${cls.level}`)}</span>
              {cls.schedule && <span>· {cls.schedule}</span>}
              <span>· {t('classroom.joinCode')}: <b className="font-mono text-ink">{cls.joinCode}</b></span>
            </div>
          </div>
        </div>

        <nav className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label={t('classroom.tabsLabel')}>
          <div className="flex min-w-max gap-1 border-b border-primary-100">
            {TABS.map(({ id, icon }) => (
              <NavLink
                key={id}
                to={`/teacher/classes/${classId}/${id}`}
                className={({ isActive }) =>
                  `-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive ? 'border-primary-600 text-primary-700' : 'border-transparent text-ink-muted hover:text-ink'
                  }`
                }
              >
                <Icon name={icon} className="h-4 w-4" />
                {t(`classroom.tabs.${id}`)}
                {counts[id] ? (
                  <span className="rounded-full bg-primary-50 px-2 text-xs text-primary-700">{counts[id]}</span>
                ) : null}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="mt-6">
          <Component cls={cls} />
        </div>
      </main>
    </div>
  );
}
