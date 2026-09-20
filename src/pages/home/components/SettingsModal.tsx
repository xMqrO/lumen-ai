import Switch from './Switch';
import Providers from './Providers';
import type { Settings } from '../types';
import { MODELS } from '../data';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

const LANGUAGES = [
  'English', 'Español', 'Français', 'Deutsch', '中文', '日本語',
  '한국어', 'Português', 'Italiano', 'العربية', 'Русский', 'हिन्दी',
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
      <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </h4>
      {children}
    </section>
  );
}

function Row({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-zinc-400">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsModal({
  open,
  onClose,
  settings,
  onChange,
}: SettingsModalProps) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <i className="ri-settings-3-line text-base" />
            </span>
            <h2 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <Section title="General">
            <Row label="Theme">
              <div className="flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
                {(['light', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onChange({ theme: t })}
                    className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      settings.theme === t
                        ? 'bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Row>
            <Row label="Default model">
              <select
                value={settings.defaultModel}
                onChange={(e) => onChange({ defaultModel: e.target.value })}
                className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Row>
            <Row label="Language">
              <select
                value={settings.language}
                onChange={(e) => onChange({ language: e.target.value })}
                className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Row>
          </Section>

          <Section title="Generation">
            <Row
              label="Temperature"
              desc={`Controls randomness · ${settings.temperature.toFixed(1)}`}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={settings.temperature}
                onChange={(e) => onChange({ temperature: Number(e.target.value) })}
                className="w-40 cursor-pointer accent-brand-500"
              />
            </Row>
            <Row label="Max tokens" desc={`${settings.maxTokens} tokens per response`}>
              <input
                type="range"
                min={256}
                max={4096}
                step={256}
                value={settings.maxTokens}
                onChange={(e) => onChange({ maxTokens: Number(e.target.value) })}
                className="w-40 cursor-pointer accent-brand-500"
              />
            </Row>
            <Row label="Stream responses" desc="Show text as it's generated">
              <Switch
                checked={settings.stream}
                onChange={(v) => onChange({ stream: v })}
                label="Stream responses"
              />
            </Row>
            <Row label="Send with Enter" desc="Enter sends, Shift+Enter for new line">
              <Switch
                checked={settings.sendOnEnter}
                onChange={(v) => onChange({ sendOnEnter: v })}
                label="Send with Enter"
              />
            </Row>
            <Row label="Auto-title chats" desc="Generate a title from your first message">
              <Switch
                checked={settings.autoTitle}
                onChange={(v) => onChange({ autoTitle: v })}
                label="Auto-title chats"
              />
            </Row>
          </Section>

          <Section title="Capabilities">
            <Row label="Web search" desc="Pull live results with citations">
              <Switch
                checked={settings.webSearch}
                onChange={(v) => onChange({ webSearch: v })}
                label="Web search"
              />
            </Row>
            <Row label="Vision" desc="Read and analyze images">
              <Switch
                checked={settings.vision}
                onChange={(v) => onChange({ vision: v })}
                label="Vision"
              />
            </Row>
            <Row label="Memory" desc="Remember facts across chats">
              <Switch
                checked={settings.memory}
                onChange={(v) => onChange({ memory: v })}
                label="Memory"
              />
            </Row>
            <Row label="Code runner" desc="Execute code snippets safely">
              <Switch
                checked={settings.codeRunner}
                onChange={(v) => onChange({ codeRunner: v })}
                label="Code runner"
              />
            </Row>
            <Row label="Voice input" desc="Speak your message instead of typing">
              <Switch
                checked={settings.voice}
                onChange={(v) => onChange({ voice: v })}
                label="Voice input"
              />
            </Row>
          </Section>

          <Section title="System prompt">
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => onChange({ systemPrompt: e.target.value.slice(0, 500) })}
              rows={4}
              className="w-full resize-none rounded-lg border border-zinc-200 bg-white p-3 text-sm leading-relaxed text-zinc-700 outline-none transition-colors focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            />
            <p className="mt-1 text-right text-[11px] text-zinc-400">
              {settings.systemPrompt.length}/500
            </p>
          </Section>

          <Section title="Providers">
            <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
              Connect your AI providers to power the chatbot. Keys are stored locally in your
              browser for now — we'll move them to a secure Backend secret next.
            </p>
            <Providers />
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <span className="text-xs text-zinc-400">Lumen v1.0</span>
          <button
            onClick={onClose}
            className="cursor-pointer whitespace-nowrap rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}