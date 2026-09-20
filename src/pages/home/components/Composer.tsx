import { useEffect, useRef, useState } from 'react';
import { MODELS } from '../data';
import type { Model } from '../types';

interface ComposerProps {
  model: Model;
  onModelChange: (model: Model) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
}

export default function Composer({
  model,
  onModelChange,
  onSend,
  onStop,
  streaming,
}: ComposerProps) {
  const [value, setValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!streaming) textareaRef.current?.focus();
  }, [streaming]);

  const submit = () => {
    const text = value.trim();
    if (!text || streaming) return;
    onSend(text);
    setValue('');
    setMenuOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-zinc-200 bg-white p-2.5 transition-colors focus-within:border-brand-400/70 dark:border-zinc-700/70 dark:bg-zinc-900">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message Lumen…"
          className="block max-h-[200px] w-full resize-none bg-transparent px-2 py-1 text-base text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />

        <div className="mt-1 flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1">
            <button
              aria-label="Attach file"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <i className="ri-attachment-2 text-lg" />
            </button>
            <button
              aria-label="Voice input"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <i className="ri-mic-line text-lg" />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {model.name}
                <i className="ri-arrow-down-s-line text-base" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute bottom-11 left-0 z-20 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 dark:border-zinc-700 dark:bg-zinc-800">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onModelChange(m);
                          setMenuOpen(false);
                        }}
                        className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
                      >
                        <span>{m.name}</span>
                        {m.badge && (
                          <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                            {m.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {streaming ? (
            <button
              onClick={onStop}
              aria-label="Stop generating"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-zinc-800 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900"
            >
              <i className="ri-stop-fill text-base" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!value.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <i className="ri-arrow-up-line text-lg" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-zinc-400">
        Lumen can make mistakes. Verify important information.
      </p>
    </div>
  );
}