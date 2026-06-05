import { useEffect, useState } from 'react';
import { Radio, Flame, Music, Gamepad2, Mountain, Heart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LiveCard from '@/components/ui/LiveCard';
import { useAppStore } from '@/store';
import CoinBalance from '@/components/ui/CoinBalance';
import type { LiveRoom } from '../../shared/types';

const categories = [
  { id: '推荐', label: '推荐', icon: Flame },
  { id: '热门', label: '热门', icon: Radio },
  { id: '才艺', label: '才艺', icon: Music },
  { id: '游戏', label: '游戏', icon: Gamepad2 },
  { id: '户外', label: '户外', icon: Mountain },
  { id: '关注', label: '关注', icon: Heart },
];

export default function LivePlaza() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('推荐');
  const liveRooms = useAppStore((s) => s.liveRooms);
  const setLiveRooms = useAppStore((s) => s.setLiveRooms);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await fetch(`/api/live/rooms?category=${activeCategory}`);
        const data = await res.json();
        if (data.success) {
          setLiveRooms(data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadRooms();
  }, [activeCategory, setLiveRooms]);

  const totalViewers = liveRooms.reduce((acc, r) => acc + r.viewerCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">
            直播<span className="gradient-text">广场</span>
          </h1>
          <p className="text-white/50 text-sm">
            正在直播 <span className="text-brand-pink font-semibold">{liveRooms.length}</span> 个房间 · 
            <span className="text-brand-cyan"> {(totalViewers / 1000).toFixed(1)}k</span> 人在线观看
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CoinBalance />
          <button
            onClick={() => alert('开播功能即将上线')}
            className="flex items-center gap-2 h-11 px-5 rounded-xl gradient-bg text-white font-semibold shadow-lg shadow-brand-purple/30 hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            开启直播
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 h-10 px-5 rounded-full whitespace-nowrap transition-all ${
                isActive
                  ? 'gradient-bg text-white shadow-lg shadow-brand-purple/30'
                  : 'glass-light text-white/70 hover:text-white hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="glass-strong rounded-3xl p-4 mb-6 flex items-center gap-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-pink/10 to-transparent" />
        <div className="relative w-24 h-24 rounded-2xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-xl shadow-brand-purple/30">
          <Radio className="w-12 h-12 text-white animate-pulse" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-red-500 text-xs font-bold text-white live-badge">
              HOT
            </span>
            <h3 className="font-bold text-lg">深夜情感电台</h3>
          </div>
          <p className="text-white/60 text-sm mb-2 truncate">
            主播正在分享治愈系音乐，一起来聊天放松吧~
          </p>
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <Radio className="w-4 h-4" />
              {liveRooms[0]?.viewerCount || 0} 观看
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {liveRooms[0]?.likeCount || 0} 点赞
            </span>
          </div>
        </div>
        <button
          onClick={() => liveRooms[0] && navigate(`/live/${liveRooms[0].id}`)}
          className="relative btn-primary whitespace-nowrap"
        >
          立即进入
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {liveRooms.map((room: LiveRoom, index: number) => (
          <LiveCard key={room.id} room={room} index={index} />
        ))}
      </div>
    </div>
  );
}
