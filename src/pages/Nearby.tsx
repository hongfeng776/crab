import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MapPin,
  SlidersHorizontal,
  Grid2x2,
  Map,
  Sparkles,
  Navigation,
  Crosshair,
  Loader2,
  AlertCircle,
  LocateFixed,
  RefreshCw,
} from 'lucide-react';
import UserCard from '@/components/ui/UserCard';
import { useAppStore } from '@/store';
import type { User } from '../../shared/types';

const DEFAULT_CENTER = { lat: 39.9042, lng: 116.4074 };
const DEFAULT_LOCATION_NAME = '北京 · 朝阳区';

const MAP_VIEW_LAT_DELTA = 0.06;
const MAP_VIEW_LNG_DELTA = 0.08;

type LocatingStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error';

interface Viewport {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  centerLat: number;
  centerLng: number;
}

function buildViewport(centerLat: number, centerLng: number): Viewport {
  return {
    minLat: centerLat - MAP_VIEW_LAT_DELTA / 2,
    maxLat: centerLat + MAP_VIEW_LAT_DELTA / 2,
    minLng: centerLng - MAP_VIEW_LNG_DELTA / 2,
    maxLng: centerLng + MAP_VIEW_LNG_DELTA / 2,
    centerLat,
    centerLng,
  };
}

const GEOErrorCodeNames: Record<number, string> = {
  1: '定位权限被拒绝，请在浏览器设置中允许位置访问',
  2: '无法获取位置信息（位置服务不可用）',
  3: '定位超时，请检查网络后重试',
};

