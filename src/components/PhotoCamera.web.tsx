import {
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface PhotoCameraRef {
  takePictureAsync: () => Promise<{ uri: string }>;
}

export interface PhotoCameraProps {
  onReady?: () => void;
  onError?: (message: string) => void;
}

export const PhotoCamera = forwardRef<PhotoCameraRef, PhotoCameraProps>((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let isCancelled = false;

    async function startCamera() {
      if (!navigator?.mediaDevices?.getUserMedia) {
        props.onError?.('El navegador no permite acceder a la cámara.');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' } },
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const video = videoRef.current;
        if (video) {
          video.muted = true;
          video.playsInline = true;
          video.srcObject = stream;
          await video.play();
          setReady(true);
          props.onReady?.();
        }
      } catch (err) {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : 'No se pudo iniciar la cámara web.';
          props.onError?.(message);
        }
      }
    }

    void startCamera();

    return () => {
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [props]);

  useImperativeHandle(ref, () => ({
    async takePictureAsync() {
      const video = videoRef.current;
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        throw new Error('La cámara web aún no está lista para capturar.');
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No se pudo crear el lienzo para capturar la imagen.');
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const uri = canvas.toDataURL('image/jpeg', 0.85);
      return { uri };
    },
  }));

  return (
    <View style={styles.frame}>
      {createElement('video', {
        ref: videoRef,
        autoPlay: true,
        muted: true,
        playsInline: true,
        style: styles.video,
      })}
      {!ready ? (
        <Text style={styles.hint}>Iniciando cámara web…</Text>
      ) : (
        <Text style={styles.hint}>Enfocá el desperfecto y tocá “Sacar foto”.</Text>
      )}
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
  video: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
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

