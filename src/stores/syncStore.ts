import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  pendingUploads: number;
  pendingSyncPoints: number;
  setOnline: (online: boolean) => void;
  setPendingUploads: (count: number) => void;
  setPendingSyncPoints: (count: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  pendingUploads: 0,
  pendingSyncPoints: 0,
  setOnline: (isOnline) => set({ isOnline }),
  setPendingUploads: (pendingUploads) => set({ pendingUploads }),
  setPendingSyncPoints: (pendingSyncPoints) => set({ pendingSyncPoints }),
}));
