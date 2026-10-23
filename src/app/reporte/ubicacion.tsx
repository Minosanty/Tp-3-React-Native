import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import {
  ActionButton,
  Card,
  Eyebrow,
  Heading,
  InlineError,
  Loading,
  Screen,
  colors,
} from '@/components/ui';
import { useAppData } from '@/context/AppContext';
import { usePermiso } from '@/hooks/usePermiso';

const sectors = ['Patio', 'Estacionamiento', 'Pasillo', 'Aula', 'Otro'] as const;

export default function ReportLocationScreen() {
  const router = useRouter();
  const permission = usePermiso('ubicacion');
  const { draft, setDraft } = useAppData();
  const [sector, setSector] = useState(draft.location?.label ?? '');
  const [loadingLocation, setLoadingLocation] = useState(false);

  function requestLocation() {
    router.push({
      pathname: '/permisos/[recurso]',
      params: { recurso: 'ubicacion', next: '/reporte/ubicacion' },
    });
  }

  async function captureLocation() {
    setLoadingLocation(true);
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      setDraft({
        location: {
          label: sector ? `${sector} · ubicación aproximada` : 'Ubicación aproximada',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          approximate: true,
        },
      });
      router.back();
    } catch (error) {
      Alert.alert('No se pudo obtener la ubicación', error instanceof Error ? error.message : 'Elegí el sector a mano.');
    } finally {
      setLoadingLocation(false);
    }
  }

  function saveSectorOnly() {
    if (!sector) {
      Alert.alert('Elegí un sector', 'También podés escribir “Otro” en el campo de ubicación del formulario.');
      return;
    }
    setDraft({
      location: {
        label: `${sector} · ubicación elegida a mano`,
        approximate: true,
      },
    });
    router.back();
  }

  return (
    <Screen>
      <Eyebrow>Nuevo reporte · lugar</Eyebrow>
      <Heading subtitle="La ubicación precisa no es necesaria para crear un reporte. Si denegás el permiso, elegí un sector manualmente.">
        ¿Dónde está el problema?
      </Heading>

      {permission.permission?.granted ? (
        <Card>
          <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '700' }}>Ubicación en primer plano</Text>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
            Se consulta solo mientras esta pantalla está abierta. El reporte muestra el sector, no tus coordenadas.
          </Text>
          {loadingLocation ? <Loading label="Obteniendo ubicación…" /> : null}
          <ActionButton onPress={captureLocation} disabled={loadingLocation}>
            Usar mi ubicación aproximada
          </ActionButton>
        </Card>
      ) : (
        <>
          <Card>
            <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '700' }}>Ubicación no habilitada</Text>
            <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
              Se solicita solo en primer plano y al tocar el botón. También podés elegir el sector a mano.
            </Text>
          </Card>
          <ActionButton onPress={requestLocation} variant="secondary">
            Explicar y continuar con la ubicación
          </ActionButton>
        </>
      )}

      {permission.error ? <InlineError>{permission.error}</InlineError> : null}
      <Card>
        <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '700' }}>O elegí el sector a mano</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {sectors.map((option) => {
            const selected = sector === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSector(option)}
                style={{
                  paddingHorizontal: 13,
                  paddingVertical: 10,
                  borderColor: selected ? colors.primary : colors.border,
                  borderWidth: 1,
                  borderRadius: 999,
                  backgroundColor: selected ? colors.primaryLight : colors.surface,
                }}
              >
                <Text style={{ color: selected ? colors.primary : colors.ink, fontWeight: '700' }}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
        <ActionButton onPress={saveSectorOnly} variant="secondary">Usar este sector</ActionButton>
      </Card>
      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
        Nunca se solicita ubicación en segundo plano.
      </Text>
      <ActionButton onPress={() => router.back()} variant="quiet">Volver al formulario</ActionButton>
    </Screen>
  );
}
