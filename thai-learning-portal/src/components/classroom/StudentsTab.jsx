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
import { addStudent, approveJoinRequest, rejectJoinRequest, removeStudent, resetDevices } from '../../data/classStore';
import { formatDate, initials } from '../../utils/format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AddStudentModal({ cls, onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null); // { email, password }
  const [copied, setCopied] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = t('auth.required');
    if (!EMAIL_PATTERN.test(form.email)) next.email = t('auth.invalidEmail');
    else if (cls.students.some((s) => s.email.toLowerCase() === form.email.toLowerCase())) next.email = t('classroom.students.duplicate');
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const password = await addStudent(cls.id, { name: form.name.trim(), email: form.email.trim() });
      setCreated({ email: form.email.trim().toLowerCase(), password });
    } catch (err) {
      setErrors({ email: t(`auth.errors.${err.message}`, { defaultValue: t('auth.errors.server_error') }) });
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${created.email}\n${created.password}`);
      setCopied(true);
    } catch {
      // clipboard unavailable; details stay visible to copy by hand
    }
  };

  if (created) {
    return (
      <Modal title={t('classroom.students.createdTitle')} onClose={onClose} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">{t('classroom.students.createdText')}</p>
          <dl className="space-y-2 rounded-2xl bg-page p-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('auth.email')}</dt>
              <dd className="select-all break-all font-mono text-ink">{created.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('classroom.students.tempPassword')}</dt>
              <dd className="select-all font-mono text-lg font-bold tracking-wider text-ink">{created.password}</dd>
            </div>
          </dl>
          <p className="text-xs text-highlight-700">{t('classroom.students.passwordOnce')}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={copy}>
              <Icon name={copied ? 'check' : 'copy'} /> {copied ? t('classroom.copied') : t('classroom.copy')}
            </Button>
            <Button className="flex-1" onClick={onClose}>{t('common.close')}</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={t('classroom.students.add')} onClose={onClose} size="sm">
      <form onSubmit={save} className="space-y-5" noValidate>
        <TextField label={t('classroom.students.name')} required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField label={t('auth.email')} type="email" required value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Button type="submit" className="w-full" disabled={busy}>{busy ? t('common.loading') : t('classroom.students.add')}</Button>
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

      {cls.pendingRequests.length > 0 && (
        <Card className="border-highlight-200 bg-highlight-100/40">
          <div className="mb-3">
            <p className="font-bold text-ink">{t('classroom.students.pendingTitle', { count: cls.pendingRequests.length })}</p>
            <p className="text-sm text-ink-muted">{t('classroom.students.pendingHint')}</p>
          </div>
          <div className="space-y-2">
            {cls.pendingRequests.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-highlight-200 text-xs font-bold text-highlight-700">
                  {initials(p.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="truncate text-xs text-ink-muted">{p.email}</p>
                </div>
                <Button variant="secondary" onClick={() => approveJoinRequest(p.id).catch(() => {})}>
                  <Icon name="check" /> {t('classroom.students.approve')}
                </Button>
                <IconButton
                  icon="close"
                  tone="danger"
                  label={t('classroom.students.reject')}
                  onClick={() => setDialog({ kind: 'reject', student: p })}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

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
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-primary-100 text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">{t('teacher.table.student')}</th>
                <th className="px-5 py-3 font-semibold">{t('teacher.table.progress')}</th>
                <th className="px-5 py-3 font-semibold">{t('teacher.table.lastActive')}</th>
                <th className="px-5 py-3 font-semibold">{t('classroom.students.devices')}</th>
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
                    <div className="flex items-center gap-2">
                      <span
                        title={s.devices.map((d) => d.label).join('\n')}
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                          s.devices.length >= 2 ? 'bg-highlight-100 text-highlight-700' : 'bg-primary-50 text-primary-700'
                        }`}
                      >
                        {s.devices.length}/2
                      </span>
                      {s.devices.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setDialog({ kind: 'reset', student: s })}
                          className="text-xs font-semibold text-primary-700 hover:underline"
                        >
                          {t('classroom.students.resetDevices')}
                        </button>
                      )}
                    </div>
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
      {dialog?.kind === 'reset' && (
        <ConfirmModal
          title={t('classroom.students.resetDevices')}
          message={t('classroom.students.resetMessage', { name: dialog.student.name })}
          confirmLabel={t('classroom.students.resetDevices')}
          onConfirm={() => resetDevices(cls.id, dialog.student.id).catch(() => {})}
          onClose={close}
        />
      )}
      {dialog?.kind === 'remove' && (
        <ConfirmModal
          title={t('classroom.students.remove')}
          message={t('classroom.students.removeMessage', { name: dialog.student.name })}
          confirmLabel={t('classroom.students.remove')}
          onConfirm={() => removeStudent(cls.id, dialog.student.id).catch(() => {})}
          onClose={close}
        />
      )}
      {dialog?.kind === 'reject' && (
        <ConfirmModal
          title={t('classroom.students.rejectTitle')}
          message={t('classroom.students.rejectMessage', { name: dialog.student.name })}
          confirmLabel={t('classroom.students.reject')}
          onConfirm={() => rejectJoinRequest(cls.id, dialog.student.id).catch(() => {})}
          onClose={close}
        />
      )}
    </div>
  );
}