export default function Nearby() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [radius, setRadius] = useState(10);
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [center, setCenter] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [locationName, setLocationName] = useState<string>(DEFAULT_LOCATION_NAME);
  const [locatingStatus, setLocatingStatus] = useState<LocatingStatus>('idle');
  const [locatingError, setLocatingError] = useState<string>('');

  const viewportRef = useRef<Viewport>(buildViewport(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng));
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const nearbyUsers = useAppStore((s) => s.nearbyUsers);
  const setNearbyUsers = useAppStore((s) => s.setNearbyUsers);
  const currentUser = useAppStore((s) => s.currentUser);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/users?radius=${radius}&lat=${center.lat}&lng=${center.lng}`,
      );
      const data = await res.json();
      if (data.success) {
        setNearbyUsers(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [radius, center, setNearbyUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateCenter = useCallback((lat: number, lng: number, name?: string) => {
    setCenter({ lat, lng });
    viewportRef.current = buildViewport(lat, lng);
    if (name) setLocationName(name);
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocatingStatus('error');
      setLocatingError('当前浏览器不支持地理定位');
      return;
    }
    setLocatingStatus('loading');
    setLocatingError('');

    const doLocate = (highAcc: boolean, attempt: number) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          updateCenter(
            lat,
            lng,
            `GPS定位 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          );
          setLocatingStatus('success');
          setTimeout(() => setLocatingStatus('idle'), 2500);
        },
        (err) => {
          console.warn(`Geolocation error (attempt ${attempt}):`, err.code, err.message);
          if (highAcc && attempt === 1) {
            doLocate(false, 2);
            return;
          }
          const msg = GEOErrorCodeNames[err.code] || '定位失败，请稍后重试';
          if (err.code === 1) {
            setLocatingStatus('denied');
          } else {
            setLocatingStatus('error');
          }
          setLocatingError(msg);
        },
        {
          enableHighAccuracy: highAcc,
          timeout: highAcc ? 8000 : 15000,
          maximumAge: 60000,
        },
      );
    };

    doLocate(true, 1);
  }, [updateCenter]);

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mapContainerRef.current) return;
      const rect = mapContainerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const vp = viewportRef.current;
      const xRatio = clickX / rect.width;
      const yRatio = clickY / rect.height;
      const lng = vp.minLng + xRatio * (vp.maxLng - vp.minLng);
      const lat = vp.maxLat - yRatio * (vp.maxLat - vp.minLat);
      updateCenter(lat, lng, `自定义位置 (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    },
    [updateCenter],
  );

  const projectToMap = useCallback((userLat: number, userLng: number) => {
    const vp = viewportRef.current;
    const x = ((userLng - vp.minLng) / (vp.maxLng - vp.minLng)) * 100;
    const y = ((vp.maxLat - userLat) / (vp.maxLat - vp.minLat)) * 100;
    return { x, y };
  }, []);

  const radiusCircleSize = useMemo(() => {
    const vp = viewportRef.current;
    const kmPerDegLat = 111;
    const radiusDegLat = radius / kmPerDegLat;
    const latPct = (radiusDegLat / (vp.maxLat - vp.minLat)) * 100;
    const avgLat = (vp.minLat + vp.maxLat) / 2;
    const kmPerDegLng = Math.cos((avgLat * Math.PI) / 180) * 111.32;
    const radiusDegLng = radius / kmPerDegLng;
    const lngPct = (radiusDegLng / (vp.maxLng - vp.minLng)) * 100;
    return { widthPct: lngPct * 2, heightPct: latPct * 2 };
  }, [radius]);

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
          <p className="text-white/50 text-sm flex items-center gap-1 flex-wrap">
            <MapPin className="w-4 h-4 text-brand-cyan" />
            当前定位：
            <span className="text-white/80">{locationName}</span>
            <span className="mx-1">·</span>
            <span>
              <span className="text-brand-cyan font-semibold">{filteredUsers.length}</span> 人在线
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={getCurrentLocation}
            disabled={locatingStatus === 'loading'}
            title="获取当前GPS定位"
            className={`flex items-center gap-2 h-11 px-5 rounded-xl transition-all ${
              locatingStatus === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : locatingStatus === 'error' || locatingStatus === 'denied'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'glass-light text-white/80 hover:bg-surface-hover'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {locatingStatus === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">定位中...</span>
              </>
            ) : locatingStatus === 'success' ? (
              <>
                <Crosshair className="w-5 h-5" />
                <span className="text-sm font-medium">已定位</span>
              </>
            ) : locatingStatus === 'denied' || locatingStatus === 'error' ? (
              <>
                <RefreshCw className="w-5 h-5" />
                <span className="text-sm font-medium">重新定位</span>
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                <span className="text-sm font-medium">GPS定位</span>
              </>
            )}
          </button>
          {viewMode === 'map' && (
            <div className="glass-light rounded-xl px-3 py-2 text-xs text-white/60 flex items-center gap-2">
              <LocateFixed className="w-4 h-4 text-brand-cyan" />
              点击地图选择位置
            </div>
          )}
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

      {(locatingStatus === 'denied' || locatingStatus === 'error') && locatingError && (
        <div className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-red-400 font-medium">{locatingError}</p>
            <p className="text-white/50 mt-1">
              您可以继续使用默认位置，或在地图模式下点击任意位置选择定位点。
            </p>
          </div>
        </div>
      )}

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
          {filteredUsers.length === 0 && (
            <div className="col-span-full glass rounded-2xl p-12 text-center">
              <MapPin className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">当前范围内暂无用户，尝试扩大搜索范围或调整定位</p>
            </div>
          )}
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          onClick={handleMapClick}
          className="glass rounded-2xl overflow-hidden h-[600px] relative cursor-crosshair select-none"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background-deep via-background to-brand-purple/10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(34, 211, 238, 0.15) 0%, transparent 50%)',
              }}
            />
            <svg className="absolute inset-0 w-full h-full opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div
            className="absolute rounded-full border-2 border-dashed border-brand-cyan/40 bg-brand-cyan/5 pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              width: `${radiusCircleSize.widthPct}%`,
              height: `${radiusCircleSize.heightPct}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.3s ease',
            }}
          />
          <div
            className="absolute rounded-full border border-brand-cyan/20 bg-brand-cyan/5 pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              width: `${radiusCircleSize.widthPct / 2}%`,
              height: `${radiusCircleSize.heightPct / 2}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.3s ease',
            }}
          />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
            <div className="relative">
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-brand-cyan/30 animate-ripple" />
              <div
                className="absolute inset-0 w-16 h-16 rounded-full bg-brand-cyan/20 animate-ripple"
                style={{ animationDelay: '0.5s' }}
              />
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center shadow-2xl shadow-brand-purple/50 relative z-10">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {filteredUsers.map((user, i) => {
            const { x, y } = projectToMap(user.location.lat, user.location.lng);
            if (x < -8 || x > 108 || y < -8 || y > 108) return null;
            return (
              <div
                key={user.id}
                className="absolute z-10"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: `fadeInUp 0.5s ease ${i * 0.05}s both`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative group cursor-pointer">
                  <img
                    src={user.avatar}
                    alt={user.nickname}
                    className={`w-12 h-12 rounded-full object-cover border-3 transition-transform group-hover:scale-110 ${
                      user.isOnline
                        ? 'border-green-500 ring-4 ring-green-500/20'
                        : 'border-white/20'
                    }`}
                  />
                  <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="px-3 py-1.5 rounded-lg bg-black/85 text-xs text-white shadow-xl">
                      <div className="font-medium">{user.nickname}</div>
                      <div className="text-white/60 text-[10px] mt-0.5">
                        {user.distance.toFixed(1)}km · {user.age}岁
                      </div>
                    </div>
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
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-white/70 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-cyan" />
                以 <span className="text-white font-semibold">{currentUser?.nickname || '我'}</span> 为中心 ·{' '}
                <span className="text-brand-cyan font-semibold">{radius}km</span> 范围内 · 共{' '}
                <span className="text-white font-semibold">{filteredUsers.length}</span> 位附近用户
              </p>
              <p className="text-xs text-white/40">
                坐标: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
