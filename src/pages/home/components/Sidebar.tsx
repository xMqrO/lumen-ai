import { useMemo, useState } from 'react';
import type { Conversation, Project } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  projects: Project[];
  activeId: string;
  view: 'chat' | 'agents';
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onOpenAgents: () => void;
  onOpenSettings: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  open: boolean;
  onClose: () => void;
  userEmail?: string;
  onSignOut?: () => void;
}

export default function Sidebar({
  conversations,
  projects,
  activeId,
  view,
  onSelect,
  onNewChat,
  onOpenAgents,
  onOpenSettings,
  theme,
  onToggleTheme,
  open,
  onClose,
  userEmail,
  onSignOut,
}: SidebarProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'chats' | 'projects'>('chats');

  const grouped = useMemo(() => {
    const filtered = conversations.filter((c) =>
      c.title.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const map = new Map<string, Conversation[]>();
    filtered.forEach((c) => {
      const list = map.get(c.group) ?? [];
      list.push(c);
      map.set(c.group, list);
    });
    return Array.from(map.entries());
  }, [conversations, query]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/95 backdrop-blur-xl transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-900/95 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 pt-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500">
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Lumen
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 lg:hidden"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 pt-4">
          <button
            onClick={onNewChat}
            className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand-500 px-3 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98]"
          >
            <i className="ri-add-line text-lg" />
            New chat
          </button>
        </div>

        {/* Agents */}
        <div className="px-3 pt-3">
          <button
            onClick={onOpenAgents}
            className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150 active:scale-[0.99] ${
              view === 'agents'
                ? 'bg-white dark:bg-zinc-800'
                : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <i className="ri-robot-2-line text-sm" />
            </span>
            <span
              className={`min-w-0 flex-1 truncate text-sm ${
                view === 'agents'
                  ? 'font-medium text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Your agents
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 dark:border-zinc-800 dark:bg-zinc-950/60">
            <span className="flex h-4 w-4 items-center justify-center text-zinc-400">
              <i className="ri-search-line text-sm" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-3 pt-3">
          <div className="flex rounded-full bg-zinc-200/70 p-1 dark:bg-zinc-800/70">
            {(['chats', 'projects'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 cursor-pointer whitespace-nowrap rounded-full px-2 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  tab === t
                    ? 'bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="mt-3 flex-1 overflow-y-auto px-3 pb-3">
          {tab === 'chats' ? (
            grouped.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-zinc-400">
                No chats match “{query}”.
              </p>
            ) : (
              grouped.map(([group, items]) => (
                <div key={group} className="mb-4">
                  <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {group}
                  </p>
                  <div className="space-y-0.5">
                    {items.map((c) => {
                      const active = c.id === activeId && view === 'chat';
                      return (
                        <button
                          key={c.id}
                          onClick={() => onSelect(c.id)}
className={`group flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all duration-150 active:scale-[0.99] ${
                              active
                                ? 'bg-white dark:bg-zinc-800'
                                : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                            }`}
                        >
                          <i
                            className={`${
                              c.pinned ? 'ri-pushpin-2-fill' : 'ri-chat-3-line'
                            } text-base ${
                              active
                                ? 'text-brand-500'
                                : 'text-zinc-400 group-hover:text-zinc-500'
                            }`}
                          />
                          <span
                            className={`min-w-0 flex-1 truncate text-sm ${
                              active
                                ? 'font-medium text-zinc-900 dark:text-zinc-50'
                                : 'text-zinc-600 dark:text-zinc-300'
                            }`}
                          >
                            {c.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="space-y-0.5">
              {projects.map((p) => (
                <button
                  key={p.id}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                    <i className={`${p.icon} text-sm`} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-200">
                    {p.name}
                  </span>
                  <span className="text-xs text-zinc-400">{p.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account */}
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white">
              {(userEmail?.trim()[0] ?? 'L').toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {userEmail || 'Guest'}
              </p>
              <p className="truncate text-xs text-zinc-400">
                {userEmail ? 'Signed in' : 'Not signed in'}
              </p>
            </div>
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-all duration-150 hover:bg-zinc-200/70 active:scale-90 dark:hover:bg-zinc-800"
            >
              <i className={theme === 'dark' ? 'ri-sun-line text-lg' : 'ri-moon-line text-lg'} />
            </button>
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-all duration-150 hover:bg-zinc-200/70 active:scale-90 dark:hover:bg-zinc-800"
            >
              <i className="ri-settings-3-line text-lg" />
            </button>
            {onSignOut && (
              <button
                onClick={onSignOut}
                aria-label="Sign out"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-90 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <i className="ri-logout-box-r-line text-lg" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}