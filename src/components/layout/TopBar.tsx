import { Search, Bell, Settings } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="h-16 glass-strong border-b border-surface-border flex items-center px-6 gap-4">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="搜索用户、直播间..."
          className="w-full h-11 pl-12 pr-4 rounded-xl bg-surface border border-surface-border text-sm placeholder:text-white/40 focus:border-brand-purple/50 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-11 h-11 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-white/60 hover:text-white hover:bg-surface-hover transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-pink rounded-full" />
        </button>
        <button className="w-11 h-11 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-white/60 hover:text-white hover:bg-surface-hover transition-all">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
