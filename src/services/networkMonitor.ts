import NetInfo from '@react-native-community/netinfo';
import { useSyncStore } from '../stores/syncStore';

let unsubscribe: (() => void) | null = null;

export function startNetworkMonitor() {
  if (unsubscribe) return;

  unsubscribe = NetInfo.addEventListener((state) => {
    useSyncStore.getState().setOnline(!!state.isConnected);
  });
}

export function stopNetworkMonitor() {
  unsubscribe?.();
  unsubscribe = null;
}
