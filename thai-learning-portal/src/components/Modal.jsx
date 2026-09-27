import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

export default function Modal({ title, onClose, children, footer, size = 'md' }) {
  const { t } = useTranslation();
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('input, textarea, select')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl' }[size];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-t-3xl bg-surface text-ink shadow-2xl sm:rounded-3xl`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-primary-100 px-6 py-4">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rounded-full p-2 text-ink-muted hover:bg-primary-50 hover:text-ink"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-primary-100 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose }) {
  const { t } = useTranslation();
  return (
    <Modal
      title={title}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 font-semibold text-ink-muted hover:bg-primary-50">
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-xl bg-highlight-500 px-4 py-2 font-semibold text-on-highlight hover:bg-highlight-600"
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-ink-muted">{message}</p>
    </Modal>
  );
}
