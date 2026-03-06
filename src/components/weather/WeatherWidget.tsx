import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useWeather, WeatherForecast } from '../../hooks/useWeather';
import { COLORS } from '../../constants';

interface Props {
  latitude: number;
  longitude: number;
  compact?: boolean;
}

const SYMBOL_EMOJI: Record<string, string> = {
  clearsky_day: '\u2600\ufe0f',
  clearsky_night: '\ud83c\udf19',
  fair_day: '\ud83c\udf24',
  fair_night: '\ud83c\udf19',
  partlycloudy_day: '\u26c5',
  partlycloudy_night: '\u2601\ufe0f',
  cloudy: '\u2601\ufe0f',
  rain: '\ud83c\udf27',
  lightrain: '\ud83c\udf26',
  heavyrain: '\ud83c\udf27',
  rainshowers_day: '\ud83c\udf26',
  rainshowers_night: '\ud83c\udf27',
  snow: '\u2744\ufe0f',
  lightsnow: '\u2744\ufe0f',
  heavysnow: '\ud83c\udf28',
  snowshowers_day: '\ud83c\udf28',
  snowshowers_night: '\ud83c\udf28',
  sleet: '\ud83c\udf28',
  fog: '\ud83c\udf2b',
  thunder: '\u26a1',
};

function symbolToEmoji(symbol: string): string {
  const base = symbol.replace(/_day|_night|_polartwilight/g, '');
  return SYMBOL_EMOJI[symbol] ?? SYMBOL_EMOJI[base] ?? '\u2601\ufe0f';
}

function windDescription(speed: number): string {
  if (speed < 1) return 'Stille';
  if (speed < 5) return 'Svak vind';
  if (speed < 11) return 'Moderat vind';
  if (speed < 17) return 'Frisk vind';
  if (speed < 25) return 'Sterk vind';
  return 'Storm';
}

export default function WeatherWidget({ latitude, longitude, compact }: Props) {
  const { forecast, loading, error } = useWeather(latitude, longitude);

  if (latitude === 0 && longitude === 0) return null;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (error || forecast.length === 0) return null;

  const current = forecast[0];

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactEmoji}>{symbolToEmoji(current.symbol)}</Text>
        <Text style={styles.compactTemp}>{Math.round(current.temperature)}°</Text>
        <Text style={styles.compactWind}>{Math.round(current.windSpeed)} m/s</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Vær</Text>
      <View style={styles.currentRow}>
        <Text style={styles.emoji}>{symbolToEmoji(current.symbol)}</Text>
        <View style={styles.currentInfo}>
          <Text style={styles.temp}>{Math.round(current.temperature)}°C</Text>
          <Text style={styles.detail}>
            {windDescription(current.windSpeed)} ({Math.round(current.windSpeed)} m/s)
          </Text>
          {current.precipitation > 0 && (
            <Text style={styles.detail}>
              Nedbør: {current.precipitation} mm/t
            </Text>
          )}
        </View>
      </View>

      {forecast.length > 1 && (
        <View style={styles.forecastRow}>
          {forecast.slice(1, 7).map((f, i) => (
            <View key={i} style={styles.forecastItem}>
              <Text style={styles.forecastEmoji}>{symbolToEmoji(f.symbol)}</Text>
              <Text style={styles.forecastTemp}>{Math.round(f.temperature)}°</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
    marginRight: 16,
  },
  currentInfo: {
    flex: 1,
  },
  temp: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  detail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  forecastItem: {
    alignItems: 'center',
  },
  forecastEmoji: {
    fontSize: 20,
  },
  forecastTemp: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactEmoji: {
    fontSize: 18,
  },
  compactTemp: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  compactWind: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
