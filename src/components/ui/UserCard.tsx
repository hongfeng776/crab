import { MapPin, Video, MessageCircle, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../../shared/types';

interface Props {
  user: User;
  index: number;
}

export default function UserCard({ user, index }: Props) {
  const navigate = useNavigate();

  const handleGreet = () => {
    fetch(`/api/users/${user.id}/greet`, { method: 'POST' });
  };

  const handleVideoCall = () => {
    navigate(`/call/${user.id}`);
  };

  return (
    <div
      className="glass rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-brand-purple/10 transition-all duration-500 hover:-translate-y-1"
      style={{ animation: `fadeInUp 0.5s ease ${index * 0.08}s both` }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={user.avatar}
          alt={user.nickname}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {user.isOnline && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-medium text-white">在线</span>
          </div>
        )}

        {user.isHost && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full gradient-bg">
            <span className="text-xs font-bold text-white">LIVE</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">{user.nickname}</h3>
            {user.isVerified && (
              <BadgeCheck className="w-5 h-5 text-brand-cyan fill-brand-cyan/20" />
            )}
            <span className="text-sm text-white/70">{user.age}岁</span>
          </div>
          <div className="flex items-center gap-1 text-white/70 text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span>{user.distance}km · {user.gender === 'female' ? '女生' : '男生'}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {user.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs bg-white/15 backdrop-blur-sm text-white/90"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGreet}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              打招呼
            </button>
            <button
              onClick={handleVideoCall}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl gradient-bg hover:opacity-90 transition-opacity text-sm font-medium text-white shadow-lg shadow-brand-purple/30"
            >
              <Video className="w-4 h-4" />
              视频通话
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
