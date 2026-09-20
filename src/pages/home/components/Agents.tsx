import { useState } from 'react';
import type { Agent } from '../types';

interface AgentsProps {
  agents: Agent[];
  onCreate: (agent: Agent) => void;
  onUpdate: (agent: Agent) => void;
  onDelete: (id: string) => void;
  onUse: (agent: Agent) => void;
}

const EMOJI_OPTIONS = [
  '🤖', '🧑‍💻', '✍️', '💪', '🎓', '🧠', '📊', '🎨', '🧪', '⚖️',
  '🌍', '📚', '🍳', '💰', '🎧', '🔍', '🚀', '🧭', '🩺', '🎮',
];

const EMPTY: Agent = {
  id: '',
  name: '',
  description: '',
  systemPrompt: '',
  emoji: '🤖',
  model: 'gpt-4o',
  temperature: 0.7,
  createdAt: 0,
};

export default function Agents({
  agents,
  onCreate,
  onUpdate,
  onDelete,
  onUse,
}: AgentsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [draft, setDraft] = useState<Agent>(EMPTY);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDraft({ ...EMPTY, id: crypto.randomUUID(), createdAt: Date.now() });
    setModalOpen(true);
  };

  const openEdit = (agent: Agent) => {
    setEditing(agent);
    setDraft({ ...agent });
    setModalOpen(true);
  };

  const save = () => {
    if (!draft.name.trim() || !draft.systemPrompt.trim()) return;
    if (editing) {
      onUpdate(draft);
    } else {
      onCreate(draft);
    }
    setModalOpen(false);
  };

  const valid = draft.name.trim() && draft.systemPrompt.trim();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">
            Your agents
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Specialized assistants built from a prompt. Create one, then chat with it like an expert in that subject.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <i className="ri-add-line text-lg" />
          New agent
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <div
            key={a.id}
            className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-brand-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-500/40"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-2xl dark:bg-zinc-800">
                {a.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {a.name}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {a.description || 'No description yet.'}
                </p>
              </div>
            </div>

            <p className="mt-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
              {a.systemPrompt}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                {a.model}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(a)}
                  aria-label="Edit agent"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                >
                  <i className="ri-pencil-line text-base" />
                </button>
                <button
                  onClick={() => setConfirmId(a.id)}
                  aria-label="Delete agent"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                >
                  <i className="ri-delete-bin-6-line text-base" />
                </button>
                <button
                  onClick={() => onUse(a)}
                  className="ml-1 flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  <i className="ri-chat-3-line text-sm" />
                  Chat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            aria-hidden
          />
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {editing ? 'Edit agent' : 'Create an agent'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Emoji picker */}
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Icon
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setDraft((d) => ({ ...d, emoji: e }))}
                    className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-lg transition-colors ${
                      draft.emoji === e
                        ? 'bg-brand-100 ring-2 ring-brand-500 dark:bg-brand-500/20'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Name
              </label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Code Reviewer"
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Short description
              </label>
              <input
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="What does this agent do?"
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Prompt <span className="text-brand-500">(this defines the agent)</span>
              </label>
              <textarea
                value={draft.systemPrompt}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, systemPrompt: e.target.value.slice(0, 2000) }))
                }
                rows={5}
                placeholder="You are an expert… Describe how this agent should behave, what it knows, and how it should respond."
                className="mt-2 w-full resize-none rounded-lg border border-zinc-200 bg-white p-3 text-sm leading-relaxed text-zinc-900 outline-none transition-colors focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <p className="mt-1 text-right text-[11px] text-zinc-400">
                {draft.systemPrompt.length}/2000
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Model
                  </label>
                  <select
                    value={draft.model}
                    onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))}
                    className="mt-2 w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o mini</option>
                    <option value="o1">o1</option>
                    <option value="claude">Claude 3.5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Creativity · {draft.temperature.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={draft.temperature}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, temperature: Number(e.target.value) }))
                    }
                    className="mt-3 w-full cursor-pointer accent-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <button
                onClick={() => setModalOpen(false)}
                className="cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!valid}
                className="cursor-pointer whitespace-nowrap rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {editing ? 'Save changes' : 'Create agent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmId(null)}
            aria-hidden
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Delete this agent?
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              This can't be undone. Any chats you had with it will stay.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(confirmId);
                  setConfirmId(null);
                }}
                className="cursor-pointer whitespace-nowrap rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}