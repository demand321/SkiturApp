import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSyncStore } from '../../stores/syncStore';

export default function SyncStatusBar() {
  const { isOnline, pendingUploads, pendingSyncPoints } = useSyncStore();

  const hasPending = pendingUploads > 0 || pendingSyncPoints > 0;

  if (isOnline && !hasPending) return null;

  const message = !isOnline
    ? 'Frakoblet — data lagres lokalt'
    : `Synkroniserer... (${pendingUploads + pendingSyncPoints} ventende)`;

  return (
    <View style={[styles.container, !isOnline ? styles.offline : styles.syncing]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offline: {
    backgroundColor: '#EF4444',
  },
  syncing: {
    backgroundColor: '#F59E0B',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});
