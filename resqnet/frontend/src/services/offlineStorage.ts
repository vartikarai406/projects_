export interface OfflineDraft {
  client_temp_id: string;
  client_uuid: string;
  title: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name: string;
  zone_name: string;
  people_affected: number;
  requested_assistance: string[];
  immediate_threat_to_life: boolean;
  urgency_level: string;
  reporter_contact?: string;
  image_url?: string;
  offline_created_at: string;
}

const STORAGE_KEY = 'resqnet_offline_drafts';

export const offlineStorage = {
  getQueue: (): OfflineDraft[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  enqueue: (draft: Omit<OfflineDraft, 'client_temp_id' | 'client_uuid' | 'offline_created_at'>): OfflineDraft => {
    const queue = offlineStorage.getQueue();
    const newDraft: OfflineDraft = {
      ...draft,
      client_temp_id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      client_uuid: `uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      offline_created_at: new Date().toISOString(),
    };
    queue.push(newDraft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return newDraft;
  },

  remove: (tempId: string) => {
    const queue = offlineStorage.getQueue().filter((d) => d.client_temp_id !== tempId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
