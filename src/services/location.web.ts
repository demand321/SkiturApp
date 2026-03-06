// Web stub — uses browser Geolocation API instead of expo-location
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function requestLocationPermissions(): Promise<boolean> {
  if (!navigator.geolocation) return false;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false)
    );
  });
}

export async function getCurrentLocation() {
  return new Promise<{ coords: { latitude: number; longitude: number; altitude: number | null; speed: number | null; accuracy: number } }>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        coords: {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
          accuracy: pos.coords.accuracy,
        },
      }),
      reject,
      { enableHighAccuracy: true }
    );
  });
}

export async function uploadTrackPoints(
  tripId: string,
  points: Array<{
    userId: string;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    accuracy: number;
    timestamp: number;
  }>
) {
  const routeRef = collection(db, 'trips', tripId, 'route');
  const batch = points.map((point) =>
    addDoc(routeRef, {
      ...point,
      timestamp: serverTimestamp(),
    })
  );
  await Promise.all(batch);
}

export const LOCATION_TASK_NAME = 'skitur-background-location';
