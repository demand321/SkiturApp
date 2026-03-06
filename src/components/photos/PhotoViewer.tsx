import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Photo } from '../../types';
import { COLORS } from '../../constants';
import { formatDate, formatTime } from '../../utils/dateUtils';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  photo: Photo;
  onClose: () => void;
}

export default function PhotoViewer({ photo, onClose }: Props) {
  const takenAt = photo.takenAt?.toDate?.() ?? new Date();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>Lukk</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.content}
        maximumZoomScale={3}
        minimumZoomScale={1}
      >
        <Image
          source={{ uri: photo.imageURL }}
          style={styles.image}
          resizeMode="contain"
        />
      </ScrollView>

      <View style={styles.info}>
        {photo.caption ? (
          <Text style={styles.caption}>{photo.caption}</Text>
        ) : null}
        <Text style={styles.meta}>
          {formatDate(takenAt)} kl. {formatTime(takenAt)}
        </Text>
        <Text style={styles.meta}>
          {photo.location.latitude.toFixed(4)}, {photo.location.longitude.toFixed(4)}
          {photo.location.altitude > 0
            ? ` — ${Math.round(photo.location.altitude)} moh.`
            : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  info: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  caption: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  meta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },
});
