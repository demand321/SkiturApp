import { useLocationStore } from '../stores/locationStore';
import { useSyncStore } from '../stores/syncStore';

describe('locationStore', () => {
  beforeEach(() => {
    useLocationStore.setState({
      isTracking: false,
      currentPosition: null,
      trackPoints: [],
    });
  });

  it('starts with default state', () => {
    const state = useLocationStore.getState();
    expect(state.isTracking).toBe(false);
    expect(state.currentPosition).toBeNull();
    expect(state.trackPoints).toEqual([]);
  });

  it('sets tracking state', () => {
    useLocationStore.getState().setTracking(true);
    expect(useLocationStore.getState().isTracking).toBe(true);
  });

  it('sets current position', () => {
    const pos = { latitude: 60, longitude: 10, altitude: 500 };
    useLocationStore.getState().setCurrentPosition(pos);
    expect(useLocationStore.getState().currentPosition).toEqual(pos);
  });

  it('adds track points', () => {
    const point = { latitude: 60, longitude: 10, altitude: 500, timestamp: 1000 };
    useLocationStore.getState().addTrackPoint(point);
    useLocationStore.getState().addTrackPoint({ ...point, timestamp: 2000 });
    expect(useLocationStore.getState().trackPoints).toHaveLength(2);
  });

  it('clears track points', () => {
    useLocationStore.getState().addTrackPoint({
      latitude: 60, longitude: 10, altitude: 500, timestamp: 1000,
    });
    useLocationStore.getState().clearTrackPoints();
    expect(useLocationStore.getState().trackPoints).toEqual([]);
  });
});

describe('syncStore', () => {
  beforeEach(() => {
    useSyncStore.setState({
      isOnline: true,
      pendingUploads: 0,
      pendingSyncPoints: 0,
    });
  });

  it('starts online with no pending items', () => {
    const state = useSyncStore.getState();
    expect(state.isOnline).toBe(true);
    expect(state.pendingUploads).toBe(0);
    expect(state.pendingSyncPoints).toBe(0);
  });

  it('tracks online/offline state', () => {
    useSyncStore.getState().setOnline(false);
    expect(useSyncStore.getState().isOnline).toBe(false);
    useSyncStore.getState().setOnline(true);
    expect(useSyncStore.getState().isOnline).toBe(true);
  });

  it('tracks pending uploads', () => {
    useSyncStore.getState().setPendingUploads(5);
    expect(useSyncStore.getState().pendingUploads).toBe(5);
  });

  it('tracks pending sync points', () => {
    useSyncStore.getState().setPendingSyncPoints(12);
    expect(useSyncStore.getState().pendingSyncPoints).toBe(12);
  });
});
