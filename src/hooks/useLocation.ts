import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where, limit, doc, getDoc } from 'firebase/firestore';
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

export function useParticipantNames(userIds: string[]) {
  const [names, setNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (userIds.length === 0) return;

    const fetchNames = async () => {
      const result = new Map<string, string>();
      for (const uid of userIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            result.set(uid, userDoc.data().displayName || 'Ukjent');
          }
        } catch {
          result.set(uid, 'Ukjent');
        }
      }
      setNames(result);
    };
    fetchNames();
  }, [userIds.join(',')]);

  return names;
}

export { useLocationStore };
