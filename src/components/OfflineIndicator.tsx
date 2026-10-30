import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-4 z-50 flex items-center gap-2.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xl border border-amber-400/40 animate-bounce">
      <WifiOff className="w-4 h-4 text-amber-200" />
      <span>অফলাইন মোড — ক্যাশকৃত তথ্য প্রদর্শিত হচ্ছে</span>
    </div>
  );
};
