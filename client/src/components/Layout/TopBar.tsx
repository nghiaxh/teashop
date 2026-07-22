import { useAuth } from '../../contexts/AuthContext';
import { List, SignOut, User } from '@phosphor-icons/react';

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-base-300 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-sm btn-square lg:hidden"
        >
          <List size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-base-200 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <User size={16} weight="bold" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight">{user?.name}</p>
              <p className="text-[10px] text-base-content/50 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-2 z-[1] p-2 shadow-lg bg-white border border-base-300 rounded-xl w-48">
            <li className="menu-title text-xs">{user?.name}</li>
            <li>
              <button onClick={logout} className="flex items-center gap-2 text-sm">
                <SignOut size={14} />
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
