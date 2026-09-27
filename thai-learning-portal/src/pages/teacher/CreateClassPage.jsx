import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { TextArea, TextField, Toggle } from '../../components/Form';
import { createClass } from '../../data/classStore';
import { displayName, getUser } from '../../auth';
import { LETTERS, LEVELS, TONES } from '../../data/classMeta';

export default function CreateClassPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    level: 'beginner',
    description: '',
    schedule: '',
    startDate: '',
    endDate: '',
    letter: 'ก',
    tone: 'primary',
    certificate: true,
  });
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => setForm({ ...form, [key]: e?.target ? e.target.value : e });

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = t('auth.required');
    if (form.startDate && form.endDate && form.endDate < form.startDate) next.endDate = t('classroom.create.endBeforeStart');
    setErrors(next);
    if (Object.keys(next).length) return;
    const id = createClass({ ...form, name: form.name.trim(), signer: displayName(getUser()) });
    navigate(`/teacher/classes/${id}/modules`);
  };

  const tone = TONES[form.tone];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <Link to="/teacher" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-primary-700">
          <Icon name="arrowLeft" className="h-4 w-4" />
          {t('classroom.backToDashboard')}
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold text-ink">{t('classroom.create.title')}</h1>
        <p className="mt-1 text-ink-muted">{t('classroom.create.subtitle')}</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-6">
            <Card className="space-y-5">
              <h2 className="text-lg font-bold text-ink">{t('classroom.create.basics')}</h2>
              <TextField
                label={t('classroom.fields.name')}
                placeholder={t('classroom.create.namePlaceholder')}
                required
                value={form.name}
                onChange={set('name')}
                error={errors.name}
              />
              <fieldset>
                <legend className="mb-1.5 text-sm font-semibold text-ink">{t('classroom.fields.level')}</legend>
                <div className="grid grid-cols-3 gap-2">
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      aria-pressed={form.level === lvl}
                      onClick={() => set('level')(lvl)}
                      className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                        form.level === lvl
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-primary-100 text-ink-muted hover:border-primary-300'
                      }`}
                    >
                      {t(`courses.${lvl}`)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <TextArea
                label={t('classroom.fields.description')}
                placeholder={t('classroom.create.descriptionPlaceholder')}
                value={form.description}
                onChange={set('description')}
              />
            </Card>

            <Card className="space-y-5">
              <h2 className="text-lg font-bold text-ink">{t('classroom.create.scheduleTitle')}</h2>
              <TextField
                label={t('classroom.fields.schedule')}
                placeholder="Mon, Wed · 18:00"
                value={form.schedule}
                onChange={set('schedule')}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label={t('classroom.fields.startDate')} type="date" value={form.startDate} onChange={set('startDate')} />
                <TextField
                  label={t('classroom.fields.endDate')}
                  type="date"
                  value={form.endDate}
                  onChange={set('endDate')}
                  error={errors.endDate}
                />
              </div>
            </Card>

            <Card className="space-y-5">
              <h2 className="text-lg font-bold text-ink">{t('classroom.create.appearance')}</h2>
              <fieldset>
                <legend className="mb-1.5 text-sm font-semibold text-ink">{t('classroom.fields.letter')}</legend>
                <div className="flex flex-wrap gap-2">
                  {LETTERS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      aria-pressed={form.letter === l}
                      onClick={() => set('letter')(l)}
                      className={`h-11 w-11 rounded-xl font-thai text-xl font-bold transition-all ${
                        form.letter === l ? `${tone.tile} ring-2 ring-primary-500` : 'bg-page text-ink-muted hover:bg-primary-50'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-1.5 text-sm font-semibold text-ink">{t('classroom.fields.color')}</legend>
                <div className="flex gap-3">
                  {Object.entries(TONES).map(([id, v]) => (
                    <button
                      key={id}
                      type="button"
                      aria-label={id}
                      aria-pressed={form.tone === id}
                      onClick={() => set('tone')(id)}
                      className={`h-10 w-10 rounded-full ${v.swatch} ring-offset-2 ring-offset-surface transition-all ${
                        form.tone === id ? 'ring-4 ring-primary-300' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </fieldset>
            </Card>

            <Card>
              <Toggle
                label={t('classroom.create.certificateToggle')}
                description={t('classroom.create.certificateHint')}
                checked={form.certificate}
                onChange={set('certificate')}
              />
            </Card>
          </div>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">{t('classroom.create.preview')}</p>
            <Card>
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl font-thai text-3xl font-bold ${tone.tile}`}>
                {form.letter}
              </span>
              <h3 className="mt-4 break-words text-lg font-bold text-ink">{form.name || t('classroom.create.namePlaceholder')}</h3>
              <p className="mt-1 text-sm text-ink-muted">{t(`courses.${form.level}`)}</p>
              {form.schedule && (
                <p className="mt-2 flex items-center gap-1 text-sm text-ink-muted">
                  <Icon name="clock" className="h-4 w-4" /> {form.schedule}
                </p>
              )}
            </Card>
            <Button type="submit" size="lg" className="mt-5 w-full">
              <Icon name="plus" />
              {t('classroom.create.submit')}
            </Button>
            <p className="mt-3 text-center text-xs text-ink-muted">{t('classroom.create.draftNote')}</p>
          </aside>
        </form>
      </main>
    </div>
  );
}
