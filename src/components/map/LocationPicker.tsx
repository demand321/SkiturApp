import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { COLORS } from '../../constants';

interface Props {
  initialLocation?: { latitude: number; longitude: number };
  onLocationSelected: (location: { latitude: number; longitude: number }) => void;
  onCancel: () => void;
}

export default function LocationPicker({
  initialLocation,
  onLocationSelected,
  onCancel,
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
        <Text style={styles.title}>Velg startsted</Text>
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
            pinColor={COLORS.primary}
          />
        )}
      </MapView>
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
