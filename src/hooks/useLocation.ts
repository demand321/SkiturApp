import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useLocationStore } from '../stores/locationStore';
import { RoutePoint } from '../types';

export function useRoutePoints(tripId: string) {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);

  useEffect(() => {
    const routeRef = collection(db, 'trips', tripId, 'route');
    const q = query(routeRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const points = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as RoutePoint
      );
      setRoutePoints(points);
    });
    return unsubscribe;
  }, [tripId]);

  return routePoints;
}

export function useParticipantPositions(tripId: string) {
  const [positions, setPositions] = useState<
    Map<string, { latitude: number; longitude: number }>
  >(new Map());

  useEffect(() => {
    const routeRef = collection(db, 'trips', tripId, 'route');
    // Get latest position per user by listening to recent points
    const q = query(routeRef, orderBy('timestamp', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const latest = new Map<string, { latitude: number; longitude: number }>();
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!latest.has(data.userId)) {
          latest.set(data.userId, {
            latitude: data.latitude,
            longitude: data.longitude,
          });
        }
      }
      setPositions(latest);
    });
    return unsubscribe;
  }, [tripId]);

  return positions;
}

export { useLocationStore };
