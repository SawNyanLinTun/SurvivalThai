import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/format';

// Printable certificate. Uses theme colors so it matches the chosen portal theme.
export default function Certificate({ cert, courseName, studentName, number, date, className = '' }) {
  const { t, i18n } = useTranslation();
  const modern = cert.style === 'modern';

  return (
    <div
      className={`relative aspect-[1.414/1] w-full overflow-hidden rounded-2xl bg-white text-[#1F1B2E] shadow-soft ${className}`}
      style={{ containerType: 'inline-size' }}
    >
      {modern ? (
        <div className="absolute inset-y-0 left-0 w-[14%] bg-gradient-to-b from-primary-600 to-primary-900" />
      ) : (
        <div className="absolute inset-[3%] rounded-xl border-[0.6cqw] border-double border-accent-500" />
      )}
      <div className={`relative flex h-full flex-col items-center justify-center text-center ${modern ? 'pl-[16%] pr-[5%]' : 'px-[10%]'}`}>
        <p className="font-thai font-bold text-accent-600" style={{ fontSize: '4.5cqw' }}>ประกาศนียบัตร</p>
        <p className="mt-[1cqw] font-bold uppercase tracking-[0.25em] text-primary-700" style={{ fontSize: '1.6cqw' }}>
          {cert.title || t('classroom.certificate.defaultTitle')}
        </p>
        <p className="mt-[3cqw] text-[#6B6680]" style={{ fontSize: '1.7cqw' }}>{t('classroom.certificate.presentedTo')}</p>
        <p className="mt-[1cqw] border-b-2 border-accent-400 px-[4cqw] pb-[0.8cqw] font-extrabold" style={{ fontSize: '4.6cqw', fontFamily: 'Georgia, serif' }}>
          {studentName}
        </p>
        <p className="mt-[2cqw] max-w-[80%] text-[#6B6680]" style={{ fontSize: '1.6cqw' }}>
          {t('classroom.certificate.body', { className: courseName })}
        </p>
        <div className="mt-[4cqw] flex w-full items-end justify-between gap-[4cqw]" style={{ fontSize: '1.4cqw' }}>
          <div className="text-left">
            <p className="font-semibold">{formatDate(date, i18n.language)}</p>
            <p className="text-[#6B6680]">{t('classroom.certificate.date')}</p>
          </div>
          <div className="flex h-[9cqw] w-[9cqw] shrink-0 items-center justify-center rounded-full bg-accent-400 font-thai font-bold text-on-accent shadow" style={{ fontSize: '3.5cqw' }}>
            ส
          </div>
          <div className="text-right">
            <p className="font-semibold" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '2cqw' }}>{cert.signer || '—'}</p>
            <p className="text-[#6B6680]">{cert.signerTitle}</p>
          </div>
        </div>
        {number && <p className="absolute bottom-[4%] right-[5%] font-mono text-[#A7A3B5]" style={{ fontSize: '1.1cqw' }}>{number}</p>}
      </div>
    </div>
  );
}
