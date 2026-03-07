import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types';

export async function fetchAllUsers(): Promise<User[]> {
  const q = query(collection(db, 'users'), orderBy('displayName'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data() }) as User);
}
