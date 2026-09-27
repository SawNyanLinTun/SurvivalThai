import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../Card';
import Button from '../Button';
import Icon from '../Icon';
import { ConfirmModal } from '../Modal';
import { SelectField, TextArea, TextField, Toggle } from '../Form';
import { LETTERS, LEVELS, TONES } from '../../data/classMeta';
import { deleteClass, regenerateJoinCode, updateClass } from '../../data/classStore';

const DETAIL_KEYS = ['name', 'level', 'description', 'schedule', 'startDate', 'endDate', 'letter', 'tone'];

export default function SettingsTab({ cls }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => Object.fromEntries(DETAIL_KEYS.map((k) => [k, cls[k]])));
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const set = (key) => (e) => {
    setSaved(false);
    setForm({ ...form, [key]: e?.target ? e.target.value : e });
  };
  const setSetting = (key) => (value) => updateClass(cls.id, (c) => ({ settings: { ...c.settings, [key]: value } }));
  const dirty = DETAIL_KEYS.some((k) => form[k] !== cls[k]);

  const save = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = t('auth.required');
    if (form.startDate && form.endDate && form.endDate < form.startDate) next.endDate = t('classroom.create.endBeforeStart');
    setErrors(next);
    if (Object.keys(next).length) return;
    updateClass(cls.id, { ...form, name: form.name.trim() });
    setSaved(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <form onSubmit={save} noValidate>
        <Card className="space-y-5">
          <h2 className="text-lg font-bold text-ink">{t('classroom.settings.details')}</h2>
          <TextField label={t('classroom.fields.name')} required value={form.name} onChange={set('name')} error={errors.name} />
          <SelectField
            label={t('classroom.fields.level')}
            value={form.level}
            onChange={set('level')}
            options={LEVELS.map((l) => ({ value: l, label: t(`courses.${l}`) }))}
          />
          <TextArea label={t('classroom.fields.description')} value={form.description} onChange={set('description')} />
          <TextField label={t('classroom.fields.schedule')} value={form.schedule} onChange={set('schedule')} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label={t('classroom.fields.startDate')} type="date" value={form.startDate} onChange={set('startDate')} />
            <TextField label={t('classroom.fields.endDate')} type="date" value={form.endDate} onChange={set('endDate')} error={errors.endDate} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label={t('classroom.fields.letter')}
              value={form.letter}
              onChange={set('letter')}
              options={LETTERS.map((l) => ({ value: l, label: l }))}
            />
            <SelectField
              label={t('classroom.fields.color')}
              value={form.tone}
              onChange={set('tone')}
              options={Object.keys(TONES).map((k) => ({ value: k, label: t(`classroom.tones.${k}`) }))}
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            {saved && !dirty && (
              <span className="flex items-center gap-1 text-sm font-semibold text-success-700">
                <Icon name="check" className="h-4 w-4" /> {t('classroom.settings.saved')}
              </span>
            )}
            <Button type="submit" disabled={!dirty}>{t('common.save')}</Button>
          </div>
        </Card>
      </form>

      <div className="space-y-6">
        <Card className="space-y-5">
          <h2 className="text-lg font-bold text-ink">{t('classroom.settings.access')}</h2>
          <Toggle
            label={t('classroom.settings.published')}
            description={t('classroom.settings.publishedHint')}
            checked={cls.published}
            onChange={(v) => updateClass(cls.id, { published: v })}
          />
          <Toggle
            label={t('classroom.settings.allowMessages')}
            description={t('classroom.settings.allowMessagesHint')}
            checked={cls.settings.allowMessages}
            onChange={setSetting('allowMessages')}
          />
          <Toggle
            label={t('classroom.settings.allowLate')}
            description={t('classroom.settings.allowLateHint')}
            checked={cls.settings.allowLate}
            onChange={setSetting('allowLate')}
          />
          <Toggle
            label={t('classroom.settings.showGrades')}
            description={t('classroom.settings.showGradesHint')}
            checked={cls.settings.showGrades}
            onChange={setSetting('showGrades')}
          />
          <SelectField
            label={t('classroom.settings.instructionLanguage')}
            value={cls.settings.instructionLanguage}
            onChange={(e) => setSetting('instructionLanguage')(e.target.value)}
            options={[
              { value: 'my', label: 'မြန်မာ' },
              { value: 'en', label: 'English' },
              { value: 'both', label: 'မြန်မာ + English' },
            ]}
          />
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-ink">{t('classroom.joinCode')}</h2>
          <p className="text-sm text-ink-muted">{t('classroom.settings.joinCodeHint')}</p>
          <div className="flex items-center gap-3">
            <span className="select-all rounded-xl bg-page px-4 py-2 font-mono text-lg font-bold tracking-[0.2em] text-ink">{cls.joinCode}</span>
            <Button variant="secondary" size="sm" onClick={() => setConfirm('code')}>{t('classroom.settings.newCode')}</Button>
          </div>
        </Card>

        <Card className="space-y-3 border-highlight-200">
          <h2 className="text-lg font-bold text-highlight-700">{t('classroom.settings.dangerZone')}</h2>
          <p className="text-sm text-ink-muted">{t('classroom.settings.deleteHint')}</p>
          <Button variant="danger" onClick={() => setConfirm('delete')}>
            <Icon name="trash" /> {t('classroom.settings.deleteClass')}
          </Button>
        </Card>
      </div>

      {confirm === 'code' && (
        <ConfirmModal
          title={t('classroom.settings.newCode')}
          message={t('classroom.settings.newCodeMessage')}
          confirmLabel={t('classroom.settings.newCode')}
          onConfirm={() => regenerateJoinCode(cls.id)}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === 'delete' && (
        <ConfirmModal
          title={t('classroom.settings.deleteClass')}
          message={t('classroom.settings.deleteMessage', { name: cls.name })}
          confirmLabel={t('common.delete')}
          onConfirm={() => {
            navigate('/teacher', { replace: true });
            deleteClass(cls.id);
          }}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
