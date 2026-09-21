import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      window.history.replaceState({}, '', window.location.pathname);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message.replace(/^AuthApiError:\s*/i, '') : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex h-screen min-h-[520px] items-center justify-center overflow-hidden bg-zinc-950 p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl animate-aurora" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl animate-aurora-slow" />
      </div>

      <div className="relative w-full max-w-sm animate-scale-in">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/40">
            <span className="h-3 w-3 rounded-full bg-white" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-zinc-50">
            Choose a new password
          </h1>
          <p className="mt-1 text-sm text-zinc-400">Your reset link is valid — set a new password.</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-xl shadow-2xl">
          {done ? (
            <div className="space-y-4">
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm text-emerald-300">
                <i className="ri-checkbox-circle-line mr-1.5" />
                Password updated. You are signed in.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  New password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-500/70 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Confirm password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat the password"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-brand-500/70 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-zinc-950 transition-all duration-150 hover:bg-brand-400 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy && <i className="ri-loader-4-line animate-spin" />}
                Update password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}