import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'skitur_tracking_state';

interface TrackingState {
  tripId: string;
  userId: string;
  startedAt: number;
}

export async function saveTrackingState(tripId: string, userId: string) {
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ tripId, userId, startedAt: Date.now() })
  );
}

export async function getTrackingState(): Promise<TrackingState | null> {
  const data = await AsyncStorage.getItem(KEY);
  if (!data) return null;
  return JSON.parse(data);
}

export async function clearTrackingState() {
  await AsyncStorage.removeItem(KEY);
}
