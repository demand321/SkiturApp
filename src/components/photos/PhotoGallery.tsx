import React from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Photo } from '../../types';
import { COLORS } from '../../constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const TILE_GAP = 2;
const TILE_SIZE = (SCREEN_WIDTH - TILE_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

interface Props {
  photos: Photo[];
  loading?: boolean;
  onPhotoPress: (photo: Photo) => void;
}

export default function PhotoGallery({ photos, loading, onPhotoPress }: Props) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Ingen bilder ennå</Text>
        <Text style={styles.emptyText}>
          Ta bilder under turen for å se dem her
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      numColumns={NUM_COLUMNS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.tile}
          onPress={() => onPhotoPress(item)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.thumbnailURL || item.imageURL }}
            style={styles.image}
          />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: TILE_GAP,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    margin: TILE_GAP / 2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
