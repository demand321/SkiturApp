import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapView = React.forwardRef(({ style, children, ...props }, ref) => (
  <View ref={ref} style={[styles.container, style]}>
    <Text style={styles.text}>Kart er ikke tilgjengelig på web</Text>
    {children}
  </View>
));

MapView.displayName = 'MapView';

const Marker = () => null;
const Polyline = () => null;
const Callout = () => null;
const Circle = () => null;
const Polygon = () => null;
const Overlay = () => null;

const PROVIDER_GOOGLE = 'google';
const PROVIDER_DEFAULT = null;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});

export default MapView;
export {
  Marker,
  Polyline,
  Callout,
  Circle,
  Polygon,
  Overlay,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
};
