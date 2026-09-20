import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const mail = email.trim().toLowerCase();
    if (!mail || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: mail,
          password,
        });
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: mail,
          password,
        });
        if (err) throw err;
        if (!data.session) {
          setNotice('Account created. Check your email to confirm, then sign in.');
          return;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg.replace(/^AuthApiError:\s*/i, ''));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex h-screen min-h-[520px] items-center justify-center overflow-hidden bg-zinc-950 p-4">
      {/* Aurora backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl animate-aurora" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl animate-aurora-slow" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-scale-in">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/40">
            <span className="h-3 w-3 rounded-full bg-white" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-zinc-50">
            Welcome to Lumen
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {mode === 'signin'
              ? 'Sign in to your account'
              : 'Create an account to start'}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-2 rounded-full bg-zinc-800/70 p-1">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNotice(null);
                }}
                className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition-all duration-200 ${
                  mode === m
                    ? 'bg-zinc-950 text-zinc-50 shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-500/70 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <input
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signin' ? '••••••••' : 'At least 6 characters'}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-500/70 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-lg bg-brand-500/10 px-3 py-2 text-xs text-brand-300">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-zinc-950 transition-all duration-150 hover:bg-brand-400 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy && <i className="ri-loader-4-line animate-spin" />}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}