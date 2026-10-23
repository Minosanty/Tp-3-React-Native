import { PermissionResource, PermissionState } from '@/hooks/usePermiso';
import { ActionButton, Card, InlineError, Loading } from '@/components/ui';
import { Text, View } from 'react-native';
import { colors } from '@/components/ui';

const resourceNames: Record<PermissionResource, string> = {
  camara: 'la cámara',
  ubicacion: 'tu ubicación',
  notificaciones: 'los avisos',
};

function statusLabel(permission: PermissionState['permission']) {
  if (!permission) return 'Todavía no consultado';
  if (permission.granted && permission.accessPrivileges === 'limited') return 'Concedido · acceso limitado';
  if (permission.granted) return 'Concedido';
  if (permission.status === 'undetermined') return 'Sin decidir';
  return permission.canAskAgain ? 'Denegado · se puede volver a pedir' : 'Bloqueado · requiere Ajustes';
}

export function PermissionPrompt({
  resource,
  permissionState,
  description,
  onGranted,
  onSettings,
}: {
  resource: PermissionResource;
  permissionState: PermissionState;
  description: string;
  onGranted: () => void;
  onSettings: () => void;
}) {
  const { permission, loading, error, request } = permissionState;
  const blocked = permission?.status === 'denied' && !permission.canAskAgain;
  const granted = permission?.granted === true;

  async function continuePermissionFlow() {
    if (blocked) {
      onSettings();
      return;
    }
    if (granted) {
      onGranted();
      return;
    }
    try {
      const result = await request();
      if (result.granted) onGranted();
    } catch {
      return;
    }
  }

  return (
    <Card>
      <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '700' }}>
        Antes de continuar
      </Text>
      <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
        {description}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Estado:</Text>
        <Text accessibilityLiveRegion="polite" style={{ color: colors.ink, fontSize: 13, fontWeight: '700' }}>
          {statusLabel(permission)}
        </Text>
      </View>
      {permission?.accessPrivileges === 'limited' ? (
        <Text style={{ color: colors.muted, fontSize: 13 }}>
          Se respeta el acceso parcial concedido por el sistema.
        </Text>
      ) : null}
      {error ? <InlineError>{error}</InlineError> : null}
      {loading && !permission ? (
        <Loading label="Consultando el permiso…" />
      ) : (
        <ActionButton
          disabled={loading}
          onPress={continuePermissionFlow}
          variant={blocked ? 'secondary' : 'primary'}
        >
          {loading
            ? 'Consultando…'
            : granted
              ? 'Continuar'
              : blocked
                ? `Abrir Ajustes para ${resourceNames[resource]}`
                : 'Continuar'}
        </ActionButton>
      )}
      {blocked ? (
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          El sistema ya no muestra el diálogo. Activá el permiso desde Ajustes y volvé a la app.
        </Text>
      ) : (
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          Podés cancelar o cambiar esta decisión después desde Ajustes del dispositivo.
        </Text>
      )}
    </Card>
  );
}
