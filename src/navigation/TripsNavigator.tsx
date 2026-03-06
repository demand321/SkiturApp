import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TripsScreen from '../app/tabs/TripsScreen';
import CreateTripScreen from '../app/trip/CreateTripScreen';
import TripDetailScreen from '../app/trip/TripDetailScreen';
import TripChatScreen from '../app/trip/TripChatScreen';
import { COLORS } from '../constants';

export type TripsStackParamList = {
  TripsList: undefined;
  CreateTrip: undefined;
  TripDetail: { tripId: string };
  TripChat: { tripId: string };
};

const Stack = createNativeStackNavigator<TripsStackParamList>();

export default function TripsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { color: COLORS.text, fontWeight: '600' },
        headerTintColor: COLORS.primary,
      }}
    >
      <Stack.Screen name="TripsList" options={{ title: 'Turer' }}>
        {({ navigation }) => (
          <TripsScreen
            onCreateTrip={() => navigation.navigate('CreateTrip')}
            onSelectTrip={(tripId) => navigation.navigate('TripDetail', { tripId })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CreateTrip" options={{ title: 'Ny tur' }}>
        {({ navigation }) => (
          <CreateTripScreen
            onCreated={(tripId) => {
              navigation.replace('TripDetail', { tripId });
            }}
            onCancel={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TripDetail" options={{ title: 'Tur' }}>
        {({ navigation, route }) => (
          <TripDetailScreen
            tripId={(route.params as { tripId: string }).tripId}
            onBack={() => navigation.goBack()}
            onChat={(tripId) => navigation.navigate('TripChat', { tripId })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TripChat" options={{ title: 'Chat' }}>
        {({ route }) => (
          <TripChatScreen
            tripId={(route.params as { tripId: string }).tripId}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
