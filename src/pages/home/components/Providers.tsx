import { useEffect, useState } from 'react';
import type { Provider } from '../types';
import { DEFAULT_PROVIDERS } from '../data';

function loadProviders(): Provider[] {
  try {
    const raw = window.localStorage.getItem('lumen_providers');
    if (raw) return JSON.parse(raw) as Provider[];
  } catch {
    /* ignore */
  }
  return DEFAULT_PROVIDERS;
}

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>(loadProviders);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Provider | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    window.localStorage.setItem('lumen_providers', JSON.stringify(providers));
  }, [providers]);

  const startEdit = (p: Provider) => {
    setEditingId(p.id);
    setDraft({ ...p });
    setShowKey(false);
  };

  const saveDraft = () => {
    if (!draft) return;
    setProviders((prev) => prev.map((x) => (x.id === draft.id ? draft : x)));
    setEditingId(null);
    setDraft(null);
  };

  const removeProvider = (id: string) => {
    setProviders((prev) => prev.filter((x) => x.id !== id));
    setEditingId(null);
    setDraft(null);
  };

  const addCustom = () => {
    const p: Provider = {
      id: `custom-${Date.now()}`,
      name: 'Custom provider',
      icon: 'ri-plug-line',
      color: 'bg-zinc-500',
      apiKey: '',
      baseUrl: '',
      enabled: false,
      builtin: false,
    };
    setProviders((prev) => [...prev, p]);
    setEditingId(p.id);
    setDraft(p);
    setShowKey(false);
  };

  return (
    <div className="space-y-2">
      {providers.map((p) => {
        const connected = p.enabled && p.apiKey.length > 0;
        const editing = editingId === p.id;

        return (
          <div key={p.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800">
            {!editing ? (
              <div className="flex items-center gap-3 p-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${p.color}`}
                >
                  <i className={`${p.icon} text-base`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{p.name}</p>
                  <p className="truncate text-xs text-zinc-400">
                    {p.baseUrl || 'No endpoint set'}
                  </p>
                </div>
                {connected && (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </span>
                )}
                <button
                  onClick={() => startEdit(p)}
                  className="cursor-pointer whitespace-nowrap rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {connected ? 'Edit' : 'Connect'}
                </button>
              </div>
            ) : (
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {draft?.name}
                  </p>
                  {!draft?.builtin && (
                    <button
                      onClick={() => removeProvider(p.id)}
                      className="cursor-pointer whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {!draft?.builtin && (
                  <div className="mt-3">
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Name
                    </label>
                    <input
                      value={draft?.name ?? ''}
                      onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                      placeholder="e.g. Together AI"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                )}

                <div className="mt-3">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    API key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={draft?.apiKey ?? ''}
                      onChange={(e) => setDraft((d) => (d ? { ...d, apiKey: e.target.value } : d))}
                      placeholder="sk-…"
                      autoComplete="off"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-9 text-sm text-zinc-900 outline-none focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((s) => !s)}
                      aria-label="Toggle key visibility"
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-zinc-600"
                    >
                      <i className={`${showKey ? 'ri-eye-off-line' : 'ri-eye-line'} text-base`} />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Base URL
                  </label>
                  <input
                    value={draft?.baseUrl ?? ''}
                    onChange={(e) => setDraft((d) => (d ? { ...d, baseUrl: e.target.value } : d))}
                    placeholder="https://api.example.com/v1"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={draft?.enabled ?? false}
                      onChange={(e) => setDraft((d) => (d ? { ...d, enabled: e.target.checked } : d))}
                      className="h-4 w-4 cursor-pointer accent-brand-500"
                    />
                    Enable provider
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setDraft(null);
                      }}
                      className="cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveDraft}
                      className="cursor-pointer whitespace-nowrap rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={addCustom}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:border-brand-400 hover:text-brand-500 dark:border-zinc-700 dark:text-zinc-400"
      >
        <i className="ri-add-line text-base" />
        Add custom provider
      </button>
    </div>
  );
}