import { useEffect, useRef, useState, useCallback } from 'react';
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
  const streamRef = useRef<MediaStream | null>(null);
  const durationTimerRef = useRef<number | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [callDuration, setCallDuration] = useState(0);
  const [showBeautyPanel, setShowBeautyPanel] = useState(false);
  const [beautyLevel, setBeautyLevel] = useState(50);
  const [error, setError] = useState('');

  const partner = mockUsers.find((u) => u.id === userId);
  const currentUser = useAppStore((s) => s.currentUser);

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const startMediaStream = useCallback(async (withVideo: boolean) => {
    try {
      stopMediaStream();

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: withVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (localVideoRef.current && withVideo) {
        localVideoRef.current.srcObject = stream;
        try {
          await localVideoRef.current.play();
        } catch (e) {
          console.warn('本地视频自动播放被阻止:', e);
        }
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.muted = true;
        try {
          await remoteVideoRef.current.play();
        } catch (e) {
          console.warn('远端视频自动播放被阻止:', e);
        }
      }

      setError('');
    } catch (e: any) {
      console.error('获取媒体设备失败:', e);
      if (e.name === 'NotAllowedError') {
        setError('摄像头/麦克风权限被拒绝，请在浏览器设置中允许访问');
      } else if (e.name === 'NotFoundError') {
        setError('未找到摄像头或麦克风设备');
      } else {
        setError('无法访问媒体设备: ' + (e.message || '未知错误'));
      }
    }
  }, [stopMediaStream]);

  useEffect(() => {
    const shouldHaveVideo = !isAudioCall && isVideoOn;
    startMediaStream(shouldHaveVideo);

    return () => {
      stopMediaStream();
    };
  }, [isAudioCall, isVideoOn, startMediaStream, stopMediaStream]);

  useEffect(() => {
    if (callStatus === 'calling') {
      const callTimer = setTimeout(() => {
        setCallStatus('connected');
      }, 3000);
      return () => clearTimeout(callTimer);
    }
  }, [callStatus]);

  useEffect(() => {
    if (callStatus === 'connected' && !durationTimerRef.current) {
      durationTimerRef.current = window.setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [callStatus]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    setCallStatus('ended');
    stopMediaStream();
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    navigate(-1);
  };

  const acceptCall = () => {
    setCallStatus('connected');
  };

  const toggleAudioCall = () => {
    setIsAudioCall((prev) => !prev);
    setIsVideoOn(isAudioCall);
  };

  const renderVideoContent = () => {
    if (isAudioCall || !isVideoOn) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-background-deep via-background to-brand-purple/20">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {callStatus === 'calling' && (
              <div className="relative mb-8">
                <div className="absolute inset-0 w-40 h-40 rounded-full bg-brand-purple/30 animate-ripple" />
                <div
                  className="absolute inset-0 w-40 h-40 rounded-full bg-brand-purple/20 animate-ripple"
                  style={{ animationDelay: '0.5s' }}
                />
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
            {error && (
              <p className="mt-4 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm max-w-md text-center">
                {error}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <>
        <video
          ref={remoteVideoRef}
          className="absolute inset-0 w-full h-full object-cover bg-black"
          autoPlay
          playsInline
          muted
          poster={partner?.avatar}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl glass-strong text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="absolute bottom-32 right-6 w-40 h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-white/20 bg-background-deep">
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
    );
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {renderVideoContent()}

      {callStatus === 'calling' && !isAudioCall && isVideoOn && (
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

      {callStatus === 'connected' && !isAudioCall && isVideoOn && (
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
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500 text-white' : 'glass-strong text-white hover:bg-white/20'
              }`}
              title={isMuted ? '取消静音' : '静音'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {!isAudioCall && (
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  !isVideoOn ? 'bg-red-500 text-white' : 'glass-strong text-white hover:bg-white/20'
                }`}
                title={isVideoOn ? '关闭摄像头' : '开启摄像头'}
              >
                {!isVideoOn ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}

            <button
              onClick={() => setShowBeautyPanel(!showBeautyPanel)}
              className="w-14 h-14 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/20 transition-all"
              title="美颜"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </button>

            {!isAudioCall && (
              <button
                onClick={() => startMediaStream(!isAudioCall && isVideoOn)}
                className="w-14 h-14 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/20 transition-all"
                title="切换摄像头"
              >
                <SwitchCamera className="w-6 h-6" />
              </button>
            )}

            <button
              className="w-14 h-14 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/20 transition-all"
              title="屏幕共享"
            >
              <Monitor className="w-6 h-6" />
            </button>

            <button
              onClick={toggleAudioCall}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isAudioCall
                  ? 'gradient-bg text-white shadow-lg shadow-brand-purple/30'
                  : 'glass-strong text-white hover:bg-white/20'
              }`}
              title={isAudioCall ? '切换到视频通话' : '切换到语音通话'}
            >
              <Volume2 className="w-6 h-6" />
            </button>

            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-500/50 hover:scale-110 transition-transform ml-4"
              title="挂断"
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
