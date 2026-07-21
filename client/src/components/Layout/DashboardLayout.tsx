import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <input id="sidebar-toggle" type="checkbox" className="hidden" />

      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 bg-base-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
