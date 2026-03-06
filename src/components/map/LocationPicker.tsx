import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { COLORS } from '../../constants';

interface Props {
  title?: string;
  initialLocation?: { latitude: number; longitude: number };
  onLocationSelected: (location: { latitude: number; longitude: number }) => void;
  onCancel: () => void;
  markerColor?: string;
}

export default function LocationPicker({
  title = 'Velg posisjon',
  initialLocation,
  onLocationSelected,
  onCancel,
  markerColor = COLORS.primary,
}: Props) {
  const [selected, setSelected] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation ?? null);

  const handleMapPress = useCallback((e: MapPressEvent) => {
    setSelected(e.nativeEvent.coordinate);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selected) {
      onLocationSelected(selected);
    }
  }, [selected, onLocationSelected]);

  const defaultRegion = initialLocation
    ? {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        latitude: 61.5,
        longitude: 8.5,
        latitudeDelta: 5,
        longitudeDelta: 5,
      };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Trykk på kartet for å velge posisjon</Text>
      </View>
      <MapView
        style={styles.map}
        initialRegion={defaultRegion}
        onPress={handleMapPress}
        mapType="terrain"
        showsUserLocation
        showsMyLocationButton
      >
        {selected && (
          <Marker
            coordinate={selected}
            pinColor={markerColor}
          />
        )}
      </MapView>
      {selected && (
        <View style={styles.coordInfo}>
          <Text style={styles.coordText}>
            {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
          </Text>
        </View>
      )}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Avbryt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, !selected && styles.disabled]}
          onPress={handleConfirm}
          disabled={!selected}
        >
          <Text style={styles.confirmText}>Bekreft</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  map: {
    flex: 1,
  },
  coordInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  coordText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.surface,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabled: {
    opacity: 0.5,
  },
});
