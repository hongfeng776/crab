import { useEffect, useState } from 'react';
import { MapPin, SlidersHorizontal, Grid2x2, Map, Sparkles } from 'lucide-react';
import UserCard from '@/components/ui/UserCard';
import { useAppStore } from '@/store';
import type { User } from '../../shared/types';

export default function Nearby() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [radius, setRadius] = useState(10);
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const nearbyUsers = useAppStore((s) => s.nearbyUsers);
  const setNearbyUsers = useAppStore((s) => s.setNearbyUsers);
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch(`/api/users?radius=${radius}`);
        const data = await res.json();
        if (data.success) {
          setNearbyUsers(data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadUsers();
  }, [radius, setNearbyUsers]);

  const filteredUsers = nearbyUsers.filter((u) => {
    if (filterGender !== 'all' && u.gender !== filterGender) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">
            发现身边<span className="gradient-text">有趣的人</span>
          </h1>
          <p className="text-white/50 text-sm flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            当前定位：北京 · 朝阳区 · {filteredUsers.length} 人在线
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-11 px-5 rounded-xl transition-all ${
              showFilters ? 'gradient-bg text-white' : 'glass-light text-white/80 hover:bg-surface-hover'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-sm font-medium">筛选</span>
          </button>
          <div className="flex glass-light rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-10 h-9 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'grid' ? 'gradient-bg text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Grid2x2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`w-10 h-9 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'map' ? 'gradient-bg text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">
              搜索范围: <span className="text-brand-cyan font-semibold">{radius}km</span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-brand-purple"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>1km</span>
              <span>25km</span>
              <span>50km</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">性别筛选</label>
            <div className="flex gap-2">
              {(['all', 'female', 'male'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGender(g)}
                  className={`px-5 py-2 rounded-xl text-sm transition-all ${
                    filterGender === g
                      ? 'gradient-bg text-white'
                      : 'glass-light text-white/70 hover:bg-surface-hover'
                  }`}
                >
                  {g === 'all' ? '全部' : g === 'female' ? '女生' : '男生'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredUsers.map((user: User, index: number) => (
            <UserCard key={user.id} user={user} index={index} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden h-[600px] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-background-deep via-background to-brand-purple/10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(34, 211, 238, 0.15) 0%, transparent 50%)'
            }} />
            <svg className="absolute inset-0 w-full h-full opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-brand-cyan/30 animate-ripple" />
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-brand-cyan/20 animate-ripple" style={{ animationDelay: '0.5s' }} />
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center shadow-2xl shadow-brand-purple/50 relative z-10">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {filteredUsers.map((user, i) => {
            const angle = (i / filteredUsers.length) * Math.PI * 2;
            const distance = 100 + (user.distance * 15);
            const x = 50 + Math.cos(angle) * (distance / 6);
            const y = 50 + Math.sin(angle) * (distance / 6);
            return (
              <div
                key={user.id}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: `fadeInUp 0.5s ease ${i * 0.1}s both`,
                }}
              >
                <div className="relative group cursor-pointer">
                  <img
                    src={user.avatar}
                    alt={user.nickname}
                    className={`w-12 h-12 rounded-full object-cover border-3 ${
                      user.isOnline ? 'border-green-500 ring-4 ring-green-500/20' : 'border-white/20'
                    }`}
                  />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-2 py-1 rounded-lg bg-black/80 text-xs text-white">
                      {user.nickname} · {user.distance}km
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translate(-50%, -30%); }
              to { opacity: 1; transform: translate(-50%, -50%); }
            }
          `}</style>

          <div className="absolute bottom-4 left-4 right-4 glass-light rounded-xl p-4">
            <p className="text-sm text-white/70 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-cyan" />
              以 <span className="text-white font-semibold">{currentUser?.nickname || '我'}</span> 为中心 · 共 {filteredUsers.length} 位附近用户
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
