import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import {
  ActionButton,
  Card,
  Eyebrow,
  Heading,
  InlineError,
  Screen,
  colors,
} from '@/components/ui';
import { PermissionPrompt } from '@/components/PermissionPrompt';
import { QrCamera } from '@/components/QrCamera';
import { PhotoCamera, PhotoCameraRef } from '@/components/PhotoCamera';
import {
  openSystemSettings,
  PermissionResource,
  usePermiso,
} from '@/hooks/usePermiso';
import { useAppData } from '@/context/AppContext';

const descriptions: Record<PermissionResource, string> = {
  camara:
    'La cámara se usa solo cuando elegís escanear el QR del aula o sacar una foto del desperfecto.',
  ubicacion:
    'La ubicación se consulta mientras usás la app para señalar dónde está el problema. Si preferís, podés elegir el sector a mano.',
  notificaciones:
    'Los avisos locales te informan cuando se resuelve un reporte. La app funciona aunque no los habilites.',
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
  const { setNotificationsEnabled, setDraft } = useAppData();

  // Estados de la cámara integrada dentro de la pantalla
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState<'qr' | 'foto'>(
    next === '/reporte/foto' ? 'foto' : 'qr',
  );
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  const photoCameraRef = useRef<PhotoCameraRef>(null);

  async function openSettings() {
    try {
      await openSystemSettings();
    } catch (error) {
      Alert.alert(
        'No se pudieron abrir los Ajustes',
        error instanceof Error ? error.message : 'Intentá nuevamente.',
      );
    }
  }

  async function onGranted() {
    if (validResource === 'notificaciones') {
      if (next === '/ajustes-app') {
        try {
          await setNotificationsEnabled(true);
        } catch (error) {
          Alert.alert(
            'No se pudo guardar la preferencia',
            error instanceof Error ? error.message : 'Intentá nuevamente.',
          );
          return;
        }
      }
      if (next === '/ajustes-app') {
        router.back();
        return;
      }
    }

    if (validResource === 'ubicacion' && next === '/reporte/ubicacion') {
      router.back();
      return;
    }

    // Al conceder el permiso de cámara y tocar Continuar, abrimos la cámara aquí mismo (en la web y móvil)
    if (validResource === 'camara') {
      setCameraError(null);
      setCameraActive(true);
    }
  }

  function handleQrScanned(data: string) {
    const code = data.trim();
    if (!code) return;
    setScannedCode(code);
    setDraft({ aula: code });
  }

  async function handleTakePhoto() {
    if (!photoCameraRef.current) {
      setCameraError('La cámara no está lista.');
      return;
    }
    setIsTakingPhoto(true);
    setCameraError(null);
    try {
      const result = await photoCameraRef.current.takePictureAsync();
      setCapturedPhoto(result.uri);
      setDraft({ imageUri: result.uri });
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : 'No se pudo sacar la foto.');
    } finally {
      setIsTakingPhoto(false);
    }
  }

  function handleUseInReport() {
    if (next) {
      router.back();
    } else {
      router.push('/reporte/nuevo');
    }
  }

  if (!validResource) {
    return (
      <Screen>
        <Eyebrow>Permisos</Eyebrow>
        <Heading>Recurso no disponible</Heading>
        <Text>Ese recurso no forma parte de esta app.</Text>
        <ActionButton onPress={() => router.replace('/permisos')}>
          Ver panel de permisos
        </ActionButton>
      </Screen>
    );
  }

  return (
    <Screen>
      <Eyebrow>Permiso · explicación previa</Eyebrow>
      <Heading subtitle="La decisión siempre queda en manos de la persona.">
        {validResource === 'camara'
          ? 'Escanear o fotografiar'
          : validResource === 'ubicacion'
            ? 'Marcar el lugar'
            : 'Recibir avisos'}
      </Heading>

      {/* Si es cámara y se activó con el botón Continuar, mostramos la cámara activa */}
      {validResource === 'camara' && cameraActive ? (
        <Card>
          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '700' }}>
                Cámara activa
              </Text>
              <Pressable
                onPress={() => setCameraActive(false)}
                accessibilityRole="button"
                style={{ padding: 4 }}
              >
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>
                  Cerrar cámara
                </Text>
              </Pressable>
            </View>

            {/* Selector de modo: Escanear QR vs Sacar foto */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => {
                  setCameraMode('qr');
                  setScannedCode(null);
                  setCameraError(null);
                }}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor:
                    cameraMode === 'qr' ? colors.primaryLight : colors.background,
                  borderWidth: 1,
                  borderColor:
                    cameraMode === 'qr' ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color: cameraMode === 'qr' ? colors.primary : colors.ink,
                    fontWeight: '700',
                    fontSize: 13,
                  }}
                >
                  Escanear QR
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setCameraMode('foto');
                  setCapturedPhoto(null);
                  setCameraError(null);
                }}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor:
                    cameraMode === 'foto' ? colors.primaryLight : colors.background,
                  borderWidth: 1,
                  borderColor:
                    cameraMode === 'foto' ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color: cameraMode === 'foto' ? colors.primary : colors.ink,
                    fontWeight: '700',
                    fontSize: 13,
                  }}
                >
                  Sacar foto
                </Text>
              </Pressable>
            </View>

            {/* Modo 1: Escanear QR */}
            {cameraMode === 'qr' ? (
              <View style={{ gap: 12 }}>
                <QrCamera
                  onScanned={handleQrScanned}
                  onError={(err) => setCameraError(err)}
                />

                {scannedCode ? (
                  <View
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor: '#e6f7ef',
                      borderWidth: 1,
                      borderColor: '#20744d',
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{ color: '#20744d', fontWeight: '800', fontSize: 14 }}
                    >
                      ✓ QR detectado con éxito
                    </Text>
                    <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '700' }}>
                      Aula / Código: {scannedCode}
                    </Text>
                    <ActionButton onPress={handleUseInReport}>
                      Usar este código en el reporte
                    </ActionButton>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Modo 2: Sacar foto */}
            {cameraMode === 'foto' ? (
              <View style={{ gap: 12 }}>
                {!capturedPhoto ? (
                  <>
                    <PhotoCamera
                      ref={photoCameraRef}
                      onError={(err) => setCameraError(err)}
                    />
                    <ActionButton
                      onPress={handleTakePhoto}
                      disabled={isTakingPhoto}
                    >
                      {isTakingPhoto ? 'Capturando…' : 'Sacar foto'}
                    </ActionButton>
                  </>
                ) : (
                  <View style={{ gap: 12 }}>
                    <Text
                      style={{ color: '#20744d', fontWeight: '800', fontSize: 14 }}
                    >
                      ✓ Foto capturada con éxito
                    </Text>
                    <Image
                      source={{ uri: capturedPhoto }}
                      accessibilityLabel="Vista previa de la foto tomada"
                      style={{
                        width: '100%',
                        height: 250,
                        borderRadius: 12,
                        backgroundColor: colors.background,
                      }}
                      resizeMode="cover"
                    />
                    <ActionButton onPress={handleUseInReport}>
                      Usar esta foto en el reporte
                    </ActionButton>
                    <ActionButton
                      onPress={() => setCapturedPhoto(null)}
                      variant="secondary"
                    >
                      Sacar otra foto
                    </ActionButton>
                  </View>
                )}
              </View>
            ) : null}

            {cameraError ? <InlineError>{cameraError}</InlineError> : null}
          </View>
        </Card>
      ) : (
        <PermissionPrompt
          resource={validResource}
          permissionState={state}
          description={descriptions[validResource]}
          onGranted={onGranted}
          onSettings={() => {
            void openSettings();
          }}
        />
      )}

      {next ? (
        <ActionButton
          onPress={() => router.back()}
          variant="quiet"
        >
          Volver
        </ActionButton>
      ) : (
        <ActionButton
          onPress={() => router.replace('/permisos')}
          variant="quiet"
        >
          Volver al panel de permisos
        </ActionButton>
      )}
    </Screen>
  );
}
