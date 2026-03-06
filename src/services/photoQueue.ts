import { Paths, File, Directory } from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { uploadPhoto } from './photos';
import { useSyncStore } from '../stores/syncStore';

interface QueuedPhoto {
  id: string;
  tripId: string;
  userId: string;
  filename: string;
  caption: string;
  location: { latitude: number; longitude: number; altitude: number };
}

const QUEUE_DIR_NAME = 'photo_queue';
const QUEUE_FILE_NAME = 'queue.json';

function getQueueDir(): Directory {
  return new Directory(Paths.document, QUEUE_DIR_NAME);
}

function getQueueFile(): File {
  return new File(getQueueDir(), QUEUE_FILE_NAME);
}

function ensureDir() {
  const dir = getQueueDir();
  if (!dir.exists) {
    dir.create();
  }
}

async function readQueue(): Promise<QueuedPhoto[]> {
  try {
    const file = getQueueFile();
    if (!file.exists) return [];
    const data = await file.text();
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedPhoto[]) {
  ensureDir();
  const file = getQueueFile();
  file.write(JSON.stringify(queue));
  useSyncStore.getState().setPendingUploads(queue.length);
}

export async function enqueuePhoto(
  tripId: string,
  userId: string,
  uri: string,
  caption: string,
  location: { latitude: number; longitude: number; altitude: number }
) {
  ensureDir();
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const filename = `${id}.jpg`;

  // Copy file to persistent storage
  const source = new File(uri);
  const dest = new File(getQueueDir(), filename);
  source.copy(dest);

  const queue = await readQueue();
  queue.push({ id, tripId, userId, filename, caption, location });
  writeQueue(queue);

  // Try immediate upload
  processQueue();
}

export async function processQueue() {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  const queue = await readQueue();
  if (queue.length === 0) return;

  const remaining: QueuedPhoto[] = [];
  const queueDir = getQueueDir();

  for (const item of queue) {
    try {
      const file = new File(queueDir, item.filename);
      const uri = file.uri;
      await uploadPhoto(item.tripId, item.userId, uri, item.caption, item.location);
      // Clean up local copy
      if (file.exists) file.delete();
    } catch {
      remaining.push(item);
    }
  }

  writeQueue(remaining);
}

export async function getQueueLength(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}
