import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function ensureReportNotificationChannel() {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync('reportes', {
      name: 'Avisos de reportes',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  } catch (error) {
    console.warn('No se pudo configurar el canal de notificaciones:', error);
  }
}
