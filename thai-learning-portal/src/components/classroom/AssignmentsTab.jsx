import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../Card';
import Button from '../Button';
import Badge from '../Badge';
import Icon from '../Icon';
import Modal, { ConfirmModal } from '../Modal';
import EmptyState from '../EmptyState';
import IconButton from './IconButton';
import { SelectField, TextArea, TextField, Toggle } from '../Form';
import { ASSIGNMENT_TYPES } from '../../data/classMeta';
import { deleteAssignment, gradeSubmission, saveAssignment } from '../../data/classStore';
import { formatDate } from '../../utils/format';

function AssignmentModal({ cls, initial, onClose }) {
  const { t } = useTranslation();
  const [a, setA] = useState(
    initial || { title: '', type: 'pronunciation', instructions: '', dueDate: '', points: 10, moduleId: '', published: false }
  );
  const [error, setError] = useState('');
  const set = (key) => (e) => setA({ ...a, [key]: e?.target ? e.target.value : e });

  const save = (e) => {
    e.preventDefault();
    if (!a.title.trim()) return setError(t('auth.required'));
    saveAssignment(cls.id, { ...a, title: a.title.trim(), points: Math.max(0, Number(a.points) || 0) });
    onClose();
  };

  return (
    <Modal title={initial ? t('classroom.assignments.edit') : t('classroom.assignments.new')} onClose={onClose}>
      <form onSubmit={save} className="space-y-5" noValidate>
        <TextField label={t('classroom.fields.title')} required value={a.title} onChange={set('title')} error={error} />
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-ink">{t('classroom.assignments.type')}</legend>
          <div className="grid grid-cols-3 gap-2">
            {ASSIGNMENT_TYPES.map(({ id, icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={a.type === id}
                onClick={() => set('type')(id)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-xs font-semibold transition-all ${
                  a.type === id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-primary-100 text-ink-muted hover:border-primary-300'
                }`}
              >
                <Icon name={icon} />
                {t(`classroom.assignmentTypes.${id}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <TextArea label={t('classroom.assignments.instructions')} rows={4} value={a.instructions} onChange={set('instructions')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label={t('classroom.assignments.dueDate')} type="date" value={a.dueDate} onChange={set('dueDate')} />
          <TextField label={t('classroom.assignments.points')} type="number" min="0" value={a.points} onChange={set('points')} />
        </div>
        <SelectField
          label={t('classroom.assignments.module')}
          value={a.moduleId}
          onChange={set('moduleId')}
          options={[{ value: '', label: t('classroom.assignments.noModule') }, ...cls.modules.map((m) => ({ value: m.id, label: m.title }))]}
        />
        <Toggle
          label={t('classroom.publish')}
          description={t('classroom.assignments.publishHint')}
          checked={a.published}
          onChange={set('published')}
        />
        <Button type="submit" className="w-full">{t('common.save')}</Button>
      </form>
    </Modal>
  );
}

function Submissions({ cls, assignment }) {
  const { t, i18n } = useTranslation();
  const [scores, setScores] = useState({});

  if (!cls.students.length) return <p className="px-5 py-4 text-sm text-ink-muted">{t('classroom.students.emptyTitle')}</p>;

  return (
    <ul className="divide-y divide-primary-100/70 border-t border-primary-100">
      {cls.students.map((st) => {
        const sub = assignment.submissions.find((s) => s.studentId === st.id);
        const draft = scores[st.id] ?? (sub?.score ?? '');
        return (
          <li key={st.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{st.name}</p>
              <p className="text-xs text-ink-muted">
                {sub ? `${t('teacher.submitted')}: ${formatDate(sub.submittedAt, i18n.language)}` : t('classroom.assignments.notSubmitted')}
              </p>
            </div>
            {sub?.status === 'graded' && <Badge tone="success">{t('classroom.assignments.graded')}</Badge>}
            {sub?.status === 'submitted' && <Badge tone="highlight">{t('classroom.assignments.toGrade')}</Badge>}
            {sub && (
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft === '') return;
                  gradeSubmission(cls.id, assignment.id, st.id, Math.min(assignment.points, Math.max(0, Number(draft))));
                  setScores((s) => ({ ...s, [st.id]: undefined }));
                }}
              >
                <input
                  type="number"
                  min="0"
                  max={assignment.points}
                  value={draft}
                  onChange={(e) => setScores((s) => ({ ...s, [st.id]: e.target.value }))}
                  aria-label={`${t('classroom.assignments.score')} — ${st.name}`}
                  className="w-20 rounded-lg border-2 border-primary-100 bg-surface px-2 py-1.5 text-right text-ink focus:border-primary-500 focus:outline-none"
                />
                <span className="text-sm text-ink-muted">/ {assignment.points}</span>
                <Button type="submit" size="sm" variant="secondary">{t('classroom.assignments.saveGrade')}</Button>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function AssignmentsTab({ cls }) {
  const { t, i18n } = useTranslation();
  const [dialog, setDialog] = useState(null);
  const [open, setOpen] = useState(null);
  const close = () => setDialog(null);
  const typeIcon = Object.fromEntries(ASSIGNMENT_TYPES.map((x) => [x.id, x.icon]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-muted">{t('classroom.assignments.intro')}</p>
        <Button onClick={() => setDialog({ kind: 'edit' })}>
          <Icon name="plus" /> {t('classroom.assignments.new')}
        </Button>
      </div>

      {cls.assignments.length === 0 && (
        <EmptyState
          icon="document"
          title={t('classroom.assignments.emptyTitle')}
          text={t('classroom.assignments.emptyText')}
          action={<Button onClick={() => setDialog({ kind: 'edit' })}><Icon name="plus" /> {t('classroom.assignments.new')}</Button>}
        />
      )}

      {cls.assignments.map((a) => {
        const submitted = a.submissions.length;
        const toGrade = a.submissions.filter((s) => s.status === 'submitted').length;
        const module = cls.modules.find((m) => m.id === a.moduleId);
        return (
          <Card key={a.id} className="!p-0">
            <div className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
                <Icon name={typeIcon[a.type]} />
              </span>
              <div className="min-w-[12rem] flex-1">
                <h3 className="break-words font-bold text-ink">{a.title}</h3>
                <p className="flex flex-wrap gap-x-3 text-sm text-ink-muted">
                  <span>{t(`classroom.assignmentTypes.${a.type}`)}</span>
                  {a.dueDate && <span>{t('dashboard.due')}: {formatDate(a.dueDate, i18n.language)}</span>}
                  <span>{t('classroom.assignments.pointsCount', { count: a.points })}</span>
                  {module && <span>· {module.title}</span>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={a.published ? 'success' : 'neutral'}>{a.published ? t('classroom.published') : t('classroom.draft')}</Badge>
                {toGrade > 0 && <Badge tone="highlight">{t('classroom.assignments.toGradeCount', { count: toGrade })}</Badge>}
              </div>
              <div className="flex items-center">
                <IconButton icon="pencil" label={t('common.edit')} onClick={() => setDialog({ kind: 'edit', assignment: a })} />
                <IconButton icon="trash" tone="danger" label={t('common.delete')} onClick={() => setDialog({ kind: 'delete', assignment: a })} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(open === a.id ? null : a.id)}
              aria-expanded={open === a.id}
              className="flex w-full items-center justify-between border-t border-primary-100 px-5 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-50/60"
            >
              {t('classroom.assignments.submissionsCount', { submitted, total: cls.students.length })}
              <Icon name={open === a.id ? 'chevronUp' : 'chevronDown'} className="h-4 w-4" />
            </button>
            {open === a.id && <Submissions cls={cls} assignment={a} />}
          </Card>
        );
      })}

      {dialog?.kind === 'edit' && <AssignmentModal cls={cls} initial={dialog.assignment} onClose={close} />}
      {dialog?.kind === 'delete' && (
        <ConfirmModal
          title={t('classroom.assignments.deleteTitle')}
          message={t('classroom.assignments.deleteMessage', { name: dialog.assignment.title })}
          confirmLabel={t('common.delete')}
          onConfirm={() => deleteAssignment(cls.id, dialog.assignment.id)}
          onClose={close}
        />
      )}
    </div>
  );
}
