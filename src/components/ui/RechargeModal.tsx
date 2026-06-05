import { useState } from 'react';
import { X, Check, Loader2, Coins, Sparkles, Shield } from 'lucide-react';
import { useAppStore } from '@/store';
import type { RechargePackage, PaymentMethod } from '../../../shared/types';

const RECHARGE_PACKAGES: RechargePackage[] = [
  { id: 'p1', coins: 60, price: 6 },
  { id: 'p2', coins: 300, price: 30, bonus: 30, isHot: true },
  { id: 'p3', coins: 680, price: 68, bonus: 80 },
  { id: 'p4', coins: 1280, price: 128, bonus: 180, isHot: true },
  { id: 'p5', coins: 3280, price: 328, bonus: 580, isDiscount: true },
  { id: 'p6', coins: 6480, price: 648, bonus: 1500, isDiscount: true },
  { id: 'p7', coins: 12800, price: 1280, bonus: 3800, isDiscount: true },
  { id: 'p8', coins: 32800, price: 3280, bonus: 12000 },
];

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  name: string;
  desc: string;
  color: string;
  icon: string;
}> = [
  {
    id: 'wechat',
    name: '微信支付',
    desc: '推荐使用，安全便捷',
    color: '#07C160',
    icon: '💬',
  },
  {
    id: 'alipay',
    name: '支付宝',
    desc: '支持花呗分期',
    color: '#1677FF',
    icon: '🅰️',
  },
  {
    id: 'qq',
    name: 'QQ钱包',
    desc: 'QQ用户专享',
    color: '#12B7F5',
    icon: '🐧',
  },
];

interface RechargeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RechargeModal({ open, onClose }: RechargeModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('p2');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wechat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const addCoins = useAppStore((s) => s.addCoins);
  const coinBalance = useAppStore((s) => s.coinBalance);

  if (!open) return null;

  const selectedPkg = RECHARGE_PACKAGES.find((p) => p.id === selectedPackage)!;
  const totalCoins = selectedPkg.coins + (selectedPkg.bonus || 0);

  const handlePay = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    addCoins(totalCoins);
    setIsProcessing(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        <div
          className="relative flex flex-col items-center gap-4 p-10 rounded-3xl glass-strong"
          style={{ animation: 'scaleIn 0.3s ease-out' }}
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <p className="text-xl font-bold text-white">充值成功！</p>
          <p className="text-sm text-white/60">
            +{totalCoins.toLocaleString()} 金币已到账
          </p>
        </div>
        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative w-full max-w-lg mx-4 glass-strong rounded-3xl overflow-hidden"
        style={{ animation: 'scaleIn 0.3s ease-out' }}
      >
        <div className="relative p-6 bg-gradient-to-br from-brand-purple/30 via-brand-pink/10 to-transparent border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">充值金币</h2>
              <p className="text-sm text-white/60 mt-1">
                当前余额：<span className="text-yellow-400 font-semibold">{coinBalance.toLocaleString()}</span> 金币
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute top-4 right-14 flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
            <Shield className="w-3 h-3" />
            安全支付
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              选择充值套餐
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RECHARGE_PACKAGES.map((pkg) => {
                const isActive = pkg.id === selectedPackage;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative p-3 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-brand-purple/40 to-brand-pink/30 border-2 border-brand-purple shadow-lg shadow-brand-purple/20'
                        : 'glass-light border-2 border-transparent hover:border-white/20'
                    }`}
                  >
                    {pkg.isHot && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                        HOT
                      </span>
                    )}
                    {pkg.isDiscount && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                        超值
                      </span>
                    )}
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-2xl font-bold text-yellow-400">
                        {pkg.coins >= 1000 ? `${(pkg.coins / 1000).toFixed(1)}k` : pkg.coins}
                      </span>
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                    </div>
                    {pkg.bonus ? (
                      <p className="text-[11px] text-green-400 text-center mb-1">
                        +赠 {pkg.bonus}
                      </p>
                    ) : (
                      <div className="h-[14px]" />
                    )}
                    <p className="text-sm font-semibold text-white text-center">
                      ¥{pkg.price}
                    </p>
                    {isActive && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full gradient-bg flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-3">支付方式</h3>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((pm) => {
                const isActive = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      isActive
                        ? 'glass-light border-2 border-brand-purple'
                        : 'glass-light border-2 border-transparent hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${pm.color}20` }}
                    >
                      {pm.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">{pm.name}</p>
                      <p className="text-xs text-white/50">{pm.desc}</p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isActive
                          ? 'border-brand-purple bg-gradient-to-br from-brand-purple to-brand-pink'
                          : 'border-white/30'
                      }`}
                    >
                      {isActive && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-light rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">充值套餐</span>
              <span className="text-white font-semibold">
                {selectedPkg.coins.toLocaleString()} 金币
              </span>
            </div>
            {selectedPkg.bonus && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">赠送金币</span>
                <span className="text-green-400 font-semibold">
                  +{selectedPkg.bonus.toLocaleString()} 金币
                </span>
              </div>
            )}
            <div className="h-px bg-white/10 my-3" />
            <div className="flex items-center justify-between">
              <span className="text-white/80">应付金额</span>
              <span className="text-2xl font-bold gradient-text">
                ¥{selectedPkg.price}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full h-13 rounded-2xl gradient-bg text-white font-bold text-lg shadow-xl shadow-brand-purple/30 hover:shadow-2xl hover:shadow-brand-purple/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                支付中...
              </>
            ) : (
              <>
                确认支付 ¥{selectedPkg.price}
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-white/40 mt-3">
            点击支付即表示同意《用户充值协议》和《虚拟币服务条款》
          </p>
        </div>
      </div>
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
