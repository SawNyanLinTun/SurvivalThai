import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../Card';
import Button from '../Button';
import Icon from '../Icon';
import Modal, { ConfirmModal } from '../Modal';
import EmptyState from '../EmptyState';
import IconButton from './IconButton';
import { TextField } from '../Form';
import { addStudent, removeStudent } from '../../data/classStore';
import { formatDate, initials } from '../../utils/format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AddStudentModal({ cls, onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const save = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = t('auth.required');
    if (!EMAIL_PATTERN.test(form.email)) next.email = t('auth.invalidEmail');
    else if (cls.students.some((s) => s.email.toLowerCase() === form.email.toLowerCase())) next.email = t('classroom.students.duplicate');
    setErrors(next);
    if (Object.keys(next).length) return;
    addStudent(cls.id, { name: form.name.trim(), email: form.email.trim() });
    onClose();
  };

  return (
    <Modal title={t('classroom.students.add')} onClose={onClose} size="sm">
      <form onSubmit={save} className="space-y-5" noValidate>
        <TextField label={t('classroom.students.name')} required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField label={t('auth.email')} type="email" required value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Button type="submit" className="w-full">{t('classroom.students.add')}</Button>
      </form>
    </Modal>
  );
}

export default function StudentsTab({ cls }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(null);
  const [copied, setCopied] = useState(false);
  const close = () => setDialog(null);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(cls.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; the code is visible to copy manually
    }
  };

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center gap-4 border-accent-200 bg-accent-100/40">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-400 text-on-accent">
          <Icon name="userPlus" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">{t('classroom.students.inviteTitle')}</p>
          <p className="text-sm text-ink-muted">{t('classroom.students.inviteText')}</p>
        </div>
        <span className="select-all rounded-xl bg-surface px-4 py-2 font-mono text-xl font-bold tracking-[0.2em] text-ink">{cls.joinCode}</span>
        <Button variant="secondary" onClick={copyCode}>
          <Icon name={copied ? 'check' : 'copy'} /> {copied ? t('classroom.copied') : t('classroom.copy')}
        </Button>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-ink">{t('classroom.students.title', { count: cls.students.length })}</h2>
        <Button onClick={() => setDialog({ kind: 'add' })}>
          <Icon name="plus" /> {t('classroom.students.add')}
        </Button>
      </div>

      {cls.students.length === 0 ? (
        <EmptyState icon="users" title={t('classroom.students.emptyTitle')} text={t('classroom.students.emptyText')} />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-primary-100 text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">{t('teacher.table.student')}</th>
                <th className="px-5 py-3 font-semibold">{t('teacher.table.progress')}</th>
                <th className="px-5 py-3 font-semibold">{t('teacher.table.lastActive')}</th>
                <th className="px-5 py-3"><span className="sr-only">{t('classroom.actions')}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100/70">
              {cls.students.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-200 text-xs font-bold text-accent-700">
                        {initials(s.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">{s.name}</p>
                        <p className="truncate text-xs text-ink-muted">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-primary-100">
                        <div className="h-full rounded-full bg-primary-600" style={{ width: `${s.progress}%` }} />
                      </div>
                      <span className="font-semibold tabular-nums text-ink">{s.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">
                    {s.lastActive ? formatDate(s.lastActive, i18n.language) : t('classroom.students.invited')}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <IconButton icon="chat" label={t('classroom.students.message')} onClick={() => navigate(`../messages?thread=${s.id}`, { relative: 'path' })} />
                      <IconButton icon="trash" tone="danger" label={t('classroom.students.remove')} onClick={() => setDialog({ kind: 'remove', student: s })} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {dialog?.kind === 'add' && <AddStudentModal cls={cls} onClose={close} />}
      {dialog?.kind === 'remove' && (
        <ConfirmModal
          title={t('classroom.students.remove')}
          message={t('classroom.students.removeMessage', { name: dialog.student.name })}
          confirmLabel={t('classroom.students.remove')}
          onConfirm={() => removeStudent(cls.id, dialog.student.id)}
          onClose={close}
        />
      )}
    </div>
  );
}
