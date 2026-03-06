import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../common/Button';
import { useLocationStore } from '../../stores/locationStore';
import { totalDistance, elevationGain } from '../../utils/geoUtils';
import { formatDuration } from '../../utils/dateUtils';
import { COLORS } from '../../constants';

interface Props {
  onStart: () => void;
  onStop: () => void;
  loading?: boolean;
}

export default function TrackingControls({ onStart, onStop, loading }: Props) {
  const { isTracking, trackPoints } = useLocationStore();

  const distance = totalDistance(trackPoints);
  const gain = elevationGain(trackPoints);
  const duration =
    trackPoints.length >= 2
      ? trackPoints[trackPoints.length - 1].timestamp - trackPoints[0].timestamp
      : 0;

  return (
    <View style={styles.container}>
      {isTracking && trackPoints.length > 0 && (
        <View style={styles.stats}>
          <StatItem label="Distanse" value={`${(distance / 1000).toFixed(1)} km`} />
          <StatItem label="Stigning" value={`${Math.round(gain)} m`} />
          <StatItem label="Tid" value={formatDuration(duration)} />
        </View>
      )}
      <View style={styles.buttonRow}>
        {isTracking ? (
          <Button title="Stopp sporing" onPress={onStop} variant="danger" loading={loading} />
        ) : (
          <Button title="Start sporing" onPress={onStart} loading={loading} />
        )}
      </View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
  },
});
