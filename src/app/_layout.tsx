import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AppProvider } from '@/context/AppContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
