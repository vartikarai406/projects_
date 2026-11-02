import React, { createContext, useContext, useState, useEffect } from 'react';
import { offlineStorage, OfflineDraft } from '../services/offlineStorage';
import { api } from '../services/api';

interface OfflineContextType {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncMessage: string | null;
  syncNow: () => Promise<void>;
  enqueueDraft: (draft: Omit<OfflineDraft, 'client_temp_id' | 'client_uuid' | 'offline_created_at'>) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(offlineStorage.getQueue().length);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when connectivity restores
      autoSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const autoSync = async () => {
    const queue = offlineStorage.getQueue();
    if (queue.length > 0) {
      await syncNow();
    }
  };

  const syncNow = async () => {
    const queue = offlineStorage.getQueue();
    if (queue.length === 0) {
      setSyncMessage('No offline reports pending synchronization.');
      setTimeout(() => setSyncMessage(null), 3000);
      return;
    }

    setIsSyncing(true);
    setSyncMessage(`Synchronizing ${queue.length} offline report(s)...`);

    try {
      const res = await api.syncOfflineIncidents(queue);
      offlineStorage.clear();
      setPendingCount(0);
      setSyncMessage(
        `Successfully synced ${res.created_count} new report(s) (${res.duplicate_count} duplicate(s) flagged).`
      );
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (e: any) {
      setSyncMessage(`Sync failed: ${e.message}. Reports kept locally.`);
      setTimeout(() => setSyncMessage(null), 6000);
    } finally {
      setIsSyncing(false);
    }
  };

  const enqueueDraft = (draft: Omit<OfflineDraft, 'client_temp_id' | 'client_uuid' | 'offline_created_at'>) => {
    offlineStorage.enqueue(draft);
    setPendingCount(offlineStorage.getQueue().length);
    setSyncMessage('Report drafted in local offline storage.');
    setTimeout(() => setSyncMessage(null), 4000);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        syncMessage,
        syncNow,
        enqueueDraft,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within an OfflineProvider');
  return ctx;
};
