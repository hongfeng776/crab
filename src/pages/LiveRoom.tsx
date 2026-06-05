import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Heart,
  Eye,
  Send,
  Gift,
  X,
  Users,
  Phone,
  Video,
  Radio,
  MessageCircle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { getSocket } from '@/lib/socket';
import { mockGifts } from '@/lib/mockData';
import type { DanmakuMessage, Gift as GiftType } from '../../shared/types';

export default function LiveRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const danmakuListRef = useRef<HTMLDivElement>(null);
  const [danmakuInput, setDanmakuInput] = useState('');
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [flyingGifts, setFlyingGifts] = useState<{ id: number; gift: GiftType }[]>([]);
  const [likeBursts, setLikeBursts] = useState<number[]>([]);
  const currentUser = useAppStore((s) => s.currentUser);
  const liveRooms = useAppStore((s) => s.liveRooms);
  const addDanmaku = useAppStore((s) => s.addDanmaku);
  const danmakuMessages = useAppStore((s) => s.danmakuMessages);

  const room = liveRooms.find((r) => r.id === roomId);

  useEffect(() => {
    if (!roomId || !currentUser) return;

    const socket = getSocket();

    socket.emit('join_room', {
      roomId,
      userId: currentUser.id,
      userName: currentUser.nickname,
      userAvatar: currentUser.avatar,
    });

    socket.on('receive_danmaku', (msg: DanmakuMessage) => {
      addDanmaku(msg);
    });

    socket.on('viewer_update', ({ viewerCount: count }) => {
      setViewerCount(count);
    });

    socket.on('like_update', () => {
      setLikeCount((c) => c + 1);
    });

    socket.on('receive_gift', ({ sender, gift }) => {
      showGiftAnimation(gift);
    });

    if (room) {
      setViewerCount(room.viewerCount);
      setLikeCount(room.likeCount);
    }

    return () => {
      socket.emit('leave_room', { roomId, userName: currentUser.nickname });
      socket.off('receive_danmaku');
      socket.off('viewer_update');
      socket.off('like_update');
      socket.off('receive_gift');
    };
  }, [roomId, currentUser, room, addDanmaku]);

  useEffect(() => {
    if (danmakuListRef.current) {
      danmakuListRef.current.scrollTop = danmakuListRef.current.scrollHeight;
    }
  }, [danmakuMessages]);

  const sendDanmaku = () => {
    if (!danmakuInput.trim() || !currentUser || !roomId) return;
    const socket = getSocket();
    socket.emit('send_danmaku', {
      roomId,
      userId: currentUser.id,
      userName: currentUser.nickname,
      userAvatar: currentUser.avatar,
      content: danmakuInput.trim(),
    });
    setDanmakuInput('');
  };

  const sendLike = () => {
    if (!roomId) return;
    const socket = getSocket();
    socket.emit('like', { roomId });
    setLikeCount((c) => c + 1);
    const burstId = Date.now();
    setLikeBursts((prev) => [...prev, burstId]);
    setTimeout(() => {
      setLikeBursts((prev) => prev.filter((id) => id !== burstId));
    }, 1000);
  };

  const sendGift = (gift: GiftType) => {
    if (!currentUser || !roomId) return;
    const socket = getSocket();
    socket.emit('send_gift', {
      roomId,
      userId: currentUser.id,
      userName: currentUser.nickname,
      userAvatar: currentUser.avatar,
      gift,
    });
    showGiftAnimation(gift);
    setShowGiftPanel(false);
  };

  const showGiftAnimation = (gift: GiftType) => {
    const id = Date.now();
    setFlyingGifts((prev) => [...prev, { id, gift }]);
    setTimeout(() => {
      setFlyingGifts((prev) => prev.filter((g) => g.id !== id));
    }, 3000);
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">直播间不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={room.cover}
          alt=""
          className="w-full h-full object-cover opacity-60 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <div className="relative h-screen flex">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={room.hostAvatar}
                    alt={room.hostName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-purple"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{room.hostName}</p>
                    <span className="px-1.5 py-0.5 rounded bg-red-500 text-[10px] font-bold text-white live-badge">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-white/60">{room.title}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
                <Eye className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white">{viewerCount}</span>
              </div>
              <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="px-4 h-10 rounded-full gradient-bg text-white text-sm font-semibold shadow-lg shadow-brand-purple/30">
                + 关注
              </button>
            </div>
          </div>

          <div className="flex-1 relative" />

          <div className="absolute bottom-24 right-24 space-y-3">
            {likeBursts.map((id, idx) => (
              <Heart
                key={id}
                className="w-10 h-10 text-brand-pink fill-brand-pink absolute"
                style={{
                  right: `${idx * 10}px`,
                  animation: 'floatUp 1s ease-out forwards',
                }}
              />
            ))}
          </div>

          {flyingGifts.map((fg) => (
            <div
              key={fg.id}
              className="absolute bottom-32 left-8"
              style={{ animation: 'giftFly 3s ease-out forwards' }}
            >
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl glass-strong">
                <span className="text-5xl">{fg.gift.icon}</span>
                <div>
                  <p className="text-white/70 text-xs">送出</p>
                  <p className="text-white font-bold text-xl">{fg.gift.name}</p>
                </div>
              </div>
            </div>
          ))}

          <style>{`
            @keyframes floatUp {
              0% { opacity: 1; transform: translateY(0) scale(1); }
              100% { opacity: 0; transform: translateY(-150px) scale(1.5); }
            }
            @keyframes giftFly {
              0% { opacity: 0; transform: translateX(-100px) scale(0.5); }
              20% { opacity: 1; transform: translateX(0) scale(1); }
              80% { opacity: 1; transform: translateX(0) scale(1); }
              100% { opacity: 0; transform: translateX(200px) translateY(-100px) scale(1.5); }
            }
          `}</style>

          <div className="p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <div
                  ref={danmakuListRef}
                  className="h-48 overflow-y-auto mb-3 space-y-2 scrollbar-hide pr-2"
                >
                  {danmakuMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 text-sm ${
                        msg.type === 'system' ? 'text-brand-cyan' : msg.type === 'gift' ? 'text-yellow-400' : ''
                      }`}
                      style={{ animation: 'slideIn 0.3s ease-out' }}
                    >
                      {msg.type === 'gift' && <span>{msg.gift?.icon}</span>}
                      <span className="font-semibold text-white/80">{msg.userName}:</span>
                      <span className="text-white/90">{msg.content}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 h-11 px-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                    <MessageCircle className="w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      placeholder="说点什么..."
                      value={danmakuInput}
                      onChange={(e) => setDanmakuInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendDanmaku()}
                      className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm"
                    />
                  </div>
                  <button
                    onClick={sendDanmaku}
                    className="w-11 h-11 rounded-full gradient-bg flex items-center justify-center text-white shadow-lg shadow-brand-purple/30"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowGiftPanel(true)}
                    className="w-11 h-11 rounded-full bg-yellow-500 flex items-center justify-center text-white shadow-lg shadow-yellow-500/30 hover:scale-110 transition-transform"
                  >
                    <Gift className="w-5 h-5" />
                  </button>
                  <button
                    onClick={sendLike}
                    className="w-11 h-11 rounded-full bg-brand-pink flex items-center justify-center text-white shadow-lg shadow-brand-pink/30 hover:scale-110 transition-transform active:scale-95"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 px-2">
              <div className="flex items-center gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-brand-pink fill-brand-pink" />
                  {likeCount.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {viewerCount} 在线
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-white/70 hover:text-white">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-white/70 hover:text-white">
                  <Video className="w-5 h-5" />
                </button>
                <button className="flex items-center gap-2 h-10 px-4 rounded-full gradient-bg text-white text-sm font-semibold shadow-lg shadow-brand-purple/30">
                  <Radio className="w-4 h-4" />
                  连麦
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGiftPanel && (
        <div className="absolute inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowGiftPanel(false)}
          />
          <div className="relative w-full glass-strong rounded-t-3xl p-6" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold">送礼物</h3>
              <button
                onClick={() => setShowGiftPanel(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-4">
              {mockGifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => sendGift(gift)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl glass-light hover:bg-surface-hover hover:-translate-y-1 transition-all group"
                >
                  <span className="text-4xl group-hover:scale-125 transition-transform">{gift.icon}</span>
                  <span className="text-sm font-medium text-white">{gift.name}</span>
                  <span className="text-xs text-yellow-400">{gift.value} 币</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
