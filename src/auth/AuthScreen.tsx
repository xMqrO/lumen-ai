import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

type Mode = 'signin' | 'signup' | 'reset';

export default function AuthScreen() {
  const { sendSignup, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingVerify, setPendingVerify] = useState<string | null>(null);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setNotice(null);
  };

  const resend = async () => {
    if (!pendingVerify) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await sendSignup(pendingVerify, password);
      setNotice(`A new confirmation link was sent to ${pendingVerify}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const mail = email.trim().toLowerCase();
    if (!mail) {
      setError('Enter your email address.');
      return;
    }

    if (mode === 'signin') {
      if (!password) {
        setError('Enter your password.');
        return;
      }
      setBusy(true);
      try {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: mail,
          password,
        });
        if (err) throw err;
      } catch (err) {
        setError(err instanceof Error ? err.message.replace(/^AuthApiError:\s*/i, '') : 'Something went wrong.');
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setBusy(true);
      try {
        await sendSignup(mail, password);
        setPendingVerify(mail);
        setNotice(`A confirmation link was sent to ${mail} via email. Click it, then sign in.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setBusy(false);
      }
      return;
    }

    // mode === 'reset'
    setBusy(true);
    try {
      await requestPasswordReset(mail);
      setNotice(`If ${mail} is registered, a reset link is on its way.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password';
  const subtitle =
    mode === 'signin'
      ? 'Sign in to continue chatting'
      : mode === 'signup'
        ? 'Register with your email'
        : 'We will email you a reset link';

  const lockedEmail = pendingVerify && mode === 'signin';

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
            {title}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl shadow-2xl">
          {mode !== 'reset' && (
            <div className="grid grid-cols-2 rounded-full bg-zinc-800/70 p-1">
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={!!lockedEmail}
                  onClick={() => switchMode(m)}
                  className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                    mode === m
                      ? 'bg-zinc-950 text-zinc-50 shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {m === 'signin' ? 'Sign in' : 'Register'}
                </button>
              ))}
            </div>
          )}

          {pendingVerify && (
            <div className="mt-4 rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 text-sm text-brand-200">
              <p className="flex items-start gap-2">
                <i className="ri-mail-check-line mt-0.5" />
                <span>
                  Check the inbox for {pendingVerify}. Click the link, then come back and sign in.
                </span>
              </p>
              <div className="mt-3 space-x-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={resend}
                  className="cursor-pointer rounded-lg border border-brand-500/40 px-3 py-1.5 text-xs font-semibold text-brand-300 transition-all hover:bg-brand-500/10 disabled:opacity-50"
                >
                  {busy ? 'Sending…' : 'Resend link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingVerify(null);
                    switchMode('signin');
                  }}
                  className="cursor-pointer rounded-lg px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  I already confirmed
                </button>
              </div>
            </div>
          )}

          <form onSubmit={submit} className={`mt-5 space-y-4 ${pendingVerify && mode === 'signin' ? 'opacity-60' : ''}`}>
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

            {mode !== 'reset' && (
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
            )}

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
            )}
            {notice && !pendingVerify && (
              <p className="rounded-lg bg-brand-500/10 px-3 py-2 text-xs text-brand-300">{notice}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-zinc-950 transition-all duration-150 hover:bg-brand-400 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy && <i className="ri-loader-4-line animate-spin" />}
              {mode === 'signin' && 'Sign in'}
              {mode === 'signup' && 'Create account'}
              {mode === 'reset' && 'Send reset link'}
            </button>
          </form>

          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => switchMode('reset')}
              className="mt-4 w-full cursor-pointer text-center text-xs text-zinc-500 transition-colors hover:text-brand-300"
            >
              Forgot your password?
            </button>
          )}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="mt-4 w-full cursor-pointer text-center text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            >
              ← Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}