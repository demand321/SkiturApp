import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export default function CaptureButton({ onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      style={[styles.outer, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.inner} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  disabled: {
    opacity: 0.4,
  },
});
