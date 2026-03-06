import {
  haversineDistance,
  totalDistance,
  elevationGain,
  elevationLoss,
} from '../utils/geoUtils';

describe('haversineDistance', () => {
  it('returns 0 for same point', () => {
    expect(haversineDistance(60, 10, 60, 10)).toBe(0);
  });

  it('calculates known distance Oslo to Bergen (~305 km)', () => {
    const distance = haversineDistance(59.9139, 10.7522, 60.3913, 5.3221);
    expect(distance).toBeGreaterThan(300_000);
    expect(distance).toBeLessThan(310_000);
  });

  it('calculates short distance correctly', () => {
    // ~111 meters for 0.001 degrees latitude at equator
    const distance = haversineDistance(0, 0, 0.001, 0);
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(120);
  });
});

describe('totalDistance', () => {
  it('returns 0 for empty array', () => {
    expect(totalDistance([])).toBe(0);
  });

  it('returns 0 for single point', () => {
    expect(totalDistance([{ latitude: 60, longitude: 10 }])).toBe(0);
  });

  it('sums segments correctly', () => {
    const points = [
      { latitude: 60.0, longitude: 10.0 },
      { latitude: 60.001, longitude: 10.0 },
      { latitude: 60.002, longitude: 10.0 },
    ];
    const total = totalDistance(points);
    const segment = haversineDistance(60.0, 10.0, 60.001, 10.0);
    expect(total).toBeCloseTo(segment * 2, 0);
  });
});

describe('elevationGain', () => {
  it('returns 0 for flat route', () => {
    const points = [{ altitude: 100 }, { altitude: 100 }, { altitude: 100 }];
    expect(elevationGain(points)).toBe(0);
  });

  it('returns 0 for downhill only', () => {
    const points = [{ altitude: 300 }, { altitude: 200 }, { altitude: 100 }];
    expect(elevationGain(points)).toBe(0);
  });

  it('sums only positive elevation changes', () => {
    const points = [
      { altitude: 100 },
      { altitude: 200 }, // +100
      { altitude: 150 }, // -50 (ignored)
      { altitude: 300 }, // +150
    ];
    expect(elevationGain(points)).toBe(250);
  });

  it('returns 0 for empty/single point', () => {
    expect(elevationGain([])).toBe(0);
    expect(elevationGain([{ altitude: 500 }])).toBe(0);
  });
});

describe('elevationLoss', () => {
  it('returns 0 for uphill only', () => {
    const points = [{ altitude: 100 }, { altitude: 200 }, { altitude: 300 }];
    expect(elevationLoss(points)).toBe(0);
  });

  it('sums only negative elevation changes', () => {
    const points = [
      { altitude: 300 },
      { altitude: 200 }, // -100
      { altitude: 250 }, // +50 (ignored)
      { altitude: 100 }, // -150
    ];
    expect(elevationLoss(points)).toBe(250);
  });
});
