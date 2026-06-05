import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout() {
  const location = useLocation();
  const isFullScreen = location.pathname.startsWith('/live/') || location.pathname.startsWith('/call/');

  if (isFullScreen) {
    return (
      <div className="min-h-screen bg-background-deep">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-deep flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
