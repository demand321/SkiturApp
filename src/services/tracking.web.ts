// Web stub — GPS tracking is not available on web
export const BACKGROUND_LOCATION_TASK = 'skitur-background-location';

export async function startTracking(_tripId: string, _userId: string) {
  console.warn('GPS tracking is not available on web');
}

export async function stopTracking() {}

export async function resumeTrackingIfNeeded() {}
