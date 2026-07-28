import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/authService';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <span className="font-semibold text-slate-900">MateCode Tasks</span>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user.email}</span>
          <button onClick={() => logout()} className="text-sm text-slate-600 hover:underline">
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}
