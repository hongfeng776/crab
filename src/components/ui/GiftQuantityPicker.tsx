import { useState } from 'react';
import { Minus, Plus, Check } from 'lucide-react';

const QUICK_AMOUNTS = [1, 10, 66, 99, 520, 1314];

interface GiftQuantityPickerProps {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}

export default function GiftQuantityPicker({ value, onChange, max }: GiftQuantityPickerProps) {
  const [customInput, setCustomInput] = useState('');

  const handleQuickSelect = (amount: number) => {
    onChange(amount);
    setCustomInput('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '');
    setCustomInput(v);
    const num = parseInt(v, 10);
    if (!isNaN(num) && num > 0) {
      if (max !== undefined && num > max) {
        onChange(max);
      } else {
        onChange(num);
      }
    }
  };

  const decrease = () => {
    if (value > 1) {
      onChange(value - 1);
      setCustomInput('');
    }
  };

  const increase = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
      setCustomInput('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">数量</span>
        <div className="flex items-center gap-1 glass-light rounded-xl p-1">
          <button
            onClick={decrease}
            disabled={value <= 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-16 h-8 flex items-center justify-center">
            <input
              type="text"
              value={customInput || String(value)}
              onChange={handleCustomChange}
              className="w-full h-full bg-transparent text-center text-white font-bold outline-none"
            />
          </div>
          <button
            onClick={increase}
            disabled={max !== undefined && value >= max}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((amount) => {
          const isActive = value === amount && !customInput;
          const isDisabled = max !== undefined && amount > max;
          return (
            <button
              key={amount}
              onClick={() => !isDisabled && handleQuickSelect(amount)}
              disabled={isDisabled}
              className={`relative h-9 px-4 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'gradient-bg text-white shadow-lg shadow-brand-purple/30'
                  : isDisabled
                    ? 'glass-light text-white/30 cursor-not-allowed'
                    : 'glass-light text-white/70 hover:text-white hover:bg-surface-hover'
              }`}
            >
              {isActive && (
                <Check className="w-3 h-3 absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5" />
              )}
              {amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount}
              {amount === 520 && <span className="ml-0.5 text-[10px]">💕</span>}
              {amount === 1314 && <span className="ml-0.5 text-[10px]">💗</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
