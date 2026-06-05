import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Sparkles, Camera, Shield, MessageCircle, Radio } from 'lucide-react';
import { useAppStore } from '@/store';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const setLoggedIn = useAppStore((s) => s.setLoggedIn);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      
      if (data.success) {
        setCurrentUser(data.data.user);
        setLoggedIn(true);
        navigate('/nearby');
      } else {
        setError(data.message || '登录失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async () => {
    try {
      const res = await fetch('/api/auth/face-login', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.data.user);
        setLoggedIn(true);
        navigate('/nearby');
      }
    } catch {
      setError('网络错误，请稍后重试');
    }
  };

  return (
    <div className="min-h-screen bg-background-deep flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-purple/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-pink/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-bg shadow-2xl shadow-brand-purple/40 mb-5 animate-float">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold gradient-text mb-2">Crab</h1>
          <p className="text-white/60">连接身边的美好 · 遇见有趣的灵魂</p>
        </div>

        <div className="glass-strong rounded-3xl p-8 shadow-2xl shadow-black/20">
          <h2 className="text-xl font-bold mb-6">欢迎回来 👋</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">手机号</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface border border-surface-border text-sm placeholder:text-white/40 focus:border-brand-purple/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">验证码</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="请输入验证码 (测试: 123456)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface border border-surface-border text-sm placeholder:text-white/40 focus:border-brand-purple/50 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl gradient-bg text-white font-semibold shadow-lg shadow-brand-purple/30 hover:shadow-xl hover:shadow-brand-purple/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登 录'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm text-white/50 bg-[#1A1D2E]">或使用其他方式</span>
            </div>
          </div>

          <button
            onClick={handleFaceLogin}
            className="w-full h-12 rounded-xl glass-light hover:bg-surface-hover transition-all flex items-center justify-center gap-2 font-medium text-white/90"
          >
            <Camera className="w-5 h-5 text-brand-cyan" />
            人脸识别快捷登录
          </button>

          <p className="text-xs text-white/40 text-center mt-6">
            登录即表示您同意《用户协议》和《隐私政策》
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: MapPinReplaced, label: '附近匹配' },
            { icon: Radio, label: '直播互动' },
            { icon: MessageCircle, label: '音视频通话' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="glass-light rounded-xl p-3 text-center">
                <Icon className="w-6 h-6 mx-auto mb-1.5 text-brand-purple" />
                <span className="text-xs text-white/70">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MapPinReplaced(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
