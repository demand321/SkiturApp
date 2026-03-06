import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Timestamp } from 'firebase/firestore';
import { useAuthStore } from '../../stores/authStore';
import { createTrip } from '../../services/trips';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LocationPicker from '../../components/map/LocationPicker';
import { COLORS } from '../../constants';

interface Props {
  onCreated: (tripId: string) => void;
  onCancel: () => void;
}

export default function CreateTripScreen({ onCreated, onCancel }: Props) {
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    if (!title.trim() || !locationName.trim()) {
      Alert.alert('Feil', 'Tittel og sted er påkrevd');
      return;
    }

    setLoading(true);
    try {
      const parsedDate = date ? new Date(date) : new Date();
      const tripId = await createTrip({
        title: title.trim(),
        description: description.trim(),
        createdBy: user.uid,
        status: 'planning',
        startDate: Timestamp.fromDate(parsedDate),
        endDate: null,
        location: {
          latitude: locationCoords?.latitude ?? 0,
          longitude: locationCoords?.longitude ?? 0,
          name: locationName.trim(),
        },
        participants: [user.uid],
        invitedEmails: [],
      });
      onCreated(tripId);
    } catch (error: any) {
      Alert.alert('Feil', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Ny tur</Text>

        <Input
          label="Tittel"
          placeholder="F.eks. Påsketur Jotunheimen"
          value={title}
          onChangeText={setTitle}
        />
        <Input
          label="Beskrivelse"
          placeholder="Kort beskrivelse av turen"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
        <Input
          label="Sted"
          placeholder="F.eks. Besseggen"
          value={locationName}
          onChangeText={setLocationName}
        />

        <TouchableOpacity
          style={styles.locationPickerBtn}
          onPress={() => setShowLocationPicker(true)}
        >
          <Text style={styles.locationPickerText}>
            {locationCoords
              ? `Posisjon valgt (${locationCoords.latitude.toFixed(4)}, ${locationCoords.longitude.toFixed(4)})`
              : 'Velg posisjon på kart'}
          </Text>
        </TouchableOpacity>

        <Input
          label="Dato (YYYY-MM-DD)"
          placeholder="2026-04-01"
          value={date}
          onChangeText={setDate}
        />

        <View style={styles.buttons}>
          <Button title="Opprett tur" onPress={handleCreate} loading={loading} />
          <View style={styles.spacer} />
          <Button title="Avbryt" onPress={onCancel} variant="secondary" />
        </View>
      </ScrollView>

      <Modal visible={showLocationPicker} animationType="slide">
        <LocationPicker
          initialLocation={locationCoords ?? undefined}
          onLocationSelected={(loc) => {
            setLocationCoords(loc);
            setShowLocationPicker(false);
          }}
          onCancel={() => setShowLocationPicker(false)}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  locationPickerBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: 16,
  },
  locationPickerText: {
    fontSize: 15,
    color: COLORS.primary,
  },
  buttons: {
    marginTop: 8,
  },
  spacer: {
    height: 12,
  },
});
