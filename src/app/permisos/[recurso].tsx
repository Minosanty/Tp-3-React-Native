import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Text } from 'react-native';
import { ActionButton, Eyebrow, Heading, Screen } from '@/components/ui';
import { PermissionPrompt } from '@/components/PermissionPrompt';
import {
  openSystemSettings,
  PermissionResource,
  usePermiso,
} from '@/hooks/usePermiso';
import { useAppData } from '@/context/AppContext';

const descriptions: Record<PermissionResource, string> = {
  camara: 'La cámara se usa solo cuando elegís escanear el QR del aula o sacar una foto del desperfecto.',
  ubicacion: 'La ubicación se consulta mientras usás la app para señalar dónde está el problema. Si preferís, podés elegir el sector a mano.',
  notificaciones: 'Los avisos locales te informan cuando se resuelve un reporte. La app funciona aunque no los habilites.',
};

function isPermissionResource(value: string): value is PermissionResource {
  return value === 'camara' || value === 'ubicacion' || value === 'notificaciones';
}

export default function PermisoRecursoScreen() {
  const router = useRouter();
  const { recurso, next } = useLocalSearchParams<{ recurso: string; next?: string }>();
  const validResource =
    typeof recurso === 'string' && isPermissionResource(recurso) ? recurso : null;
  const state = usePermiso(validResource ?? 'camara');
  const { setNotificationsEnabled } = useAppData();

  async function openSettings() {
    try {
      await openSystemSettings();
    } catch (error) {
      Alert.alert('No se pudieron abrir los Ajustes', error instanceof Error ? error.message : 'Intentá nuevamente.');
    }
  }

  async function onGranted() {
    if (validResource === 'notificaciones' && next === '/ajustes-app') {
      try {
        await setNotificationsEnabled(true);
      } catch (error) {
        Alert.alert('No se pudo guardar la preferencia', error instanceof Error ? error.message : 'Intentá nuevamente.');
        return;
      }
    }

    if (
      next === '/reporte/escanear' ||
      next === '/reporte/foto' ||
      next === '/reporte/ubicacion' ||
      next === '/ajustes-app'
    ) {
      router.back();
    }
  }

  if (!validResource) {
    return (
      <Screen>
        <Eyebrow>Permisos</Eyebrow>
        <Heading>Recurso no disponible</Heading>
        <Text>Ese recurso no forma parte de esta app.</Text>
        <ActionButton onPress={() => router.replace('/permisos')}>Ver panel de permisos</ActionButton>
      </Screen>
    );
  }

  return (
    <Screen>
      <Eyebrow>Permiso · explicación previa</Eyebrow>
      <Heading subtitle="La decisión siempre queda en manos de la persona.">
        {validResource === 'camara' ? 'Escanear o fotografiar' : validResource === 'ubicacion' ? 'Marcar el lugar' : 'Recibir avisos'}
      </Heading>
      <PermissionPrompt
        resource={validResource}
        permissionState={state}
        description={descriptions[validResource]}
        onGranted={onGranted}
        onSettings={() => {
          void openSettings();
        }}
      />
    </Screen>
  );
}
