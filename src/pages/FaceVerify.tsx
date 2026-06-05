import { useEffect, useRef, useState } from 'react';
import { Camera, Shield, Sparkles, CheckCircle, RefreshCw, AlertCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { FaceVerifyResult } from '../../shared/types';

export default function FaceVerify() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const [step, setStep] = useState<'idle' | 'scanning' | 'verifying' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<FaceVerifyResult | null>(null);
  const [error, setError] = useState('');

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStep('scanning');
      startScanAnimation();
    } catch (e) {
      setError('无法访问摄像头，请检查权限设置');
    }
  };

  const startScanAnimation = () => {
    let p = 0;
    const interval = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        verifyFace();
      }
    }, 40);
  };

  const verifyFace = async () => {
    setStep('verifying');
    try {
      const res = await fetch('/api/face-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setStep('success');
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            isVerified: true,
            faceScore: data.data.score,
          });
        }
      }
    } catch (e) {
      setError('验证失败，请重试');
      setStep('idle');
    } finally {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    }
  };

  const reset = () => {
    setStep('idle');
    setProgress(0);
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          人脸<span className="gradient-text">实名认证</span>
        </h1>
        <p className="text-white/50">完成真人认证，获得专属标识，解锁更多功能</p>
      </div>

      <div className="glass-strong rounded-3xl p-8">
        <div className="relative aspect-square max-w-md mx-auto mb-8">
          <div className="absolute inset-0 rounded-3xl overflow-hidden bg-black">
            {step === 'idle' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-background-deep to-background">
                <div className="w-24 h-24 rounded-full glass flex items-center justify-center mb-4">
                  <Camera className="w-12 h-12 text-white/60" />
                </div>
                <p className="text-white/60">点击下方按钮开始认证</p>
              </div>
            ) : step === 'success' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-500/10 to-brand-cyan/10">
                <div className="relative mb-6">
                  <div className="absolute inset-0 w-32 h-32 rounded-full bg-green-500/20 animate-ripple" />
                  <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center relative z-10">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">认证成功！</h3>
                <p className="text-white/60">您已获得真人认证标识</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover transform scale-x-[-1]"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
                {step === 'scanning' && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-cyan to-transparent shadow-lg shadow-brand-cyan/50"
                      style={{
                        top: `${progress}%`,
                        transition: 'top 0.04s linear',
                      }}
                    />
                  </div>
                )}
                {step === 'verifying' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <RefreshCw className="w-12 h-12 text-brand-cyan animate-spin mb-3" />
                      <p className="text-white/80">AI 人脸比对中...</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <path
                d="M 10 0 L 0 0 L 0 10"
                fill="none"
                stroke="url(#borderGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 90 0 L 100 0 L 100 10"
                fill="none"
                stroke="url(#borderGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 10 100 L 0 100 L 0 90"
                fill="none"
                stroke="url(#borderGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 90 100 L 100 100 L 100 90"
                fill="none"
                stroke="url(#borderGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {step === 'scanning' && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full gradient-bg transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-xs text-white/60 mt-2">
                {progress < 30 && '请将面部对准框内'}
                {progress >= 30 && progress < 60 && '检测到面部，保持不动'}
                {progress >= 60 && progress < 100 && '活体检测中...'}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        {step === 'success' && result && (
          <div className="space-y-4 mb-6">
            <div className="glass-light rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/70">颜值评分</span>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-bold gradient-text">{result.score}</span>
                  <span className="text-white/50">/100</span>
                </div>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink"
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>
            {result.celebrityMatch && (
              <div className="glass-light rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white/70 text-sm">AI 明星脸匹配</p>
                  <p className="font-semibold">
                    与 <span className="gradient-text">{result.celebrityMatch.name}</span> 相似度 <span className="text-brand-cyan font-bold">{result.celebrityMatch.similarity}%</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20">
          <Shield className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/70 space-y-1">
            <p className="text-white/90 font-medium">认证说明</p>
            <p>· 您的人脸数据仅用于身份核验，不会被用于其他用途</p>
            <p>· 认证通过后将获得「真人认证」标识</p>
            <p>· 可提升匹配优先级，开启主播申请功能</p>
          </div>
        </div>

        <div className="flex gap-3">
          {step === 'idle' && (
            <button
              onClick={startCamera}
              className="flex-1 h-12 rounded-xl gradient-bg text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-purple/30 hover:shadow-xl hover:shadow-brand-purple/40 transition-all"
            >
              <Camera className="w-5 h-5" />
              开始人脸认证
            </button>
          )}
          {step === 'success' && (
            <>
              <button
                onClick={reset}
                className="flex-1 h-12 rounded-xl glass-light hover:bg-surface-hover transition-all font-medium"
              >
                重新认证
              </button>
              <button
                onClick={() => navigate('/nearby')}
                className="flex-1 h-12 rounded-xl gradient-bg text-white font-semibold shadow-lg shadow-brand-purple/30 transition-all"
              >
                返回首页
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
