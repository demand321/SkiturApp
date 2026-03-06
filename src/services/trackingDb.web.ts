// Web stub — SQLite tracking DB is not available on web
export async function insertTrackPoint(_point: any) {}
export async function getUnsyncedPoints(_tripId: string, _limit = 100) {
  return [];
}
export async function markPointsSynced(_ids: number[]) {}
export async function getAllTripPoints(_tripId: string) {
  return [];
}
export async function clearSyncedPoints(_tripId: string) {}
