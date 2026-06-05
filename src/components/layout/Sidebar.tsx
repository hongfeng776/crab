import { NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Camera,
  Radio,
  MessageCircle,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store';

const navItems = [
  { path: '/nearby', label: '附近', icon: MapPin },
  { path: '/face-verify', label: '人脸认证', icon: Camera },
  { path: '/live', label: '直播广场', icon: Radio },
  { path: '/messages', label: '消息', icon: MessageCircle, badge: 3 },
  { path: '/profile', label: '我的', icon: User },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const setLoggedIn = useAppStore((s) => s.setLoggedIn);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 glass-strong border-r border-surface-border flex flex-col">
      <div className="p-6 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-brand-purple/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold gradient-text">Crab</h1>
            <p className="text-xs text-white/50">连接身边的美好</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                  isActive
                    ? 'gradient-bg text-white shadow-lg shadow-brand-purple/30'
                    : 'text-white/60 hover:text-white hover:bg-surface-hover'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto w-5 h-5 rounded-full bg-brand-pink text-xs flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-border space-y-4">
        {currentUser && (
          <div className="flex items-center gap-3 p-3 rounded-xl glass-light">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.nickname}
                className={`w-10 h-10 rounded-full object-cover ${
                  currentUser.isVerified ? 'verified-ring' : ''
                }`}
              />
              {currentUser.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background-deep" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{currentUser.nickname}</p>
              <p className="text-xs text-white/50 truncate">
                {currentUser.isVerified ? '✓ 已认证' : '未认证'}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-surface-hover transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">退出登录</span>
        </button>
      </div>
    </aside>
  );
}
