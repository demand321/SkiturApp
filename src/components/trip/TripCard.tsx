import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trip } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { COLORS } from '../../constants';

interface Props {
  trip: Trip;
  onPress: () => void;
}

const STATUS_LABELS: Record<Trip['status'], string> = {
  planning: 'Planlegges',
  active: 'Aktiv',
  completed: 'Fullført',
};

const STATUS_COLORS: Record<Trip['status'], string> = {
  planning: COLORS.warning,
  active: COLORS.success,
  completed: COLORS.textSecondary,
};

export default function TripCard({ trip, onPress }: Props) {
  const date = trip.startDate?.toDate?.() ?? new Date();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {trip.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[trip.status] }]}>
          <Text style={styles.badgeText}>{STATUS_LABELS[trip.status]}</Text>
        </View>
      </View>
      <Text style={styles.location} numberOfLines={1}>
        {trip.location.name}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(date)}</Text>
        <Text style={styles.participants}>
          {trip.participants.length} deltaker{trip.participants.length !== 1 ? 'e' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  participants: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
