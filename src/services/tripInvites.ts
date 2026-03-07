import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { TripInvite } from '../types';

const invitesCollection = (tripId: string) =>
  collection(db, 'trips', tripId, 'tripInvites');

export function subscribeToTripInvites(
  tripId: string,
  callback: (invites: TripInvite[]) => void
) {
  const q = query(invitesCollection(tripId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const invites = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as TripInvite
    );
    callback(invites);
  });
}

export async function inviteUserToTrip(
  tripId: string,
  user: { uid: string; displayName: string; email: string; phone?: string },
  invitedBy: string
) {
  await setDoc(doc(invitesCollection(tripId), user.uid), {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    phone: user.phone ?? '',
    invitedBy,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function inviteNewUserToTrip(
  tripId: string,
  name: string,
  email: string,
  phone: string,
  invitedBy: string
) {
  const id = email ? email.replace(/[^a-zA-Z0-9]/g, '_') : `phone_${phone.replace(/[^0-9]/g, '')}`;
  await setDoc(doc(invitesCollection(tripId), id), {
    uid: '',
    displayName: name,
    email,
    phone,
    invitedBy,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function respondToInvite(
  tripId: string,
  inviteId: string,
  status: 'accepted' | 'declined'
) {
  await updateDoc(doc(invitesCollection(tripId), inviteId), { status });
}
