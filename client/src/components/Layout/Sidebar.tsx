import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
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
  CaretLeft,
  CaretRight,
  SignOut,
  User,
  type IconProps,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: ComponentType<IconProps>;
  collapsed: boolean;
  end?: boolean;
  onClose?: () => void;
}

function SidebarLink({ to, label, icon: Icon, collapsed, end, onClose }: SidebarLinkProps) {
  const link = (
    <NavLink
      to={to}
      end={end}
      onClick={onClose}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-xl text-sm focus-visible:outline-none transition-all duration-200 ${
          collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
        } ${
          isActive
            ? 'bg-foreground text-primary-foreground font-medium'
            : 'text-foreground/60 hover:bg-content2 hover:text-foreground'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
          {!collapsed && (
            <span className="whitespace-nowrap overflow-hidden">{label}</span>
          )}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return <div title={label}>{link}</div>;
  }

  return link;
}

const staffLinks = [
  { to: '/', label: 'Bảng điều khiển', icon: House, end: true },
  { to: '/orders/new', label: 'Tạo đơn hàng', icon: PlusCircle },
  { to: '/orders/history', label: 'Lịch sử đơn', icon: ClockCounterClockwise },
  { to: '/attendance/history', label: 'Lịch sử chấm công', icon: Clock },
  { to: '/profile', label: 'Thông tin', icon: User },
];

const managerLinks = [
  { to: '/manager', label: 'Tổng quan', icon: ChartBar, end: true },
  { to: '/manager/menu', label: 'Quản lý Menu', icon: BookOpen },
  { to: '/manager/inventory', label: 'Quản lý Kho', icon: Package },
  { to: '/manager/accounts', label: 'Quản lý Nhân viên', icon: Users },
  { to: '/manager/attendance', label: 'Quản lý Chấm công', icon: CalendarCheck },
  { to: '/manager/reports', label: 'Báo cáo', icon: TrendUp },
  { to: '/profile', label: 'Thông tin', icon: User },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const isManager = user?.role === 'manager';
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <aside
      style={{ width: collapsed ? 72 : 240 }}
      className="h-screen bg-content1 border-r border-divider flex flex-col overflow-hidden transition-[width] duration-250 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
    >
      <nav className="flex-1 px-2 pt-4 pb-2 space-y-0.5 overflow-y-auto min-h-0">
        {isManager ? (
          <>
            {managerLinks.map((link) => (
              <SidebarLink key={link.to} {...link} collapsed={collapsed} onClose={onClose} />
            ))}
            <div className="pt-1 mt-1 border-t border-divider">
              {staffLinks
                .filter((link) => link.to !== '/' && link.to !== '/orders/new' && link.to !== '/profile')
                .map((link) => (
                  <SidebarLink key={link.to} {...link} collapsed={collapsed} onClose={onClose} />
                ))}
            </div>
          </>
        ) : (
          staffLinks.map((link) => (
            <SidebarLink key={link.to} {...link} collapsed={collapsed} onClose={onClose} />
          ))
        )}

        <div className="pt-1 mt-1 border-t border-divider">
          {collapsed ? (
            <div title="Đăng xuất">
              <button
                onClick={logout}
                className="flex items-center justify-center w-full rounded-xl text-sm text-foreground/60 hover:bg-content2 hover:text-foreground transition-all duration-200 cursor-pointer px-2 py-2.5"
              >
                <SignOut size={18} weight="regular" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full rounded-xl text-sm text-foreground/60 hover:bg-content2 hover:text-foreground transition-all duration-200 cursor-pointer px-3 py-2.5"
            >
              <SignOut size={18} weight="regular" />
              <span className="whitespace-nowrap overflow-hidden">Đăng xuất</span>
            </button>
          )}
        </div>
      </nav>

      <div className={`p-2 border-t border-divider ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-2 rounded-xl text-sm text-foreground/40 hover:text-foreground/70 hover:bg-content2 transition-all duration-200 cursor-pointer ${
            collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 w-full'
          }`}
        >
          {collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
          {!collapsed && (
            <span className="whitespace-nowrap overflow-hidden">Thu gọn</span>
          )}
        </button>
      </div>
    </aside>
  );
}
