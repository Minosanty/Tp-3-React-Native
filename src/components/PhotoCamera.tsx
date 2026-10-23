import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { CameraView } from 'expo-camera';
import { StyleSheet, Text, View } from 'react-native';

export interface PhotoCameraRef {
  takePictureAsync: () => Promise<{ uri: string }>;
}

export interface PhotoCameraProps {
  onReady?: () => void;
  onError?: (message: string) => void;
}

export const PhotoCamera = forwardRef<PhotoCameraRef, PhotoCameraProps>((props, ref) => {
  const cameraRef = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);

  useImperativeHandle(ref, () => ({
    async takePictureAsync() {
      if (!cameraRef.current) {
        throw new Error('La cámara no está inicializada.');
      }
      const result = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!result?.uri) {
        throw new Error('La cámara no devolvió una imagen.');
      }
      return { uri: result.uri };
    },
  }));

  return (
    <View style={styles.frame}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => {
          setReady(true);
          props.onReady?.();
        }}
        onMountError={({ message }) => {
          setReady(false);
          props.onError?.(message);
        }}
      />
      {!ready ? (
        <Text style={styles.hint}>Iniciando cámara…</Text>
      ) : null}
    </View>
  );
});

PhotoCamera.displayName = 'PhotoCamera';

const styles = StyleSheet.create({
  frame: {
    height: 330,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#15212c',
    position: 'relative',
  },
  camera: {
    height: '100%',
    width: '100%',
  },
  hint: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    left: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.66)',
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'center',
  },
});

