import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../Card';
import Button from '../Button';
import Badge from '../Badge';
import Icon from '../Icon';
import Modal from '../Modal';
import EmptyState from '../EmptyState';
import Certificate from './Certificate';
import { SelectField, TextField, Toggle } from '../Form';
import { isEligible, issueCertificate, revokeCertificate, updateCertificate } from '../../data/classStore';
import { formatDate } from '../../utils/format';

export default function CertificateTab({ cls }) {
  const { t, i18n } = useTranslation();
  const cert = cls.certificate;
  const [viewing, setViewing] = useState(null);
  const set = (key) => (e) => updateCertificate(cls.id, { [key]: e?.target ? e.target.value : e });
  const today = new Date().toISOString().slice(0, 10);

  const issuedFor = (id) => cert.issued.find((i) => i.studentId === id);
  const eligibleNotIssued = cls.students.filter((s) => isEligible(cls, s) && !issuedFor(s.id));

  return (
    <div className="space-y-6">
      <Card>
        <Toggle
          label={t('classroom.certificate.enable')}
          description={t('classroom.certificate.enableHint')}
          checked={cert.enabled}
          onChange={set('enabled')}
        />
      </Card>

      {cert.enabled && (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <Card className="space-y-5">
              <h2 className="text-lg font-bold text-ink">{t('classroom.certificate.design')}</h2>
              <TextField label={t('classroom.certificate.titleField')} value={cert.title} onChange={set('title')} />
              <div className="grid grid-cols-2 gap-4">
                <TextField label={t('classroom.certificate.signer')} value={cert.signer} onChange={set('signer')} />
                <TextField label={t('classroom.certificate.signerTitle')} value={cert.signerTitle} onChange={set('signerTitle')} />
              </div>
              <SelectField
                label={t('classroom.certificate.style')}
                value={cert.style}
                onChange={set('style')}
                options={[
                  { value: 'classic', label: t('classroom.certificate.styles.classic') },
                  { value: 'modern', label: t('classroom.certificate.styles.modern') },
                ]}
              />
              <h2 className="pt-2 text-lg font-bold text-ink">{t('classroom.certificate.requirements')}</h2>
              <div>
                <label htmlFor="min-progress" className="mb-1.5 flex justify-between text-sm font-semibold text-ink">
                  {t('classroom.certificate.minProgress')}
                  <span className="tabular-nums text-primary-700">{cert.minProgress}%</span>
                </label>
                <input
                  id="min-progress"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={cert.minProgress}
                  onChange={(e) => updateCertificate(cls.id, { minProgress: Number(e.target.value) })}
                  className="w-full accent-[rgb(var(--c-primary-600))]"
                />
              </div>
              <Toggle
                label={t('classroom.certificate.requireAll')}
                description={t('classroom.certificate.requireAllHint')}
                checked={cert.requireAllAssignments}
                onChange={set('requireAllAssignments')}
              />
            </Card>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">{t('classroom.create.preview')}</p>
              <Certificate cert={cert} courseName={cls.name} studentName="May Thu" number="ST-2026-0000" date={today} />
            </div>
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold text-ink">{t('classroom.certificate.students')}</h2>
              <Button
                variant="accent"
                disabled={!eligibleNotIssued.length}
                onClick={() => eligibleNotIssued.forEach((s) => issueCertificate(cls.id, s.id))}
              >
                <Icon name="trophy" /> {t('classroom.certificate.issueAll', { count: eligibleNotIssued.length })}
              </Button>
            </div>
            {cls.students.length === 0 ? (
              <EmptyState icon="users" title={t('classroom.students.emptyTitle')} text={t('classroom.students.emptyText')} />
            ) : (
              <Card className="divide-y divide-primary-100/70 !p-0">
                {cls.students.map((s) => {
                  const issued = issuedFor(s.id);
                  const eligible = isEligible(cls, s);
                  return (
                    <div key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{s.name}</p>
                        <p className="text-xs text-ink-muted">
                          {t('teacher.table.progress')}: {s.progress}%
                          {issued && ` · ${issued.number} · ${formatDate(issued.date, i18n.language)}`}
                        </p>
                      </div>
                      {issued ? (
                        <>
                          <Badge tone="success"><Icon name="check" className="h-3 w-3" /> {t('classroom.certificate.issued')}</Badge>
                          <Button size="sm" variant="secondary" onClick={() => setViewing({ student: s, issued })}>
                            {t('classroom.certificate.view')}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => revokeCertificate(cls.id, s.id)}>
                            {t('classroom.certificate.revoke')}
                          </Button>
                        </>
                      ) : eligible ? (
                        <>
                          <Badge tone="accent">{t('classroom.certificate.eligible')}</Badge>
                          <Button size="sm" onClick={() => issueCertificate(cls.id, s.id)}>{t('classroom.certificate.issue')}</Button>
                        </>
                      ) : (
                        <Badge tone="neutral">{t('classroom.certificate.notEligible')}</Badge>
                      )}
                    </div>
                  );
                })}
              </Card>
            )}
          </div>
        </>
      )}

      {viewing && (
        <Modal
          title={t('classroom.certificate.certificateFor', { name: viewing.student.name })}
          onClose={() => setViewing(null)}
          size="lg"
          footer={
            <Button onClick={() => window.print()}>
              <Icon name="document" /> {t('classroom.certificate.print')}
            </Button>
          }
        >
          <div className="print-area">
            <Certificate
              cert={cert}
              courseName={cls.name}
              studentName={viewing.student.name}
              number={viewing.issued.number}
              date={viewing.issued.date}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
