import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { ensureReportNotificationChannel } from '@/lib/notifications';

export type PermissionResource = 'camara' | 'ubicacion' | 'notificaciones';

export type PermissionSnapshot = {
  status: string;
  granted: boolean;
  canAskAgain: boolean;
  accessPrivileges?: string;
};

type RawPermission = {
  status: string;
  granted: boolean;
  canAskAgain: boolean;
  accessPrivileges?: string;
};

export type PermissionState = {
  permission: PermissionSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<PermissionSnapshot>;
  request: () => Promise<PermissionSnapshot>;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo consultar el permiso.';
}

async function getPermission(resource: PermissionResource): Promise<RawPermission> {
  switch (resource) {
    case 'camara': {
      if (Platform.OS === 'web') {
        if (typeof navigator === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
          return { status: 'denied', granted: false, canAskAgain: false };
        }
        if (navigator?.permissions?.query) {
          try {
            const res = await navigator.permissions.query({ name: 'camera' as any });
            return {
              status: res.state === 'prompt' ? 'undetermined' : res.state,
              granted: res.state === 'granted',
              canAskAgain: res.state !== 'denied',
            };
          } catch {
            // Some browsers don't support permissions.query for camera
          }
        }
        try {
          return await Camera.getCameraPermissionsAsync();
        } catch {
          return { status: 'undetermined', granted: false, canAskAgain: true };
        }
      }
      return Camera.getCameraPermissionsAsync();
    }
    case 'ubicacion': {
      if (Platform.OS === 'web') {
        if (typeof navigator === 'undefined' || !navigator?.geolocation) {
          return { status: 'denied', granted: false, canAskAgain: false };
        }
        if (navigator?.permissions?.query) {
          try {
            const res = await navigator.permissions.query({ name: 'geolocation' as any });
            return {
              status: res.state === 'prompt' ? 'undetermined' : res.state,
              granted: res.state === 'granted',
              canAskAgain: res.state !== 'denied',
            };
          } catch {
            // Ignore
          }
        }
        try {
          return await Location.getForegroundPermissionsAsync();
        } catch {
          return { status: 'undetermined', granted: false, canAskAgain: true };
        }
      }
      return Location.getForegroundPermissionsAsync();
    }
    case 'notificaciones': {
      if (Platform.OS === 'web') {
        if (typeof Notification === 'undefined') {
          return { status: 'denied', granted: false, canAskAgain: false };
        }
        const perm = Notification.permission;
        return {
          status: perm === 'default' ? 'undetermined' : perm,
          granted: perm === 'granted',
          canAskAgain: perm !== 'denied',
        };
      }
      return Notifications.getPermissionsAsync();
    }
  }
}

async function requestPermission(resource: PermissionResource): Promise<RawPermission> {
  switch (resource) {
    case 'camara': {
      if (Platform.OS === 'web') {
        if (typeof navigator === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
          return { status: 'denied', granted: false, canAskAgain: false };
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track) => track.stop());
          return { status: 'granted', granted: true, canAskAgain: true };
        } catch (err: any) {
          const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
          return {
            status: isDenied ? 'denied' : 'undetermined',
            granted: false,
            canAskAgain: !isDenied,
          };
        }
      }
      return Camera.requestCameraPermissionsAsync();
    }
    case 'ubicacion': {
      if (Platform.OS === 'web') {
        return new Promise((resolve) => {
          if (typeof navigator === 'undefined' || !navigator?.geolocation) {
            resolve({ status: 'denied', granted: false, canAskAgain: false });
            return;
          }
          navigator.geolocation.getCurrentPosition(
            () => resolve({ status: 'granted', granted: true, canAskAgain: true }),
            (err) =>
              resolve({
                status: err.code === 1 ? 'denied' : 'undetermined',
                granted: false,
                canAskAgain: err.code !== 1,
              }),
            { timeout: 10000 },
          );
        });
      }
      return Location.requestForegroundPermissionsAsync();
    }
    case 'notificaciones': {
      if (Platform.OS === 'web') {
        if (typeof Notification === 'undefined') {
          return { status: 'denied', granted: false, canAskAgain: false };
        }
        try {
          const res = await Notification.requestPermission();
          return {
            status: res === 'default' ? 'undetermined' : res,
            granted: res === 'granted',
            canAskAgain: res !== 'denied',
          };
        } catch {
          return { status: 'denied', granted: false, canAskAgain: false };
        }
      }
      await ensureReportNotificationChannel();
      return Notifications.requestPermissionsAsync();
    }
  }
}

export function usePermiso(resource: PermissionResource): PermissionState {
  const [permission, setPermission] = useState<PermissionSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousAppState = useRef<string | null | undefined>(AppState.currentState);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPermission(resource);
      setPermission(result);
      setError(null);
      return result;
    } catch (cause) {
      const message = getErrorMessage(cause);
      setError(message);
      throw cause;
    } finally {
      setLoading(false);
    }
  }, [resource]);

  const request = useCallback(async () => {
    setLoading(true);
    try {
      const result = await requestPermission(resource);
      setPermission(result);
      setError(null);
      return result;
    } catch (cause) {
      const message = getErrorMessage(cause);
      setError(message);
      throw cause;
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useFocusEffect(
    useCallback(() => {
      void refresh().catch(() => undefined);
    }, [refresh]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const returnedFromSettings =
        previousAppState.current?.match(/inactive|background/) &&
        nextState === 'active';
      previousAppState.current = nextState;
      if (returnedFromSettings) void refresh().catch(() => undefined);
    });

    return () => subscription.remove();
  }, [refresh]);

  return { permission, loading, error, refresh, request };
}

export async function openSystemSettings() {
  if (Platform.OS === 'web') {
    throw new Error('Los ajustes de permisos solo están disponibles en un dispositivo móvil.');
  }
  await Linking.openSettings();
}
