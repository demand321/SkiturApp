import * as SQLite from 'expo-sqlite';

const DB_NAME = 'skitur_tracking.db';

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS track_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL NOT NULL,
        speed REAL NOT NULL,
        accuracy REAL NOT NULL,
        timestamp INTEGER NOT NULL,
        synced INTEGER DEFAULT 0
      );
    `);
  }
  return db;
}

export async function insertTrackPoint(point: {
  tripId: string;
  userId: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  accuracy: number;
  timestamp: number;
}) {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO track_points (trip_id, user_id, latitude, longitude, altitude, speed, accuracy, timestamp, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    point.tripId,
    point.userId,
    point.latitude,
    point.longitude,
    point.altitude,
    point.speed,
    point.accuracy,
    point.timestamp
  );
}

export async function getUnsyncedPoints(tripId: string, limit = 100) {
  const database = await getDb();
  return database.getAllAsync<{
    id: number;
    trip_id: string;
    user_id: string;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    accuracy: number;
    timestamp: number;
  }>(
    `SELECT * FROM track_points WHERE trip_id = ? AND synced = 0 ORDER BY timestamp ASC LIMIT ?`,
    tripId,
    limit
  );
}

export async function markPointsSynced(ids: number[]) {
  if (ids.length === 0) return;
  const database = await getDb();
  const placeholders = ids.map(() => '?').join(',');
  await database.runAsync(
    `UPDATE track_points SET synced = 1 WHERE id IN (${placeholders})`,
    ...ids
  );
}

export async function getAllTripPoints(tripId: string) {
  const database = await getDb();
  return database.getAllAsync<{
    id: number;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    timestamp: number;
  }>(
    `SELECT id, latitude, longitude, altitude, speed, timestamp FROM track_points WHERE trip_id = ? ORDER BY timestamp ASC`,
    tripId
  );
}

export async function clearSyncedPoints(tripId: string) {
  const database = await getDb();
  await database.runAsync(
    `DELETE FROM track_points WHERE trip_id = ? AND synced = 1`,
    tripId
  );
}
