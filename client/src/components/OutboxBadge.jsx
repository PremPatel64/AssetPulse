import { useEffect, useState } from 'react';
import { listOutbox, startAutoFlush } from '../lib/outbox';
import { WifiOff, Wifi } from 'lucide-react';

export default function OutboxBadge() {
  const [count, setCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const checkCount = async () => setCount((await listOutbox()).length);
    checkCount();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const cleanup = startAutoFlush(setCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanup();
    };
  }, []);

  return (
    <div className="flex items-center space-x-2">
      {!isOnline ? <WifiOff size={16} className="text-amber-500" /> : <Wifi size={16} className="text-emerald-500" />}
      {count > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
          {count}
        </span>
      )}
    </div>
  );
}
