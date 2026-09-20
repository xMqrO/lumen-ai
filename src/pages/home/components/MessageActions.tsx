import { memo, useState } from 'react';
import type { Message } from '../types';

interface MessageActionsProps {
  message: Message;
  onRegenerate?: (assistantId: string) => void;
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(text);
  }
}

const MessageActions = memo(function MessageActions({ message, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = () => {
    copyText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
      <button
        onClick={handleCopy}
        aria-label="Copy message"
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-600 active:scale-90 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        <i className={copied ? 'ri-check-line text-sm text-emerald-500' : 'ri-file-copy-line text-sm'} />
      </button>
      <button
        onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
        aria-label="Good response"
        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all duration-150 active:scale-90 ${
          feedback === 'up'
            ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
            : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
        }`}
      >
        <i className="ri-thumb-up-line text-sm" />
      </button>
      <button
        onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
        aria-label="Bad response"
        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all duration-150 active:scale-90 ${
          feedback === 'down'
            ? 'bg-red-100 text-red-500 dark:bg-red-500/15 dark:text-red-400'
            : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
        }`}
      >
        <i className="ri-thumb-down-line text-sm" />
      </button>
      {onRegenerate && (
        <button
          onClick={() => onRegenerate(message.id)}
          aria-label="Regenerate response"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-600 active:scale-90 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <i className="ri-refresh-line text-sm" />
        </button>
      )}
    </div>
  );
});

export default MessageActions;