import { CameraView } from 'expo-camera';
import { StyleSheet, View } from 'react-native';

export function QrCamera({
  onScanned,
  onError,
}: {
  onScanned: (data: string) => void;
  onError: (message: string) => void;
}) {
  return (
    <View style={styles.frame}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => onScanned(data)}
        onMountError={({ message }) => onError(message)}
      />
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
});
