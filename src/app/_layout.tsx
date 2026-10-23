import '@/lib/polyfills';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AppProvider } from '@/context/AppContext';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (err) {
    console.warn('Notification handler not configured:', err);
  }
}

function AppRoutes() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="reporte/nuevo" />
        <Stack.Screen name="reporte/escanear" />
        <Stack.Screen name="reporte/foto" />
        <Stack.Screen name="reporte/ubicacion" />
        <Stack.Screen name="reporte/[id]" />
        <Stack.Screen name="avisos" />
        <Stack.Screen name="permisos/index" />
        <Stack.Screen name="permisos/[recurso]" />
        <Stack.Screen name="ajustes-app" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
