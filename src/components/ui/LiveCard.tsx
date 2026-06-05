import { Eye, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LiveRoom } from '../../../shared/types';

interface Props {
  room: LiveRoom;
  index: number;
}

export default function LiveCard({ room, index }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/live/${room.id}`)}
      className="glass rounded-2xl overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-brand-purple/15 transition-all duration-500 hover:-translate-y-1"
      style={{ animation: `fadeInUp 0.5s ease ${index * 0.08}s both` }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="relative aspect-video overflow-hidden">
        <img
          src={room.cover}
          alt={room.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500 live-badge">
            <Radio className="w-3 h-3 text-white fill-white" />
            <span className="text-xs font-bold text-white">LIVE</span>
          </div>
          <span className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-sm text-xs text-white">
            {room.category}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
          <Eye className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-medium text-white">
            {room.viewerCount > 1000
              ? `${(room.viewerCount / 1000).toFixed(1)}k`
              : room.viewerCount}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold text-white line-clamp-1 mb-2">
            {room.title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src={room.hostAvatar}
                alt={room.hostName}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white/30"
              />
            </div>
            <span className="text-xs text-white/80 flex-1 truncate">
              {room.hostName}
            </span>
            <span className="text-xs text-white/60 flex items-center gap-0.5">
              ❤️ {room.likeCount > 1000 ? `${(room.likeCount / 1000).toFixed(1)}k` : room.likeCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
