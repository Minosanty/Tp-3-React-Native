import { useState } from 'react';
import { CameraView } from 'expo-camera';
import { StyleSheet, Text, View } from 'react-native';

export function QrCamera({
  onScanned,
  onError,
}: {
  onScanned: (data: string) => void;
  onError: (message: string) => void;
}) {
  const [cameraReady, setCameraReady] = useState(false);

  return (
    <View style={styles.frame}>
      <CameraView
        style={styles.camera}
        facing="back"
        active
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onCameraReady={() => setCameraReady(true)}
        onBarcodeScanned={({ data }) => onScanned(data)}
        onMountError={({ message }) => {
          setCameraReady(false);
          onError(message);
        }}
      />
      {!cameraReady ? (
        <Text style={styles.hint}>Iniciando cámara…</Text>
      ) : (
        <Text style={styles.hint}>Apuntá la cámara al código QR del aula.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 330,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#15212c',
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
