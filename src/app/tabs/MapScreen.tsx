import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useTripStore } from '../../stores/tripStore';
import { useAuthStore } from '../../stores/authStore';
import { useRoutePoints, useParticipantPositions, useParticipantNames } from '../../hooks/useLocation';
import { startTracking, stopTracking } from '../../services/tracking';
import { getCurrentLocation } from '../../services/location';
import TripMap from '../../components/map/TripMap';
import TrackingControls from '../../components/map/TrackingControls';
import { COLORS } from '../../constants';

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const trips = useTripStore((s) => s.trips);
  const activeTrip = trips.find((t) => t.status === 'active');
  const [loading, setLoading] = useState(false);
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const tripId = activeTrip?.id ?? '';
  const routePoints = useRoutePoints(tripId);
  const participantPositions = useParticipantPositions(tripId);
  const participantNames = useParticipantNames(activeTrip?.participants ?? []);

  // Redirect to Home if no active trip (handles direct URL access on web)
  useEffect(() => {
    if (!activeTrip) {
      if (Platform.OS === 'web') {
        window.location.replace('/');
      } else {
        navigation.navigate('Home');
      }
    }
  }, [activeTrip, navigation]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
    })();
  }, []);

  const requestLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationGranted(status === 'granted');
    if (status !== 'granted') {
      if (Platform.OS === 'web') {
        window.alert('Du må gi tilgang til posisjon for å vise deltakere på kartet.');
      } else {
        Alert.alert(
          'Posisjon kreves',
          'Du må gi appen tilgang til posisjonen din for at andre deltakere kan se hvor du er. Gå til Innstillinger og aktiver posisjon for SkiturApp.',
        );
      }
    }
  }, []);

  useEffect(() => {
    if (locationGranted === false) {
      requestLocation();
    }
  }, [locationGranted, requestLocation]);

  // Always get user's current position
  useEffect(() => {
    let mounted = true;
    getCurrentLocation()
      .then((loc) => {
        if (mounted) {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleStart = useCallback(async () => {
    if (!activeTrip || !user) {
      if (Platform.OS === 'web') {
        window.alert('Ingen aktiv tur. Start en tur først fra Turer-fanen.');
      } else {
        Alert.alert('Ingen aktiv tur', 'Start en tur først fra Turer-fanen.');
      }
      return;
    }
    setLoading(true);
    try {
      await startTracking(activeTrip.id, user.uid);
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(error.message);
      } else {
        Alert.alert('Feil', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTrip, user]);

  const handleStop = useCallback(async () => {
    setLoading(true);
    try {
      await stopTracking();
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(error.message);
      } else {
        Alert.alert('Feil', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // If there's an active trip, show the trip map with tracking
  if (activeTrip) {
    const initialRegion = activeTrip.location.latitude !== 0
      ? {
          latitude: activeTrip.location.latitude,
          longitude: activeTrip.location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : userLocation
        ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        : undefined;

    return (
      <View style={styles.container}>
        <TripMap
          routePoints={routePoints}
          participantPositions={participantPositions}
          participantNames={participantNames}
          initialRegion={initialRegion}
          startLocation={activeTrip.location}
          endLocation={activeTrip.endLocation}
          showSkiTrails={true}
          showsUserLocation={locationGranted === true}
        />
        <View style={styles.tripBanner}>
          <Text style={styles.tripName}>{activeTrip.title}</Text>
          {participantPositions.size > 0 && (
            <Text style={styles.participantCount}>
              {participantPositions.size} deltaker{participantPositions.size !== 1 ? 'e' : ''} på kartet
            </Text>
          )}
        </View>
        <TrackingControls
          onStart={handleStart}
          onStop={handleStop}
          loading={loading}
        />
      </View>
    );
  }

  // No active trip — show map centered on user's current position
  const region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 59.91,
        longitude: 10.75,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
        mapType="terrain"
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            pinColor={COLORS.primary}
            title="Min posisjon"
          />
        )}
      </MapView>
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>Ingen aktiv tur — viser din posisjon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  tripBanner: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tripName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  participantCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  infoBanner: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
