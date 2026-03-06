import { useEffect } from 'react';
import { useTripStore } from '../stores/tripStore';
import { useAuthStore } from '../stores/authStore';
import { subscribeToTrips } from '../services/trips';
import { Trip } from '../types';

export function useTrips() {
  const user = useAuthStore((s) => s.user);
  const { trips, setTrips } = useTripStore();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToTrips(user.uid, setTrips);
    return unsubscribe;
  }, [user, setTrips]);

  const planning = trips.filter((t) => t.status === 'planning');
  const active = trips.filter((t) => t.status === 'active');
  const completed = trips.filter((t) => t.status === 'completed');

  return { trips, planning, active, completed };
}

export function useTripParticipants(trip: Trip) {
  const user = useAuthStore((s) => s.user);
  const isCreator = user?.uid === trip.createdBy;
  const isParticipant = user ? trip.participants.includes(user.uid) : false;
  return { isCreator, isParticipant };
}
