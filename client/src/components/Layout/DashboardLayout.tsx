import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { List } from '@phosphor-icons/react';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 lg:h-screen lg:shrink-0
          transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 bg-content1/80 backdrop-blur-md border-b border-divider flex items-center px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-content2 active:scale-[0.96] transition-all duration-150"
          >
            <List size={20} weight="light" />
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
