import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../Card';
import Icon from '../Icon';
import { refreshClasses, sendMessage } from '../../data/classStore';
import { formatTime, initials } from '../../utils/format';

export default function MessagesTab({ cls }) {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState('');
  const endRef = useRef(null);

  const threads = [
    { id: 'all', name: t('classroom.messages.announcements'), announcement: true },
    ...cls.students.map((s) => ({ id: s.id, name: s.name })),
  ];
  const active = threads.find((th) => th.id === params.get('thread')) || threads[0];
  const messages = cls.messages.filter((m) => m.threadId === active.id);
  const lastOf = (id) => [...cls.messages].reverse().find((m) => m.threadId === id);
  const nameOf = (from) => (from === 'teacher' ? t('auth.teacher') : cls.students.find((s) => s.id === from)?.name || '?');

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [active.id, messages.length]);

  // Pick up student replies while this tab is open.
  useEffect(() => {
    const timer = setInterval(() => document.visibilityState === 'visible' && refreshClasses(), 20000);
    return () => clearInterval(timer);
  }, []);

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    sendMessage(cls.id, active.id, text).catch(() => setDraft(text));
  };

  return (
    <Card className="grid overflow-hidden !p-0 md:h-[36rem] md:grid-cols-[18rem_minmax(0,1fr)]">
      {/* Thread list */}
      <ul className="max-h-60 divide-y divide-primary-100/70 overflow-y-auto border-b border-primary-100 md:max-h-none md:border-b-0 md:border-r">
        {threads.map((th) => {
          const last = lastOf(th.id);
          const selected = th.id === active.id;
          return (
            <li key={th.id}>
              <button
                type="button"
                onClick={() => setParams({ thread: th.id })}
                aria-current={selected}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${selected ? 'bg-primary-50' : 'hover:bg-primary-50/50'}`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    th.announcement ? 'bg-primary-600 text-on-primary' : 'bg-accent-200 text-accent-700'
                  }`}
                >
                  {th.announcement ? <Icon name="megaphone" className="h-5 w-5" /> : initials(th.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${selected ? 'font-bold text-primary-700' : 'font-semibold text-ink'}`}>{th.name}</span>
                  <span className="block truncate text-xs text-ink-muted">{last ? last.text : t('classroom.messages.noMessages')}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Conversation */}
      <div className="flex min-h-[28rem] flex-col">
        <div className="border-b border-primary-100 px-5 py-3">
          <p className="font-bold text-ink">{active.name}</p>
          <p className="text-xs text-ink-muted">
            {active.announcement ? t('classroom.messages.announcementHint', { count: cls.students.length }) : t('classroom.messages.privateHint')}
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-page/50 px-5 py-4">
          {messages.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">{t('classroom.messages.startConversation')}</p>}
          {messages.map((m) => {
            const mine = m.from === 'teacher';
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? 'rounded-br-md bg-primary-600 text-on-primary' : 'rounded-bl-md bg-surface text-ink shadow-soft'}`}>
                  {!mine && <p className="text-xs font-bold text-accent-700">{nameOf(m.from)}</p>}
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-1 text-[11px] ${mine ? 'text-on-primary/70' : 'text-ink-faint'}`}>{formatTime(m.at, i18n.language)}</p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {!cls.settings.allowMessages && !active.announcement && (
          <p className="border-t border-primary-100 bg-accent-100/50 px-5 py-2 text-xs text-accent-700">{t('classroom.messages.repliesOff')}</p>
        )}
        <form onSubmit={send} className="flex items-end gap-2 border-t border-primary-100 p-3">
          <label htmlFor="message-draft" className="sr-only">{t('classroom.messages.placeholder')}</label>
          <textarea
            id="message-draft"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) send(e);
            }}
            placeholder={active.announcement ? t('classroom.messages.announcementPlaceholder') : t('classroom.messages.placeholder')}
            className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border-2 border-primary-100 bg-surface px-4 py-2.5 text-ink placeholder:text-ink-faint focus:border-primary-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label={t('classroom.messages.send')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-on-primary transition-colors hover:bg-primary-700 disabled:opacity-40"
          >
            <Icon name="send" />
          </button>
        </form>
      </div>
    </Card>
  );
}
