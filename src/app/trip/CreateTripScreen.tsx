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
  const [endLocationName, setEndLocationName] = useState('');
  const [startCoords, setStartCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [endCoords, setEndCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    if (!title.trim() || !locationName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Tittel og startsted er påkrevd');
      } else {
        Alert.alert('Feil', 'Tittel og startsted er påkrevd');
      }
      return;
    }

    setLoading(true);
    try {
      const parsedDate = date ? new Date(date) : new Date();
      const tripData: any = {
        title: title.trim(),
        description: description.trim(),
        createdBy: user.uid,
        status: 'planning',
        startDate: Timestamp.fromDate(parsedDate),
        endDate: null,
        location: {
          latitude: startCoords?.latitude ?? 0,
          longitude: startCoords?.longitude ?? 0,
          name: locationName.trim(),
        },
        participants: [user.uid],
        invitedEmails: [],
      };

      if (endCoords) {
        tripData.endLocation = {
          latitude: endCoords.latitude,
          longitude: endCoords.longitude,
          name: endLocationName.trim() || 'Sluttpunkt',
        };
      }

      const tripId = await createTrip(tripData);
      onCreated(tripId);
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(error.message);
      } else {
        Alert.alert('Feil', error.message);
      }
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

        <Text style={styles.sectionLabel}>Startpunkt</Text>
        <Input
          label="Stedsnavn"
          placeholder="F.eks. Besseggen parkering"
          value={locationName}
          onChangeText={setLocationName}
        />
        <TouchableOpacity
          style={styles.locationPickerBtn}
          onPress={() => setShowStartPicker(true)}
        >
          <View style={styles.pickerContent}>
            <View style={[styles.dot, { backgroundColor: '#2A9D8F' }]} />
            <Text style={styles.locationPickerText}>
              {startCoords
                ? `${startCoords.latitude.toFixed(4)}, ${startCoords.longitude.toFixed(4)}`
                : 'Velg startpunkt på kart'}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Sluttpunkt (valgfritt)</Text>
        <Input
          label="Stedsnavn"
          placeholder="F.eks. Memurubu"
          value={endLocationName}
          onChangeText={setEndLocationName}
        />
        <TouchableOpacity
          style={styles.locationPickerBtn}
          onPress={() => setShowEndPicker(true)}
        >
          <View style={styles.pickerContent}>
            <View style={[styles.dot, { backgroundColor: '#E63946' }]} />
            <Text style={styles.locationPickerText}>
              {endCoords
                ? `${endCoords.latitude.toFixed(4)}, ${endCoords.longitude.toFixed(4)}`
                : 'Velg sluttpunkt på kart'}
            </Text>
          </View>
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

      <Modal visible={showStartPicker} animationType="slide">
        <LocationPicker
          title="Velg startpunkt"
          initialLocation={startCoords ?? undefined}
          markerColor="#2A9D8F"
          onLocationSelected={(loc) => {
            setStartCoords(loc);
            setShowStartPicker(false);
          }}
          onCancel={() => setShowStartPicker(false)}
        />
      </Modal>

      <Modal visible={showEndPicker} animationType="slide">
        <LocationPicker
          title="Velg sluttpunkt"
          initialLocation={endCoords ?? startCoords ?? undefined}
          markerColor="#E63946"
          onLocationSelected={(loc) => {
            setEndCoords(loc);
            setShowEndPicker(false);
          }}
          onCancel={() => setShowEndPicker(false)}
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
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
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
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
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
