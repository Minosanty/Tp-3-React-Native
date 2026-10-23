import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Text } from 'react-native';
import {
  ActionButton,
  Eyebrow,
  Field,
  Heading,
  InlineError,
  Screen,
  colors,
} from '@/components/ui';
import { useAppData } from '@/context/AppContext';
import { PermissionPrompt } from '@/components/PermissionPrompt';
import { QrCamera } from '@/components/QrCamera';
import { openSystemSettings, usePermiso } from '@/hooks/usePermiso';

export default function ScanClassroomScreen() {
  const router = useRouter();
  const permission = usePermiso('camara');
  const { draft, setDraft } = useAppData();
  const [manualCode, setManualCode] = useState(draft.aula);
  const [scanned, setScanned] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const complete = useCallback((code: string) => {
    const value = code.trim();
    if (!value) {
      Alert.alert('Código vacío', 'Escaneá un QR válido o escribí el aula.');
      return;
    }
    setScanned(true);
    setDraft({ aula: value });
    router.back();
  }, [router, setDraft]);

  const handleScan = useCallback((data: string) => {
    if (scanned) return;
    setScanned(true);
    complete(data);
  }, [complete, scanned]);

  const handleScannerError = useCallback((message: string) => {
    setScannerError(message);
  }, []);

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

  return (
    <Screen key={cameraEnabled ? 'camera-enabled' : 'camera-disabled'}>
      <Eyebrow>Nuevo reporte · aula</Eyebrow>
      <Heading subtitle="El QR solo se lee después de que elijas continuar. También podés escribir el aula.">
        Escanear el QR
      </Heading>

      {permission.permission?.granted && cameraEnabled ? (
        <QrCamera onScanned={handleScan} onError={handleScannerError} />
      ) : (
        <PermissionPrompt
          resource="camara"
          permissionState={permission}
          description="Usamos la cámara para leer el QR del aula. Al tocar Continuar, la cámara se abre aquí; no se graba audio ni video."
          onGranted={() => {
            setScannerError(null);
            setCameraEnabled(true);
          }}
          onSettings={() => {
            void openSettings();
          }}
        />
      )}

      {permission.error ? <InlineError>{permission.error}</InlineError> : null}
      {scannerError ? <InlineError>{scannerError}</InlineError> : null}

      <Field
        label="O escribí el aula"
        placeholder="Ej.: A-204"
        value={manualCode}
        onChangeText={setManualCode}
        autoCapitalize="characters"
      />
      <ActionButton onPress={() => complete(manualCode)}>Usar este código</ActionButton>
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
        Si denegás la cámara, el reporte se puede completar igual con el código escrito.
      </Text>
      <ActionButton onPress={() => router.back()} variant="quiet">Volver al formulario</ActionButton>
    </Screen>
  );
}
