import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { enqueuePhoto } from '../../services/photoQueue';
import { getCurrentLocation } from '../../services/location';
import { usePhotos } from '../../hooks/usePhotos';
import PhotoGallery from '../../components/photos/PhotoGallery';
import PhotoViewer from '../../components/photos/PhotoViewer';
import Button from '../../components/common/Button';
import { Photo } from '../../types';
import { COLORS } from '../../constants';

interface Props {
  tripId: string;
}

export default function TripPhotosScreen({ tripId }: Props) {
  const user = useAuthStore((s) => s.user);
  const currentPosition = useLocationStore((s) => s.currentPosition);
  const { photos, loading } = usePhotos(tripId);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const getLocation = useCallback(async () => {
    if (currentPosition) {
      return currentPosition;
    }
    try {
      const loc = await getCurrentLocation();
      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        altitude: loc.coords.altitude ?? 0,
      };
    } catch {
      return { latitude: 0, longitude: 0, altitude: 0 };
    }
  }, [currentPosition]);

  const handleTakePhoto = useCallback(async () => {
    if (!user) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tillatelse', 'Vi trenger tilgang til kameraet for å ta bilder.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) return;

    const location = await getLocation();

    Alert.prompt?.(
      'Bildetekst',
      'Legg til en beskrivelse (valgfritt)',
      [
        { text: 'Hopp over', onPress: () => doUpload(result.assets[0].uri, '', location) },
        {
          text: 'Lagre',
          onPress: (caption?: string) => doUpload(result.assets[0].uri, caption ?? '', location),
        },
      ],
      'plain-text'
    ) ?? doUpload(result.assets[0].uri, '', location);
  }, [user, getLocation, tripId]);

  const handlePickPhoto = useCallback(async () => {
    if (!user) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tillatelse', 'Vi trenger tilgang til bildebiblioteket.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) return;

    const location = await getLocation();
    doUpload(result.assets[0].uri, '', location);
  }, [user, getLocation, tripId]);

  const doUpload = async (
    uri: string,
    caption: string,
    location: { latitude: number; longitude: number; altitude: number }
  ) => {
    if (!user) return;
    setUploading(true);
    try {
      await enqueuePhoto(tripId, user.uid, uri, caption, location);
    } catch (error: any) {
      Alert.alert('Feil', 'Kunne ikke lagre bildet: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PhotoGallery
        photos={photos}
        loading={loading}
        onPhotoPress={setSelectedPhoto}
      />

      <View style={styles.actions}>
        <View style={styles.btnRow}>
          <View style={styles.btnFlex}>
            <Button
              title="Ta bilde"
              onPress={handleTakePhoto}
              loading={uploading}
            />
          </View>
          <View style={styles.btnGap} />
          <View style={styles.btnFlex}>
            <Button
              title="Velg fra album"
              onPress={handlePickPhoto}
              variant="secondary"
              loading={uploading}
            />
          </View>
        </View>
      </View>

      <Modal visible={!!selectedPhoto} animationType="fade">
        {selectedPhoto && (
          <PhotoViewer
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  actions: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  btnRow: {
    flexDirection: 'row',
  },
  btnFlex: {
    flex: 1,
  },
  btnGap: {
    width: 12,
  },
});
