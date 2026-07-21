import { useAuth } from '../../contexts/AuthContext';

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 bg-base-100 border-b border-base-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <label htmlFor="sidebar-toggle" className="btn btn-ghost btn-sm lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-base-content/60 capitalize">{user?.role}</p>
        </div>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <span className="text-lg font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li className="menu-title">{user?.name}</li>
            <li>
              <button onClick={logout}>Đăng xuất</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
