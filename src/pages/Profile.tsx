import { useNavigate } from 'react-router-dom';
import {
  Camera,
  BadgeCheck,
  MapPin,
  Calendar,
  Settings,
  Shield,
  ChevronRight,
  Star,
  Radio,
  Heart,
  Gift,
  Crown,
  Sparkles,
  Edit3,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '@/store';

const stats = [
  { label: '关注', value: 128, icon: Heart },
  { label: '粉丝', value: '2.3k', icon: Star },
  { label: '获赞', value: '15.6k', icon: Gift },
  { label: '直播', value: 24, icon: Radio },
];

const menuItems = [
  { icon: Shield, label: '实名认证', desc: '提升账号可信度', path: '/face-verify', highlight: true },
  { icon: Crown, label: '开通会员', desc: '解锁专属特权', path: '#' },
  { icon: Gift, label: '我的礼物', desc: '查看收到的礼物', path: '#' },
  { icon: Radio, label: '主播中心', desc: '申请开通直播', path: '#' },
  { icon: Settings, label: '账号设置', desc: '隐私、通知、安全', path: '#' },
];

export default function Profile() {
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-strong rounded-3xl overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-brand-purple/60 via-brand-pink/40 to-brand-cyan/30">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, white 0.5px, transparent 0.5px), radial-gradient(circle at 80% 70%, white 0.5px, transparent 0.5px)',
            backgroundSize: '20px 20px',
          }} />
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full glass-light flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 pb-6 -mt-16 relative">
          <div className="flex items-end gap-6 mb-6">
            <div className="relative">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.nickname}
                className={`w-32 h-32 rounded-2xl object-cover border-4 border-[#1A1D2E] shadow-2xl ${
                  currentUser?.isVerified ? '' : ''
                }`}
              />
              {currentUser?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-bg flex items-center justify-center shadow-lg">
                  <BadgeCheck className="w-5 h-5 text-white" />
                </div>
              )}
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-bg flex items-center justify-center shadow-lg z-10">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold">{currentUser?.nickname || '我是小可爱'}</h1>
                {currentUser?.isVerified ? (
                  <span className="px-2 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-medium flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    真人认证
                  </span>
                ) : (
                  <button
                    onClick={() => navigate('/face-verify')}
                    className="px-3 py-1 rounded-full gradient-bg text-xs font-medium text-white flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    立即认证
                  </button>
                )}
              </div>
              <p className="text-white/60 mb-2">{currentUser?.signature || '这个人很懒，还没写个性签名'}</p>
              <div className="flex items-center gap-4 text-sm text-white/50">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  北京 · 朝阳区
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  2024年加入
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-light rounded-2xl p-4 text-center hover:bg-surface-hover transition-colors cursor-pointer group">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-brand-purple group-hover:scale-110 transition-transform" />
                  <p className="text-xl font-bold gradient-text">{s.value}</p>
                  <p className="text-xs text-white/50">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-2">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                i === 0 ? '' : 'hover:bg-surface-hover'
              }`}
              style={i === 0 ? {} : undefined}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  item.highlight
                    ? 'gradient-bg shadow-lg shadow-brand-purple/30'
                    : 'glass-light'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.highlight ? 'text-white' : 'text-white/80'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.label}</p>
                  {item.highlight && (
                    <span className="px-1.5 py-0.5 rounded bg-brand-pink/20 text-brand-pink text-[10px] font-medium">
                      推荐
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50">{item.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </button>
          );
        })}
      </div>

      <button
        onClick={handleLogout}
        className="w-full h-14 rounded-2xl glass-strong flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium"
      >
        <LogOut className="w-5 h-5" />
        退出登录
      </button>
    </div>
  );
}
