import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { List, SignOut, User } from '@phosphor-icons/react';

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-divider flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-content2 active:scale-95 transition-all lg:hidden"
        >
          <List size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-content2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <User size={16} weight="bold" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight">{user?.name}</p>
              <p className="text-[10px] text-foreground/50 uppercase tracking-wider">{user?.role}</p>
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 z-50 w-48 py-1 bg-white border border-divider rounded-xl shadow-lg shadow-black/[0.04]">
              <p className="px-3 py-1.5 text-xs font-semibold text-foreground/60">{user?.name}</p>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-content2 active:bg-content3 transition-colors"
              >
                <SignOut size={14} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
