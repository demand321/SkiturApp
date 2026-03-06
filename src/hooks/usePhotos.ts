import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Photo } from '../types';

export function usePhotos(tripId: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    const photosRef = collection(db, 'trips', tripId, 'photos');
    const q = query(photosRef, orderBy('takenAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Photo
      );
      setPhotos(items);
      setLoading(false);
    });
    return unsubscribe;
  }, [tripId]);

  return { photos, loading };
}
