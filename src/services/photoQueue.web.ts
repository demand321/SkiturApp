// Web version — uploads directly (no file system queue needed)
import { uploadPhoto } from './photos';
import { useSyncStore } from '../stores/syncStore';

export async function enqueuePhoto(
  tripId: string,
  userId: string,
  uri: string,
  caption: string,
  location: { latitude: number; longitude: number; altitude: number }
) {
  useSyncStore.getState().setPendingUploads(1);
  try {
    await uploadPhoto(tripId, userId, uri, caption, location);
  } finally {
    useSyncStore.getState().setPendingUploads(0);
  }
}

export async function processQueue() {}

export async function getQueueLength(): Promise<number> {
  return 0;
}
