import { SUGGESTIONS } from '../data';

interface WelcomeProps {
  onPick: (text: string) => void;
}

export default function Welcome({ onPick }: WelcomeProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-14 text-center md:py-20">
      <span className="flex h-14 w-14 animate-fade-up items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30">
        <span className="h-4 w-4 rounded-full bg-white" />
      </span>
      <h1 className="mt-5 animate-fade-up font-display text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
        What are we building today?
      </h1>
      <p className="mt-2 max-w-md animate-fade-up text-sm text-zinc-500 dark:text-zinc-400">
        Ask anything — Lumen can research, write, code, and reason through
        problems with you.
      </p>

      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={s.title}
            style={{ animationDelay: `${120 + i * 70}ms` }}
            onClick={() => onPick(`${s.title}: ${s.subtitle}`)}
            className="group flex animate-fade-up cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50/60 hover:shadow-lg hover:shadow-brand-500/10 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-brand-100 group-hover:text-brand-600 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-brand-500/15 dark:group-hover:text-brand-300">
              <i className={`${s.icon} text-base`} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {s.title}
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                {s.subtitle}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}