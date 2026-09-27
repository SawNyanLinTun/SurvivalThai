import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../Card';
import Button from '../Button';
import Badge from '../Badge';
import Icon from '../Icon';
import Modal, { ConfirmModal } from '../Modal';
import EmptyState from '../EmptyState';
import IconButton from './IconButton';
import { TextArea, TextField } from '../Form';
import { ITEM_TYPES } from '../../data/classMeta';
import {
  addModule,
  addModuleItem,
  deleteModule,
  deleteModuleItem,
  moveModule,
  moveModuleItem,
  updateModule,
} from '../../data/classStore';

function ModuleTitleModal({ initial = '', title, onSave, onClose }) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initial);
  const save = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSave(value.trim());
    onClose();
  };
  return (
    <Modal title={title} onClose={onClose} size="sm">
      <form onSubmit={save} className="space-y-5">
        <TextField
          label={t('classroom.modules.moduleName')}
          placeholder={t('classroom.modules.moduleNamePlaceholder')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={!value.trim()}>{t('common.save')}</Button>
      </form>
    </Modal>
  );
}

function ItemModal({ onSave, onClose }) {
  const { t } = useTranslation();
  const [item, setItem] = useState({ type: 'lesson', title: '', url: '', content: '' });
  const save = (e) => {
    e.preventDefault();
    if (!item.title.trim()) return;
    onSave({ ...item, title: item.title.trim(), url: item.url.trim() });
    onClose();
  };
  return (
    <Modal title={t('classroom.modules.addItem')} onClose={onClose}>
      <form onSubmit={save} className="space-y-5">
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-ink">{t('classroom.modules.itemType')}</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {ITEM_TYPES.map(({ id, icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={item.type === id}
                onClick={() => setItem({ ...item, type: id })}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 text-xs font-semibold transition-all ${
                  item.type === id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-primary-100 text-ink-muted hover:border-primary-300'
                }`}
              >
                <Icon name={icon} />
                {t(`classroom.itemTypes.${id}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <TextField
          label={t('classroom.fields.title')}
          required
          value={item.title}
          onChange={(e) => setItem({ ...item, title: e.target.value })}
        />
        {item.type === 'lesson' ? (
          <TextArea
            label={t('classroom.modules.content')}
            rows={5}
            value={item.content}
            onChange={(e) => setItem({ ...item, content: e.target.value })}
          />
        ) : (
          <TextField
            label={t('classroom.modules.url')}
            type="url"
            placeholder="https://"
            hint={t('classroom.modules.urlHint')}
            value={item.url}
            onChange={(e) => setItem({ ...item, url: e.target.value })}
          />
        )}
        <Button type="submit" className="w-full" disabled={!item.title.trim()}>{t('classroom.modules.addItem')}</Button>
      </form>
    </Modal>
  );
}

export default function ModulesTab({ cls }) {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState(null);
  const close = () => setDialog(null);
  const icons = Object.fromEntries(ITEM_TYPES.map((x) => [x.id, x.icon]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-muted">{t('classroom.modules.intro')}</p>
        <Button onClick={() => setDialog({ kind: 'newModule' })}>
          <Icon name="plus" /> {t('classroom.modules.addModule')}
        </Button>
      </div>

      {cls.modules.length === 0 && (
        <EmptyState
          icon="modules"
          title={t('classroom.modules.emptyTitle')}
          text={t('classroom.modules.emptyText')}
          action={<Button onClick={() => setDialog({ kind: 'newModule' })}><Icon name="plus" /> {t('classroom.modules.addModule')}</Button>}
        />
      )}

      {cls.modules.map((m, mi) => (
        <Card key={m.id} className="!p-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-primary-100 px-5 py-4">
            <div className="min-w-[12rem] flex-1">
              <h3 className="break-words font-bold text-ink">{m.title}</h3>
              <p className="text-xs text-ink-muted">{t('classroom.modules.itemCount', { count: m.items.length })}</p>
            </div>
            <Badge tone={m.published ? 'success' : 'neutral'}>{m.published ? t('classroom.published') : t('classroom.draft')}</Badge>
            <div className="flex items-center">
              <IconButton
                icon={m.published ? 'eyeSlash' : 'eye'}
                label={m.published ? t('classroom.unpublish') : t('classroom.publish')}
                onClick={() => updateModule(cls.id, m.id, { published: !m.published }).catch(() => {})}
              />
              <IconButton icon="chevronUp" label={t('classroom.moveUp')} disabled={mi === 0} onClick={() => moveModule(cls.id, mi, -1).catch(() => {})} />
              <IconButton icon="chevronDown" label={t('classroom.moveDown')} disabled={mi === cls.modules.length - 1} onClick={() => moveModule(cls.id, mi, 1).catch(() => {})} />
              <IconButton icon="pencil" label={t('common.edit')} onClick={() => setDialog({ kind: 'rename', module: m })} />
              <IconButton icon="trash" tone="danger" label={t('common.delete')} onClick={() => setDialog({ kind: 'deleteModule', module: m })} />
            </div>
          </div>

          <ul className="divide-y divide-primary-100/70">
            {m.items.map((item, ii) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon name={icons[item.type]} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className="block truncate font-medium text-ink hover:text-primary-700 hover:underline">
                      {item.title}
                    </a>
                  ) : (
                    <p className="truncate font-medium text-ink">{item.title}</p>
                  )}
                  <p className="text-xs text-ink-muted">{t(`classroom.itemTypes.${item.type}`)}</p>
                </div>
                <IconButton icon="chevronUp" label={t('classroom.moveUp')} disabled={ii === 0} onClick={() => moveModuleItem(cls.id, m.id, ii, -1).catch(() => {})} />
                <IconButton icon="chevronDown" label={t('classroom.moveDown')} disabled={ii === m.items.length - 1} onClick={() => moveModuleItem(cls.id, m.id, ii, 1).catch(() => {})} />
                <IconButton icon="trash" tone="danger" label={t('common.delete')} onClick={() => deleteModuleItem(cls.id, m.id, item.id).catch(() => {})} />
              </li>
            ))}
          </ul>
          <div className="px-5 py-3">
            <button
              type="button"
              onClick={() => setDialog({ kind: 'item', module: m })}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-50"
            >
              <Icon name="plus" className="h-4 w-4" /> {t('classroom.modules.addItem')}
            </button>
          </div>
        </Card>
      ))}

      {dialog?.kind === 'newModule' && (
        <ModuleTitleModal title={t('classroom.modules.addModule')} onSave={(title) => addModule(cls.id, title).catch(() => {})} onClose={close} />
      )}
      {dialog?.kind === 'rename' && (
        <ModuleTitleModal
          title={t('classroom.modules.renameModule')}
          initial={dialog.module.title}
          onSave={(title) => updateModule(cls.id, dialog.module.id, { title }).catch(() => {})}
          onClose={close}
        />
      )}
      {dialog?.kind === 'item' && <ItemModal onSave={(item) => addModuleItem(cls.id, dialog.module.id, item).catch(() => {})} onClose={close} />}
      {dialog?.kind === 'deleteModule' && (
        <ConfirmModal
          title={t('classroom.modules.deleteTitle')}
          message={t('classroom.modules.deleteMessage', { name: dialog.module.title })}
          confirmLabel={t('common.delete')}
          onConfirm={() => deleteModule(cls.id, dialog.module.id).catch(() => {})}
          onClose={close}
        />
      )}
    </div>
  );
}
