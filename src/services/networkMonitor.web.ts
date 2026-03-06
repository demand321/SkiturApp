// Web stub — uses browser online/offline events instead of NetInfo
import { useSyncStore } from '../stores/syncStore';

export function startNetworkMonitor() {
  const update = () => useSyncStore.getState().setOnline(navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}
