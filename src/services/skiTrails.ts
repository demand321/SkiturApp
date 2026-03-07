// Fetch ski trails from Sporet.no (Skiforeningen) ArcGIS API
const SPORET_BASE =
  'https://maps.sporet.no/arcgis/rest/services/Markadatabase_v2/Sporet_Simple/MapServer/6/query';

export interface SkiTrail {
  id: number;
  coordinates: Array<[number, number]>; // [lng, lat]
  hasClassic: boolean;
  hasSkating: boolean;
  hasFloodlight: boolean;
  isScooterTrail: boolean;
  length: number;
  trailType: number;
}

// Haversine distance in meters
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Snap coordinate to a grid key for graph building (approx 10m resolution)
function snapKey(lat: number, lng: number): string {
  return `${(lat * 10000).toFixed(0)},${(lng * 10000).toFixed(0)}`;
}

interface GraphEdge {
  to: string;
  toLat: number;
  toLng: number;
  dist: number;
  trailId: number;
  coords: Array<[number, number]>; // [lng, lat] segment coordinates
}

export function findShortestRoute(
  trails: SkiTrail[],
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number }
): Array<[number, number]> | null {
  if (trails.length === 0) return null;

  // Build adjacency graph from trail endpoints and intermediate nodes
  const graph = new Map<string, GraphEdge[]>();

  function addEdge(fromKey: string, fromLat: number, fromLng: number, toKey: string, toLat: number, toLng: number, dist: number, trailId: number, coords: Array<[number, number]>) {
    if (!graph.has(fromKey)) graph.set(fromKey, []);
    graph.get(fromKey)!.push({ to: toKey, toLat, toLng, dist, trailId, coords });
  }

  for (const trail of trails) {
    if (trail.coordinates.length < 2) continue;
    const coords = trail.coordinates;

    // Add edges between consecutive points along the trail
    // Use endpoints as graph nodes, plus any junction points
    const startCoord = coords[0];
    const endCoord = coords[coords.length - 1];
    const startKey = snapKey(startCoord[1], startCoord[0]);
    const endKey = snapKey(endCoord[1], endCoord[0]);

    // Calculate total trail distance
    let totalDist = 0;
    for (let i = 1; i < coords.length; i++) {
      totalDist += haversine(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]);
    }

    // Bidirectional edge with full coordinates
    addEdge(startKey, startCoord[1], startCoord[0], endKey, endCoord[1], endCoord[0], totalDist, trail.id, coords);
    addEdge(endKey, endCoord[1], endCoord[0], startKey, startCoord[1], startCoord[0], totalDist, trail.id, [...coords].reverse());
  }

  // Find nearest graph nodes to start and end
  const allNodes = new Map<string, { lat: number; lng: number }>();
  for (const [key, edges] of graph) {
    // Extract lat/lng from key or first edge
    if (edges.length > 0) {
      const firstCoord = edges[0].coords[0];
      allNodes.set(key, { lat: firstCoord[1], lng: firstCoord[0] });
    }
  }
  // Also add "to" nodes
  for (const edges of graph.values()) {
    for (const e of edges) {
      if (!allNodes.has(e.to)) {
        allNodes.set(e.to, { lat: e.toLat, lng: e.toLng });
      }
    }
  }

  let nearestStart = '';
  let nearestStartDist = Infinity;
  let nearestEnd = '';
  let nearestEndDist = Infinity;

  for (const [key, { lat, lng }] of allNodes) {
    const dStart = haversine(start.latitude, start.longitude, lat, lng);
    const dEnd = haversine(end.latitude, end.longitude, lat, lng);
    if (dStart < nearestStartDist) { nearestStartDist = dStart; nearestStart = key; }
    if (dEnd < nearestEndDist) { nearestEndDist = dEnd; nearestEnd = key; }
  }

  if (!nearestStart || !nearestEnd || nearestStart === nearestEnd) return null;
  // Don't try to route if nearest points are more than 5km from start/end
  if (nearestStartDist > 5000 || nearestEndDist > 5000) return null;

  // Dijkstra's algorithm
  const dist = new Map<string, number>();
  const prev = new Map<string, { from: string; coords: Array<[number, number]> } | null>();
  const visited = new Set<string>();

  dist.set(nearestStart, 0);
  prev.set(nearestStart, null);

  // Simple priority queue using sorted array
  const queue: Array<{ key: string; d: number }> = [{ key: nearestStart, d: 0 }];

  while (queue.length > 0) {
    queue.sort((a, b) => a.d - b.d);
    const current = queue.shift()!;

    if (visited.has(current.key)) continue;
    visited.add(current.key);

    if (current.key === nearestEnd) break;

    const edges = graph.get(current.key) ?? [];
    for (const edge of edges) {
      if (visited.has(edge.to)) continue;
      const newDist = current.d + edge.dist;
      if (newDist < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, newDist);
        prev.set(edge.to, { from: current.key, coords: edge.coords });
        queue.push({ key: edge.to, d: newDist });
      }
    }
  }

  if (!prev.has(nearestEnd)) return null;

  // Reconstruct path
  const pathCoords: Array<[number, number]> = [];
  let node: string | undefined = nearestEnd;
  const segments: Array<Array<[number, number]>> = [];

  while (node && prev.get(node)) {
    const p: { from: string; coords: Array<[number, number]> } = prev.get(node)!;
    segments.unshift(p.coords);
    node = p.from;
  }

  for (const seg of segments) {
    for (const coord of seg) {
      pathCoords.push(coord);
    }
  }

  return pathCoords.length >= 2 ? pathCoords : null;
}

export async function fetchSkiTrailsBetween(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
  paddingKm = 3
): Promise<SkiTrail[]> {
  // Bounding box between start and end with padding
  const padDeg = paddingKm / 111;
  const bbox = {
    xmin: Math.min(start.longitude, end.longitude) - padDeg,
    ymin: Math.min(start.latitude, end.latitude) - padDeg,
    xmax: Math.max(start.longitude, end.longitude) + padDeg,
    ymax: Math.max(start.latitude, end.latitude) + padDeg,
  };

  const params = new URLSearchParams({
    where: '1=1',
    outFields: 'id,has_classic,has_skating,has_floodlight,is_scootertrail,trailtypesymbol,st_length(shape)',
    geometry: JSON.stringify(bbox),
    geometryType: 'esriGeometryEnvelope',
    spatialRel: 'esriSpatialRelIntersects',
    inSR: '4326',
    outSR: '4326',
    f: 'geojson',
    resultRecordCount: '500',
  });

  const url = `${SPORET_BASE}?${params}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.warn('Sporet.no API error:', response.status, response.statusText);
    return [];
  }

  const data = await response.json();
  if (!data.features) {
    console.warn('Sporet.no API: no features in response', data);
    return [];
  }
  console.log(`Sporet.no: loaded ${data.features.length} trails`);

  return data.features.map((f: any) => ({
    id: f.properties.id ?? f.id,
    coordinates:
      f.geometry.type === 'LineString'
        ? f.geometry.coordinates
        : f.geometry.type === 'MultiLineString'
          ? f.geometry.coordinates.flat()
          : [],
    hasClassic: f.properties.has_classic === 1,
    hasSkating: f.properties.has_skating === 1,
    hasFloodlight: f.properties.has_floodlight === 1,
    isScooterTrail: f.properties.is_scootertrail === 1,
    length: f.properties['st_length(shape)'] ?? 0,
    trailType: f.properties.trailtypesymbol ?? 0,
  }));
}
