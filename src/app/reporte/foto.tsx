import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import {
  ActionButton,
  Card,
  Eyebrow,
  Heading,
  InlineError,
  Screen,
  colors,
} from '@/components/ui';
import { useAppData } from '@/context/AppContext';
import { usePermiso } from '@/hooks/usePermiso';
import { PhotoCamera, PhotoCameraRef } from '@/components/PhotoCamera';

export default function ReportPhotoScreen() {
  const router = useRouter();
  const camera = useRef<PhotoCameraRef>(null);
  const permission = usePermiso('camara');
  const { setDraft } = useAppData();
  const [busy, setBusy] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  async function chooseFromLibrary() {
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (result.canceled) return;
      const uri = result.assets[0]?.uri;
      if (!uri) throw new Error('El selector no devolvió una foto válida.');
      setDraft({ imageUri: uri });
      router.back();
    } catch (error) {
      Alert.alert(
        'No se pudo seleccionar la foto',
        error instanceof Error ? error.message : 'Intentá nuevamente.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function takePhoto() {
    if (!camera.current) {
      Alert.alert(
        'Cámara no disponible',
        'Probá nuevamente o elegí una foto de la galería.',
      );
      return;
    }
    setBusy(true);
    setCameraError(null);
    try {
      const result = await camera.current.takePictureAsync();
      if (!result?.uri) throw new Error('La cámara no devolvió una imagen.');
      setDraft({ imageUri: result.uri });
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Intentá nuevamente.';
      setCameraError(message);
      Alert.alert('No se pudo sacar la foto', message);
    } finally {
      setBusy(false);
    }
  }

  function requestCamera() {
    router.push({
      pathname: '/permisos/[recurso]',
      params: { recurso: 'camara', next: '/reporte/foto' },
    });
  }

  return (
    <Screen>
      <Eyebrow>Nuevo reporte · evidencia</Eyebrow>
      <Heading subtitle="Elegí una imagen existente o sacá una foto ahora. La galería se abre con el selector del sistema, sin pedir acceso general a tus fotos.">
        Adjuntar una foto
      </Heading>

      <ActionButton onPress={chooseFromLibrary} disabled={busy}>
        Elegir de la galería
      </ActionButton>

      {permission.permission?.granted ? (
        <View style={{ gap: 8 }}>
          <PhotoCamera ref={camera} onError={setCameraError} />
        </View>
      ) : (
        <Card>
          <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '700' }}>
            Elegir una foto no requiere permiso
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
            Solo se pedirá acceso a la cámara si elegís sacar una foto ahora.
          </Text>
        </Card>
      )}

      {permission.error ? <InlineError>{permission.error}</InlineError> : null}
      {cameraError ? <InlineError>{cameraError}</InlineError> : null}

      {!permission.permission?.granted ? (
        <ActionButton onPress={requestCamera} variant="secondary">
          Explicar y continuar con la cámara
        </ActionButton>
      ) : (
        <ActionButton onPress={takePhoto} disabled={busy}>
          {busy ? 'Guardando foto…' : 'Sacar foto'}
        </ActionButton>
      )}

      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
        La elección o captura es opcional; podés enviar el reporte sin foto.
      </Text>
      <ActionButton onPress={() => router.back()} variant="quiet">
        Volver al formulario
      </ActionButton>
    </Screen>
  );
}
