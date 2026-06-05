import { useState } from 'react';
import { Coins, Plus } from 'lucide-react';
import { useAppStore } from '@/store';
import RechargeModal from './RechargeModal';

interface CoinBalanceProps {
  variant?: 'default' | 'compact' | 'dark';
  showRecharge?: boolean;
  className?: string;
}

export default function CoinBalance({
  variant = 'default',
  showRecharge = true,
  className = '',
}: CoinBalanceProps) {
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const coinBalance = useAppStore((s) => s.coinBalance);

  const baseStyles =
    variant === 'dark'
      ? 'bg-black/40 backdrop-blur-sm text-white'
      : variant === 'compact'
        ? 'glass-light text-white'
        : 'glass-light text-white';

  return (
    <>
      <div className={`flex items-center gap-2 rounded-full px-3 h-10 ${baseStyles} ${className}`}>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
          <Coins className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-sm tabular-nums">{coinBalance.toLocaleString()}</span>
        {showRecharge && (
          <button
            onClick={() => setShowRechargeModal(true)}
            className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center ml-1 hover:scale-110 transition-transform"
            title="充值金币"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>
      <RechargeModal open={showRechargeModal} onClose={() => setShowRechargeModal(false)} />
    </>
  );
}
