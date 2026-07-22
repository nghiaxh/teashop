import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  House,
  PlusCircle,
  ClockCounterClockwise,
  Clock,
  ChartBar,
  BookOpen,
  Package,
  Users,
  CalendarCheck,
  TrendUp,
  type IconProps,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: ComponentType<IconProps>;
  onClose?: () => void;
}

function SidebarLink({ to, label, icon: Icon, onClose }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClose}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-foreground/70 hover:bg-content2 hover:text-foreground'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary" />
          )}
          <Icon size={18} weight="regular" />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

const staffLinks = [
  { to: '/', label: 'Dashboard', icon: House },
  { to: '/orders/new', label: 'Tạo đơn hàng', icon: PlusCircle },
  { to: '/orders/history', label: 'Lịch sử đơn', icon: ClockCounterClockwise },
  { to: '/attendance/history', label: 'Lịch sử chấm công', icon: Clock },
];

const managerLinks = [
  { to: '/manager', label: 'Tổng quan', icon: ChartBar },
  { to: '/manager/menu', label: 'Quản lý Menu', icon: BookOpen },
  { to: '/manager/inventory', label: 'Quản lý Kho', icon: Package },
  { to: '/manager/accounts', label: 'Quản lý Nhân viên', icon: Users },
  { to: '/manager/attendance', label: 'Quản lý Chấm công', icon: CalendarCheck },
  { to: '/manager/reports', label: 'Báo cáo', icon: TrendUp },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-divider flex flex-col">
      <div className="p-5 border-b border-content3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">TeaShop</h1>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider">POS System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-semibold px-3 pt-2 pb-1">
          Staff
        </p>
        {staffLinks.map((link) => (
          <SidebarLink key={link.to} {...link} onClose={onClose} />
        ))}

        {isManager && (
          <>
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-semibold px-3 pt-4 pb-1">
              Manager
            </p>
            {managerLinks.map((link) => (
              <SidebarLink key={link.to} {...link} onClose={onClose} />
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-content3">
        <p className="text-[10px] text-foreground/30 text-center">v1.0.0</p>
      </div>
    </aside>
  );
}
