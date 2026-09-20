import { memo } from 'react';
import type { Message } from '../types';
import MarkdownRenderer from './markdown/MarkdownRenderer';
import MessageActions from './MessageActions';

interface ChatMessageProps {
  m: Message;
  animate: boolean;
  onRegenerate?: (assistantId: string) => void;
}

const UserMessage = memo(function UserMessage({ m, animate }: ChatMessageProps) {
  return (
    <div className={`flex justify-end py-3 ${animate ? 'animate-fade-up' : ''}`}>
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-500/10 px-4 py-2.5 sm:max-w-[75%] dark:bg-brand-500/15">
        {m.image && (
          <img
            src={m.image}
            alt="Attachment"
            className="mb-2 max-h-64 rounded-lg object-cover"
          />
        )}
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-50">
          {m.content}
        </p>
      </div>
    </div>
  );
});

const AssistantMessage = memo(function AssistantMessage({ m, animate, onRegenerate }: ChatMessageProps) {
  return (
    <div className={`group flex gap-3 py-4 ${animate ? 'animate-fade-up' : ''}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 shadow-sm shadow-brand-500/30">
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Lumen
        </p>

        {m.image && (
          <img
            src={m.image}
            alt="Attachment"
            className="mt-2 max-h-64 rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
          />
        )}

        {m.reasoning && !m.content && (
          <div className="mt-2 space-y-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" />
          </div>
        )}

        {m.content ? (
          <div className="mt-1">
            <MarkdownRenderer content={m.content} />
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:240ms]" />
          </div>
        )}

        {m.content && (
          <MessageActions message={m} onRegenerate={onRegenerate} />
        )}
      </div>
    </div>
  );
});

interface MessageListProps {
  messages: Message[];
  streaming: boolean;
  onRegenerate?: (assistantId: string) => void;
}

export default function MessageList({ messages, streaming, onRegenerate }: MessageListProps) {
  const lastIndex = messages.length - 1;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
      {messages.map((m, i) =>
        m.role === 'user' ? (
          <UserMessage key={m.id} m={m} animate={i === lastIndex} />
        ) : (
          <AssistantMessage
            key={m.id}
            m={m}
            animate={i === lastIndex}
            onRegenerate={onRegenerate}
          />
        ),
      )}
      {streaming && lastIndex >= 0 && messages[lastIndex].content === '' && (
        <p className="pb-2 text-xs text-zinc-400">Lumen is thinking…</p>
      )}
    </div>
  );
}