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
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { getSocket } from '@/lib/socket';
import { mockGifts } from '@/lib/mockData';
import GiftQuantityPicker from '@/components/ui/GiftQuantityPicker';
import CoinBalance from '@/components/ui/CoinBalance';
import RechargeModal from '@/components/ui/RechargeModal';
import type { DanmakuMessage, Gift as GiftType } from '../../shared/types';

export default function LiveRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const danmakuListRef = useRef<HTMLDivElement>(null);
  const [danmakuInput, setDanmakuInput] = useState('');
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [flyingGifts, setFlyingGifts] = useState<{ id: number; gift: GiftType; count: number }[]>([]);
  const [likeBursts, setLikeBursts] = useState<number[]>([]);
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
  const [giftQuantity, setGiftQuantity] = useState(1);
  const [showRechargeFromGift, setShowRechargeFromGift] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser);
  const liveRooms = useAppStore((s) => s.liveRooms);
  const addDanmaku = useAppStore((s) => s.addDanmaku);
  const danmakuMessages = useAppStore((s) => s.danmakuMessages);
  const coinBalance = useAppStore((s) => s.coinBalance);
  const deductCoins = useAppStore((s) => s.deductCoins);

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

    socket.on('receive_gift', ({ sender, gift, count }) => {
      showGiftAnimation(gift, count || 1);
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

  const totalGiftCost = selectedGift ? selectedGift.value * giftQuantity : 0;
  const canAfford = totalGiftCost <= coinBalance;

  const handleSendGift = () => {
    if (!selectedGift || !currentUser || !roomId) return;
    if (!canAfford) {
      setShowRechargeFromGift(true);
      return;
    }
    const ok = deductCoins(totalGiftCost);
    if (!ok) {
      setShowRechargeFromGift(true);
      return;
    }
    const socket = getSocket();
    socket.emit('send_gift', {
      roomId,
      userId: currentUser.id,
      userName: currentUser.nickname,
      userAvatar: currentUser.avatar,
      gift: selectedGift,
      count: giftQuantity,
    });
    showGiftAnimation(selectedGift, giftQuantity);
    setShowGiftPanel(false);
    setSelectedGift(null);
    setGiftQuantity(1);
  };

  const showGiftAnimation = (gift: GiftType, count: number = 1) => {
    const id = Date.now();
    setFlyingGifts((prev) => [...prev, { id, gift, count }]);
    setTimeout(() => {
      setFlyingGifts((prev) => prev.filter((g) => g.id !== id));
    }, 3500);
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
          <div className="flex items-center justify-between p-4 flex-wrap gap-3">
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
              <CoinBalance variant="dark" />
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
              style={{ animation: 'giftFly 3.5s ease-out forwards' }}
            >
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl glass-strong">
                <span className="text-5xl">{fg.gift.icon}</span>
                <div>
                  <p className="text-white/70 text-xs">送出</p>
                  <p className="text-white font-bold text-xl">
                    {fg.gift.name}
                    {fg.count > 1 && (
                      <span className="text-yellow-400 ml-2">× {fg.count}</span>
                    )}
                  </p>
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
              15% { opacity: 1; transform: translateX(0) scale(1); }
              75% { opacity: 1; transform: translateX(0) scale(1); }
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
                        msg.type === 'system'
                          ? 'text-brand-cyan'
                          : msg.type === 'gift'
                            ? 'text-yellow-400'
                            : ''
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
                    onClick={() => {
                      setShowGiftPanel(true);
                      if (!selectedGift && mockGifts.length > 0) {
                        setSelectedGift(mockGifts[0]);
                      }
                    }}
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
            <div className="flex items-center justify-between mt-3 px-2 flex-wrap gap-3">
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
            onClick={() => {
              setShowGiftPanel(false);
              setSelectedGift(null);
              setGiftQuantity(1);
            }}
          />
          <div
            className="relative w-full glass-strong rounded-t-3xl p-6"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-xl font-bold">送礼物</h3>
                <CoinBalance variant="compact" showRecharge={false} />
              </div>
              <button
                onClick={() => {
                  setShowGiftPanel(false);
                  setSelectedGift(null);
                  setGiftQuantity(1);
                }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
              {mockGifts.map((gift) => {
                const isActive = selectedGift?.id === gift.id;
                return (
                  <button
                    key={gift.id}
                    onClick={() => setSelectedGift(gift)}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-brand-purple/40 to-brand-pink/30 border-2 border-brand-purple shadow-lg shadow-brand-purple/20'
                        : 'glass-light border-2 border-transparent hover:border-white/20'
                    }`}
                  >
                    <span
                      className={`text-4xl transition-transform ${
                        isActive ? 'scale-125' : 'hover:scale-110'
                      }`}
                    >
                      {gift.icon}
                    </span>
                    <span className="text-sm font-medium text-white">{gift.name}</span>
                    <span className="text-xs text-yellow-400 font-semibold">
                      {gift.value} 币
                    </span>
                    {isActive && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full gradient-bg flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedGift && (
              <div className="glass-light rounded-2xl p-4 mb-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedGift.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{selectedGift.name}</p>
                      <p className="text-xs text-white/50">
                        单价 {selectedGift.value} 币
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/50">合计</p>
                    <p
                      className={`text-xl font-bold ${
                        canAfford ? 'text-yellow-400' : 'text-red-400'
                      }`}
                    >
                      {totalGiftCost.toLocaleString()} 币
                    </p>
                  </div>
                </div>
                <GiftQuantityPicker
                  value={giftQuantity}
                  onChange={setGiftQuantity}
                  max={canAfford ? undefined : Math.floor(coinBalance / selectedGift.value) || 1}
                />
                {!canAfford && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400 flex-1">
                      金币不足，还需{' '}
                      <span className="font-bold">
                        {(totalGiftCost - coinBalance).toLocaleString()}
                      </span>{' '}
                      币
                    </p>
                    <button
                      onClick={() => {
                        setShowGiftPanel(false);
                        setShowRechargeFromGift(true);
                      }}
                      className="h-8 px-4 rounded-lg gradient-bg text-white text-xs font-semibold"
                    >
                      立即充值
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSendGift}
              disabled={!selectedGift}
              className={`w-full h-12 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                canAfford
                  ? 'gradient-bg text-white shadow-xl shadow-brand-purple/30 hover:shadow-2xl hover:shadow-brand-purple/40'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
              }`}
            >
              {selectedGift
                ? canAfford
                  ? `送出 ${selectedGift.name} × ${giftQuantity}  (${totalGiftCost} 币)`
                  : '金币不足，去充值'
                : '请选择礼物'}
            </button>
          </div>
        </div>
      )}

      <RechargeModal
        open={showRechargeFromGift}
        onClose={() => setShowRechargeFromGift(false)}
      />

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
