interface ChatHeaderProps {
  title: string;
  modelName: string;
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  toolsOpen: boolean;
  onToggleTools: () => void;
}

export default function ChatHeader({
  title,
  modelName,
  onOpenSidebar,
  onOpenSettings,
  toolsOpen,
  onToggleTools,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white/80 px-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 md:px-4">
      <button
        onClick={onOpenSidebar}
        aria-label="Open sidebar"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-all duration-150 hover:bg-zinc-100 active:scale-90 dark:hover:bg-zinc-800 lg:hidden"
      >
        <i className="ri-menu-line text-xl" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </p>
        <p className="truncate text-xs text-zinc-400">{modelName} · streaming ready</p>
      </div>

      <button
        aria-label="Share chat"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-all duration-150 hover:bg-zinc-100 active:scale-90 dark:hover:bg-zinc-800"
      >
        <i className="ri-share-forward-line text-lg" />
      </button>
      <button
        onClick={onOpenSettings}
        aria-label="Settings"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-all duration-150 hover:bg-zinc-100 active:scale-90 dark:hover:bg-zinc-800"
      >
        <i className="ri-settings-3-line text-lg" />
      </button>
      <button
        onClick={onToggleTools}
        aria-label="Toggle tools panel"
        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-all duration-150 active:scale-90 ${
          toolsOpen
            ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        <i className="ri-layout-right-line text-lg" />
      </button>
    </header>
  );
}