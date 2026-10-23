import { useRouter } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import {
  ActionButton,
  Card,
  Eyebrow,
  Heading,
  InlineError,
  Loading,
  Screen,
  colors,
} from '@/components/ui';
import { openSystemSettings, PermissionResource, usePermiso } from '@/hooks/usePermiso';

const resources: {
  id: PermissionResource;
  title: string;
  description: string;
}[] = [
  { id: 'camara', title: 'Cámara', description: 'QR del aula y fotos tomadas en el momento.' },
  { id: 'ubicacion', title: 'Ubicación', description: 'Solo mientras se usa la app; también se puede elegir el sector a mano.' },
  { id: 'notificaciones', title: 'Notificaciones', description: 'Avisos locales cuando se resuelve un reporte.' },
];

function PermissionRow({ resource }: { resource: (typeof resources)[number] }) {
  const router = useRouter();
  const state = usePermiso(resource.id);
  const value = state.permission;
  const label = state.loading && !value
    ? 'Consultando…'
    : value?.granted
      ? value.accessPrivileges === 'limited' ? 'Concedido · limitado' : 'Concedido'
      : value?.status === 'undetermined'
        ? 'Sin decidir'
        : value?.canAskAgain
          ? 'Denegado · se puede volver a pedir'
          : 'Bloqueado · requiere Ajustes';

  async function openSettings() {
    try {
      await openSystemSettings();
    } catch (error) {
      Alert.alert('No se pudieron abrir los Ajustes', error instanceof Error ? error.message : 'Intentá nuevamente.');
    }
  }

  return (
    <Card>
      <View style={{ gap: 5 }}>
        <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '800' }}>{resource.title}</Text>
        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>{resource.description}</Text>
        <Text accessibilityLiveRegion="polite" style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>
          {label}
        </Text>
      </View>
      {state.error ? <InlineError>{state.error}</InlineError> : null}
      {state.loading && !value ? <Loading label="Consultando el sistema…" /> : null}
      <View style={{ flexDirection: 'row', gap: 9 }}>
        {value?.status === 'denied' && !value.canAskAgain ? (
          <View style={{ flex: 1 }}>
            <ActionButton onPress={openSettings} variant="secondary">Abrir Ajustes</ActionButton>
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <ActionButton
            disabled={state.loading}
            onPress={() =>
              router.push({
                pathname: '/permisos/[recurso]',
                params: { recurso: resource.id },
              })
            }
            variant="quiet"
          >
            {value?.granted ? 'Ver detalle' : 'Explicar y continuar'}
          </ActionButton>
        </View>
      </View>
    </Card>
  );
}

export default function PermissionsScreen() {
  return (
    <Screen>
      <Eyebrow>Privacidad y control</Eyebrow>
      <Heading subtitle="La app vuelve a consultar el estado cuando regresás de Ajustes.">
        Panel de permisos
      </Heading>
      {resources.map((resource) => <PermissionRow key={resource.id} resource={resource} />)}
      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
        Denegar un permiso no bloquea la creación de reportes: hay alternativas manuales para el aula y el sector.
      </Text>
    </Screen>
  );
}
