import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  Maximize2,
  SwitchCamera,
  Sparkles,
  Monitor,
  Phone,
  PhoneCall,
  ArrowLeft,
  User,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { mockUsers } from '@/lib/mockData';

export default function VideoCall() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [callDuration, setCallDuration] = useState(0);
  const [showBeautyPanel, setShowBeautyPanel] = useState(false);
  const [beautyLevel, setBeautyLevel] = useState(50);

  const partner = mockUsers.find((u) => u.id === userId);
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startMedia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: isAudioCall ? false : true,
          audio: true,
        });
        if (localVideoRef.current && !isAudioCall) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error('获取媒体设备失败:', e);
      }
    };
    startMedia();

    const callTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 3000);

    let durationTimer: number | undefined;
    if (callStatus === 'connected') {
      durationTimer = window.setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }

    return () => {
      clearTimeout(callTimer);
      if (durationTimer) clearInterval(durationTimer);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isAudioCall, callStatus]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    setCallStatus('ended');
    navigate(-1);
  };

  const acceptCall = () => {
    setCallStatus('connected');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {!isAudioCall && isVideoOn ? (
        <>
          <video
            ref={remoteVideoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            playsInline
            muted
            poster={partner?.avatar}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          <div className="absolute bottom-32 right-6 w-40 h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-white/20">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover transform scale-x-[-1]"
              autoPlay
              playsInline
              muted
            />
            {!isVideoOn && (
              <div className="absolute inset-0 bg-background-deep flex items-center justify-center">
                <User className="w-16 h-16 text-white/30" />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-background-deep via-background to-brand-purple/20">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {callStatus === 'calling' && (
              <div className="relative mb-8">
                <div className="absolute inset-0 w-40 h-40 rounded-full bg-brand-purple/30 animate-ripple" />
                <div className="absolute inset-0 w-40 h-40 rounded-full bg-brand-purple/20 animate-ripple" style={{ animationDelay: '0.5s' }} />
                <img
                  src={partner?.avatar || currentUser?.avatar}
                  alt=""
                  className="w-40 h-40 rounded-full object-cover ring-4 ring-brand-purple shadow-2xl shadow-brand-purple/50 relative z-10"
                />
              </div>
            )}
            {callStatus === 'connected' && (
              <img
                src={partner?.avatar || currentUser?.avatar}
                alt=""
                className="w-40 h-40 rounded-full object-cover ring-4 ring-green-500 shadow-2xl shadow-green-500/30 mb-8"
              />
            )}
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              {partner?.nickname || '对方'}
            </h2>
            <p className="text-white/60 flex items-center gap-2">
              {callStatus === 'calling' && (
                <>
                  <PhoneCall className="w-4 h-4 text-green-400 animate-pulse" />
                  正在呼叫...
                </>
              )}
              {callStatus === 'connected' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  通话中 · {formatDuration(callDuration)}
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {callStatus === 'calling' && !isAudioCall && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 glass-strong rounded-full px-6 py-3 flex items-center gap-3">
          <Phone className="w-5 h-5 text-green-400 animate-pulse" />
          <span className="text-white font-medium">正在呼叫 {partner?.nickname}...</span>
        </div>
      )}

      {callStatus === 'calling' && (
        <div className="absolute top-6 left-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {callStatus === 'connected' && !isAudioCall && (
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <div className="glass-strong rounded-full px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white font-medium text-sm">{formatDuration(callDuration)}</span>
          </div>
          <button className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-8">
        {callStatus === 'calling' ? (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-500/50 hover:scale-110 transition-transform"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
            <button
              onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-2xl shadow-green-500/50 hover:scale-110 transition-transform animate-bounce-soft"
            >
              <Phone className="w-7 h-7" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500 text-white' : 'glass-strong text-white hover:bg-white/20'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {!isAudioCall && (
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  !isVideoOn ? 'bg-red-500 text-white' : 'glass-strong text-white hover:bg-white/20'
                }`}
              >
                {!isVideoOn ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}

            <button
              onClick={() => setShowBeautyPanel(!showBeautyPanel)}
              className="w-14 h-14 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </button>

            <button className="w-14 h-14 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <SwitchCamera className="w-6 h-6" />
            </button>

            <button className="w-14 h-14 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <Monitor className="w-6 h-6" />
            </button>

            <button
              onClick={() => setIsAudioCall(!isAudioCall)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isAudioCall ? 'gradient-bg text-white shadow-lg shadow-brand-purple/30' : 'glass-strong text-white hover:bg-white/20'
              }`}
            >
              <Volume2 className="w-6 h-6" />
            </button>

            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-500/50 hover:scale-110 transition-transform ml-4"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        )}
      </div>

      {showBeautyPanel && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 glass-strong rounded-2xl p-5 w-80">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              美颜效果
            </h4>
            <span className="text-sm text-brand-cyan font-semibold">{beautyLevel}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={beautyLevel}
            onChange={(e) => setBeautyLevel(Number(e.target.value))}
            className="w-full accent-brand-purple"
          />
          <div className="grid grid-cols-4 gap-2 mt-4">
            {['磨皮', '美白', '瘦脸', '大眼'].map((item) => (
              <button
                key={item}
                className="py-2 rounded-lg glass-light hover:bg-surface-hover text-sm text-white/80 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
