import { type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import AuthScreen from './AuthScreen';
import ResetPassword from './ResetPassword';

function Splash() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/40 animate-pulse">
          <span className="h-3 w-3 rounded-full bg-white" />
        </span>
        <p className="text-sm text-zinc-400">Loading Lumen…</p>
      </div>
    </div>
  );
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const { loading, session } = useAuth();
  const isRecovery =
    typeof window !== 'undefined' &&
    window.location.hash.includes('type=recovery');

  if (loading) return <Splash />;
  if (isRecovery && session) return <ResetPassword />;
  if (!session) return <AuthScreen />;
  return <>{children}</>;
}