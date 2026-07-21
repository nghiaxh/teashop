import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  return (
    <aside className="w-60 min-h-screen bg-base-200 p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary">TeaShop</h1>
        <p className="text-xs text-base-content/60">POS Management</p>
      </div>

      <ul className="menu gap-1">
        <li className="menu-title">Staff</li>
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/orders/new" className={({ isActive }) => isActive ? 'active' : ''}>
            Tạo đơn hàng
          </NavLink>
        </li>
        <li>
          <NavLink to="/orders/history" className={({ isActive }) => isActive ? 'active' : ''}>
            Lịch sử đơn
          </NavLink>
        </li>
        <li>
          <NavLink to="/attendance/history" className={({ isActive }) => isActive ? 'active' : ''}>
            Lịch sử chấm công
          </NavLink>
        </li>

        {isManager && (
          <>
            <li className="menu-title mt-4">Manager</li>
            <li>
              <NavLink to="/manager" className={({ isActive }) => isActive ? 'active' : ''}>
                Tổng quan
              </NavLink>
            </li>
            <li>
              <NavLink to="/manager/menu" className={({ isActive }) => isActive ? 'active' : ''}>
                Quản lý Menu
              </NavLink>
            </li>
            <li>
              <NavLink to="/manager/inventory" className={({ isActive }) => isActive ? 'active' : ''}>
                Quản lý Kho
              </NavLink>
            </li>
            <li>
              <NavLink to="/manager/accounts" className={({ isActive }) => isActive ? 'active' : ''}>
                Quản lý Nhân viên
              </NavLink>
            </li>
            <li>
              <NavLink to="/manager/attendance" className={({ isActive }) => isActive ? 'active' : ''}>
                Quản lý Chấm công
              </NavLink>
            </li>
            <li>
              <NavLink to="/manager/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                Báo cáo
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
}
