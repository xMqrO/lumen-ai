import { useState } from 'react';
import Switch from './Switch';
import type { Model } from '../types';

interface ToolsPanelProps {
  model: Model;
  open: boolean;
  onClose: () => void;
}

interface ToolRow {
  key: string;
  label: string;
  desc: string;
  icon: string;
}

const TOOLS: ToolRow[] = [
  { key: 'web', label: 'Web search', desc: 'Pull live results', icon: 'ri-global-line' },
  { key: 'vision', label: 'Vision', desc: 'Read images', icon: 'ri-eye-line' },
  { key: 'memory', label: 'Memory', desc: 'Remember facts', icon: 'ri-brain-line' },
  { key: 'code', label: 'Code runner', desc: 'Execute snippets', icon: 'ri-code-box-line' },
];

const FILES = [
  { name: 'Q4-brief.pdf', size: '2.4 MB', icon: 'ri-file-pdf-2-line' },
  { name: 'brand-guide.png', size: '880 KB', icon: 'ri-image-line' },
];

export default function ToolsPanel({ model, open, onClose }: ToolsPanelProps) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    web: true,
    vision: false,
    memory: true,
    code: false,
  });
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are Lumen, a precise and friendly assistant. Be concise, cite sources, and ask clarifying questions when needed.',
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm xl:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-[300px] shrink-0 flex-col border-l border-zinc-200 bg-zinc-50/95 backdrop-blur-xl transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-900/95 xl:static xl:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full xl:hidden'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <i className="ri-equalizer-2-line text-lg text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              Tools & settings
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 xl:hidden"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Active model */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Active model
            </p>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {model.name}
              </span>
              {model.badge && (
                <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  {model.badge}
                </span>
              )}
            </div>
          </div>

          {/* Tools */}
          <section className="mt-5">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Capabilities
            </h4>
            <div className="space-y-1">
              {TOOLS.map((t) => (
                <div
                  key={t.key}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <i className={`${t.icon} text-base`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      {t.label}
                    </p>
                    <p className="truncate text-xs text-zinc-400">{t.desc}</p>
                  </div>
                  <Switch
                    checked={toggles[t.key]}
                    onChange={(v) => setToggles((s) => ({ ...s, [t.key]: v }))}
                    label={t.label}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Parameters */}
          <section className="mt-5">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Model parameters
            </h4>
            <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">Temperature</span>
                <span className="font-medium text-brand-600 dark:text-brand-300">
                  {temperature.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="mt-2 w-full cursor-pointer accent-brand-500"
              />

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">Max tokens</span>
                <span className="font-medium text-brand-600 dark:text-brand-300">
                  {maxTokens}
                </span>
              </div>
              <input
                type="range"
                min={256}
                max={4096}
                step={256}
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="mt-2 w-full cursor-pointer accent-brand-500"
              />
            </div>
          </section>

          {/* System prompt */}
          <section className="mt-5">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              System prompt
            </h4>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value.slice(0, 500))}
              rows={4}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-3 text-sm leading-relaxed text-zinc-700 outline-none transition-colors focus:border-brand-400/70 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200"
            />
            <p className="mt-1 text-right text-[11px] text-zinc-400">
              {systemPrompt.length}/500
            </p>
          </section>

          {/* Files */}
          <section className="mt-2">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Attached files
            </h4>
            <div className="space-y-1">
              {FILES.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <i className={`${f.icon} text-base text-brand-500`} />
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-200">
                    {f.name}
                  </span>
                  <span className="text-xs text-zinc-400">{f.size}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}