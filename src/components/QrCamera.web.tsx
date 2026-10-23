import jsQR from 'jsqr';
import { createElement, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function QrCamera({
  onScanned,
  onError,
}: {
  onScanned: (data: string) => void;
  onError: (message: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let timer: number | undefined;
    let stopped = false;
    let hasScanned = false;

    async function startScanner() {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('El navegador no permite usar la cámara en este contexto.');
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d', { willReadFrequently: true });
      if (!video || !canvas || !context) {
        throw new Error('No se pudo preparar el lector QR en este navegador.');
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      if (stopped) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await video.play();

      const scan = async () => {
        if (stopped || hasScanned) return;
        try {
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
            const scale = Math.min(1, 640 / video.videoWidth);
            canvas.width = Math.round(video.videoWidth * scale);
            canvas.height = Math.round(video.videoHeight * scale);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = context.getImageData(0, 0, canvas.width, canvas.height);
            const result = jsQR(image.data, image.width, image.height, {
              inversionAttempts: 'dontInvert',
            });
            if (result?.data) {
              hasScanned = true;
              onScanned(result.data);
              return;
            }
          }
          timer = window.setTimeout(() => void scan(), 200);
        } catch (error) {
          onError(error instanceof Error ? error.message : 'No se pudo leer el código QR.');
        }
      };

      void scan();
    }

    void startScanner().catch((error: unknown) => {
      onError(error instanceof Error ? error.message : 'No se pudo iniciar el escáner.');
    });

    return () => {
      stopped = true;
      if (timer !== undefined) window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [onError, onScanned]);

  return (
    <View style={styles.frame}>
      {createElement('video', {
        ref: videoRef,
        autoPlay: true,
        muted: true,
        playsInline: true,
        style: styles.video,
      })}
      {createElement('canvas', {
        ref: canvasRef,
        style: styles.hiddenCanvas,
      })}
      <Text style={styles.hint}>Apuntá la cámara al código QR del aula.</Text>
    </View>
  );
}

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
  hiddenCanvas: {
    display: 'none',
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
