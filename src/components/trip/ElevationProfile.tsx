import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

interface Props {
  points: Array<{ altitude: number }>;
  width: number;
  height: number;
}

export default function ElevationProfile({ points, width, height }: Props) {
  if (points.length < 2) return null;

  const altitudes = points.map((p) => p.altitude);
  const minAlt = Math.min(...altitudes);
  const maxAlt = Math.max(...altitudes);
  const range = maxAlt - minAlt || 1;

  // Sample points to avoid too many segments
  const maxPoints = Math.min(points.length, 200);
  const step = Math.max(1, Math.floor(points.length / maxPoints));
  const sampled = points.filter((_, i) => i % step === 0);

  const barWidth = width / sampled.length;

  return (
    <View style={styles.container}>
      <View style={[styles.chart, { width, height }]}>
        {sampled.map((point, i) => {
          const normalizedHeight =
            ((point.altitude - minAlt) / range) * (height - 20) + 10;
          return (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  width: barWidth,
                  height: normalizedHeight,
                  left: i * barWidth,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.labels}>
        <Text style={styles.label}>{Math.round(minAlt)} moh.</Text>
        <Text style={styles.label}>{Math.round(maxAlt)} moh.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
