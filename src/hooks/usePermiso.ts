import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Linking, Platform } from 'react-native';
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
    case 'camara':
      return Camera.getCameraPermissionsAsync();
    case 'ubicacion':
      return Location.getForegroundPermissionsAsync();
    case 'notificaciones':
      return Notifications.getPermissionsAsync();
  }
}

async function requestPermission(resource: PermissionResource): Promise<RawPermission> {
  switch (resource) {
    case 'camara':
      return Camera.requestCameraPermissionsAsync();
    case 'ubicacion':
      return Location.requestForegroundPermissionsAsync();
    case 'notificaciones':
      await ensureReportNotificationChannel();
      return Notifications.requestPermissionsAsync();
  }
}

export function usePermiso(resource: PermissionResource): PermissionState {
  const [permission, setPermission] = useState<PermissionSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousAppState = useRef<AppStateStatus>(AppState.currentState);

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
        previousAppState.current.match(/inactive|background/) &&
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
