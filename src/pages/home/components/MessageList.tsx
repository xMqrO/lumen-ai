import { memo } from 'react';
import type { Message } from '../types';

interface MessageItemProps {
  m: Message;
}

const MessageItem = memo(function MessageItem({ m }: MessageItemProps) {
  return (
    <div
      key={m.id}
      className={`group flex gap-3 py-4 ${m.role === 'user' ? 'animate-fade-up' : ''}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
          m.role === 'user' ? 'bg-zinc-700 text-xs font-bold dark:bg-zinc-600' : 'bg-brand-500'
        }`}
      >
        {m.role === 'user' ? 'AV' : <i className="ri-sparkling-2-fill text-sm" />}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {m.role === 'user' ? 'You' : 'Lumen'}
        </p>

        {m.reasoning ? (
          <details
            className="mt-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60"
            open
          >
            <summary className="flex cursor-pointer select-none items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300">
              <i className="ri-loader-4-line animate-spin text-xs text-brand-400" />
              Thinking…
            </summary>
            <p className="max-h-56 overflow-y-auto whitespace-pre-wrap px-3 pb-3 text-xs italic leading-relaxed text-zinc-400/90">
              {m.reasoning}
            </p>
          </details>
        ) : null}

        {m.content ? (
          <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-100">
            {m.content}
          </p>
        ) : (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:240ms]" />
          </div>
        )}

        {m.role === 'assistant' && m.content && (
          <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Copy">
              <i className="ri-file-copy-line text-sm" />
            </button>
            <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Good response">
              <i className="ri-thumb-up-line text-sm" />
            </button>
            <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Regenerate">
              <i className="ri-refresh-line text-sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

interface MessageListProps {
  messages: Message[];
  streaming: boolean;
}

export default function MessageList({ messages, streaming }: MessageListProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
      {messages.map((m) => (
        <MessageItem key={m.id} m={m} />
      ))}

      {streaming && messages[messages.length - 1]?.content === '' && (
        <p className="pb-2 text-xs text-zinc-400">Lumen is thinking…</p>
      )}
    </div>
  );
}