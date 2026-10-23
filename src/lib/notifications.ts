import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function ensureReportNotificationChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('reportes', {
    name: 'Avisos de reportes',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}
