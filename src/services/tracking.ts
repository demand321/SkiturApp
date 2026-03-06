import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Battery from 'expo-battery';
import NetInfo from '@react-native-community/netinfo';
import { insertTrackPoint, getUnsyncedPoints, markPointsSynced } from './trackingDb';
import { uploadTrackPoints } from './location';
import { useLocationStore } from '../stores/locationStore';
import { saveTrackingState, clearTrackingState, getTrackingState } from './trackingState';
import { TRACKING } from '../constants';

const LOW_BATTERY_THRESHOLD = 0.2;

export const BACKGROUND_LOCATION_TASK = 'skitur-background-location';

let syncIntervalId: ReturnType<typeof setInterval> | null = null;
let currentTripId: string | null = null;
let currentUserId: string | null = null;

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }
  if (data && currentTripId && currentUserId) {
    const { locations } = data as { locations: Location.LocationObject[] };
    for (const loc of locations) {
      insertTrackPoint({
        tripId: currentTripId,
        userId: currentUserId,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        altitude: loc.coords.altitude ?? 0,
        speed: loc.coords.speed ?? 0,
        accuracy: loc.coords.accuracy ?? 0,
        timestamp: loc.timestamp,
      });

      useLocationStore.getState().setCurrentPosition({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        altitude: loc.coords.altitude ?? 0,
      });

      useLocationStore.getState().addTrackPoint({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        altitude: loc.coords.altitude ?? 0,
        timestamp: loc.timestamp,
      });
    }
  }
});

async function syncToFirestore() {
  if (!currentTripId) return;

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  const unsynced = await getUnsyncedPoints(currentTripId);
  if (unsynced.length === 0) return;

  try {
    await uploadTrackPoints(
      currentTripId,
      unsynced.map((p) => ({
        userId: p.user_id,
        latitude: p.latitude,
        longitude: p.longitude,
        altitude: p.altitude,
        speed: p.speed,
        accuracy: p.accuracy,
        timestamp: p.timestamp,
      }))
    );
    await markPointsSynced(unsynced.map((p) => p.id));
  } catch (error) {
    console.warn('Sync failed, will retry:', error);
  }
}

async function getTrackingAccuracy(): Promise<{
  accuracy: Location.Accuracy;
  timeInterval: number;
}> {
  try {
    const batteryLevel = await Battery.getBatteryLevelAsync();
    if (batteryLevel >= 0 && batteryLevel < LOW_BATTERY_THRESHOLD) {
      return {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: TRACKING.lowBatteryIntervalMs,
      };
    }
  } catch {
    // Battery API unavailable (e.g. simulator), use defaults
  }
  return {
    accuracy: Location.Accuracy.High,
    timeInterval: TRACKING.intervalMs,
  };
}

export async function startTracking(tripId: string, userId: string) {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    throw new Error('Mangler tillatelse til posisjonssporing');
  }

  currentTripId = tripId;
  currentUserId = userId;

  const { accuracy, timeInterval } = await getTrackingAccuracy();

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy,
    timeInterval,
    distanceInterval: 5,
    foregroundService: {
      notificationTitle: 'SkiturApp sporer turen din',
      notificationBody: 'GPS-sporing er aktiv',
      notificationColor: '#1B6DB2',
    },
    showsBackgroundLocationIndicator: true,
    pausesUpdatesAutomatically: false,
  });

  syncIntervalId = setInterval(syncToFirestore, TRACKING.syncIntervalMs);
  useLocationStore.getState().setTracking(true);
  await saveTrackingState(tripId, userId);
}

export async function stopTracking() {
  const isTracking = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK
  ).catch(() => false);

  if (isTracking) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }

  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }

  // Final sync
  await syncToFirestore();

  currentTripId = null;
  currentUserId = null;
  useLocationStore.getState().setTracking(false);
  useLocationStore.getState().clearTrackPoints();
  await clearTrackingState();
}

export async function resumeTrackingIfNeeded() {
  const state = await getTrackingState();
  if (!state) return;

  const isTracking = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK
  ).catch(() => false);

  if (isTracking) {
    currentTripId = state.tripId;
    currentUserId = state.userId;
    syncIntervalId = setInterval(syncToFirestore, TRACKING.syncIntervalMs);
    useLocationStore.getState().setTracking(true);
  } else {
    await clearTrackingState();
  }
}

async function requestPermissions(): Promise<boolean> {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') return false;

  const { status: background } = await Location.requestBackgroundPermissionsAsync();
  return background === 'granted';
}
