import { useRouter } from 'expo-router';
import { Alert, Switch, Text, View } from 'react-native';
import { ActionButton, Card, Eyebrow, Heading, Screen, colors } from '@/components/ui';
import { useAppData } from '@/context/AppContext';
import { usePermiso } from '@/hooks/usePermiso';

export default function AppSettingsScreen() {
  const router = useRouter();
  const { notificationsEnabled, setNotificationsEnabled } = useAppData();
  const permission = usePermiso('notificaciones');

  async function updatePreference(enabled: boolean) {
    if (enabled && !permission.permission?.granted) {
      router.push({
        pathname: '/permisos/[recurso]',
        params: { recurso: 'notificaciones', next: '/ajustes-app' },
      });
      return;
    }

    try {
      await setNotificationsEnabled(enabled);
    } catch (error) {
      Alert.alert('No se pudo guardar el ajuste', error instanceof Error ? error.message : 'Intentá nuevamente.');
    }
  }

  return (
    <Screen>
      <Eyebrow>Preferencias de la app</Eyebrow>
      <Heading subtitle="Los avisos se piden solo cuando activás esta opción.">
        Ajustes de avisos
      </Heading>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '800' }}>
              Avisarme cuando se resuelva mi reporte
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
              Se programa un aviso local al activar esta función. La bandeja de la app sigue disponible si lo denegás.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Avisarme cuando se resuelva mi reporte"
            value={notificationsEnabled}
            onValueChange={updatePreference}
            trackColor={{ false: '#cbd5dc', true: '#8bc4ad' }}
            thumbColor={notificationsEnabled ? colors.primary : '#ffffff'}
          />
        </View>
        {permission.permission?.status === 'denied' && !permission.permission.canAskAgain ? (
          <ActionButton
            onPress={() =>
              router.push({
                pathname: '/permisos/[recurso]',
                params: { recurso: 'notificaciones', next: '/ajustes-app' },
              })
            }
            variant="secondary"
          >
            Abrir explicación y Ajustes
          </ActionButton>
        ) : null}
      </Card>
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
        Si no habilitás notificaciones, podés consultar las novedades en la bandeja «Avisos» y seguir usando todas las demás funciones.
      </Text>
      <ActionButton onPress={() => router.back()} variant="quiet">Volver</ActionButton>
    </Screen>
  );
}
