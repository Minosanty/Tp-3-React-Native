import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import {
  ActionButton,
  Card,
  Eyebrow,
  Field,
  Heading,
  Screen,
  colors,
} from '@/components/ui';
import { useAppData } from '@/context/AppContext';
import { REPORT_CATEGORIES } from '@/types/report';

export default function NewReportScreen() {
  const router = useRouter();
  const { draft, setDraft, resetDraft, createReport } = useAppData();

  useEffect(() => {
    resetDraft();
  }, [resetDraft]);

  async function saveReport() {
    if (!draft.title.trim() || !draft.description.trim() || !draft.aula.trim()) {
      Alert.alert('Faltan datos', 'Completá el título, la descripción y el aula. Si no podés escanear el QR, escribí el código a mano.');
      return;
    }
    try {
      const report = await createReport({
        ...draft,
        title: draft.title.trim(),
        description: draft.description.trim(),
        aula: draft.aula.trim(),
      });
      resetDraft();
      router.replace({ pathname: '/reporte/[id]', params: { id: report.id } });
    } catch (error) {
      Alert.alert('No se pudo guardar el reporte', error instanceof Error ? error.message : 'Intentá nuevamente.');
    }
  }

  return (
    <Screen>
      <Eyebrow>Nuevo reporte · 1 de 1</Eyebrow>
      <Heading subtitle="Contanos qué pasó. Podés completar el aula, la foto y el sector a mano si no querés habilitar sensores.">
        Describí el desperfecto
      </Heading>

      <Field
        label="Título"
        placeholder="Ej.: Luz quemada en el pasillo"
        value={draft.title}
        onChangeText={(title) => setDraft({ title })}
        maxLength={80}
      />
      <Field
        label="Descripción"
        placeholder="Contá qué sucede y desde cuándo."
        value={draft.description}
        onChangeText={(description) => setDraft({ description })}
        multiline
        maxLength={500}
      />

      <View style={{ gap: 8 }}>
        <Text style={{ color: colors.ink, fontSize: 14, fontWeight: '700' }}>Categoría</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {REPORT_CATEGORIES.map((category) => {
            const selected = draft.category === category;
            return (
              <Pressable
                key={category}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setDraft({ category })}
                style={{
                  paddingHorizontal: 13,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: 999,
                  backgroundColor: selected ? colors.primaryLight : colors.surface,
                }}
              >
                <Text style={{ color: selected ? colors.primary : colors.ink, fontSize: 13, fontWeight: '700' }}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Field
        label="Aula o espacio"
        placeholder="Ej.: A-204"
        value={draft.aula}
        onChangeText={(aula) => setDraft({ aula })}
        hint="Podés escanear el QR o ingresar el código manualmente."
        autoCapitalize="characters"
      />
      <View style={{ gap: 9 }}>
        <ActionButton
          onPress={() => router.push('/reporte/escanear')}
          variant="secondary"
        >
          Escanear QR del aula
        </ActionButton>
        <ActionButton
          onPress={() => router.push('/reporte/foto')}
          variant="secondary"
        >
          {draft.imageUri ? 'Cambiar foto' : 'Adjuntar foto'}
        </ActionButton>
        <ActionButton
          onPress={() => router.push('/reporte/ubicacion')}
          variant="secondary"
        >
          {draft.location ? `Lugar: ${draft.location.label}` : 'Marcar ubicación o sector'}
        </ActionButton>
      </View>

      {draft.imageUri ? (
        <Card>
          <Text style={{ color: colors.ink, fontWeight: '700' }}>Foto adjunta</Text>
          <Image
            source={{ uri: draft.imageUri }}
            accessibilityLabel="Vista previa de la foto del desperfecto"
            style={{ width: '100%', height: 210, borderRadius: 12, backgroundColor: colors.background }}
            resizeMode="cover"
          />
          <ActionButton onPress={() => setDraft({ imageUri: undefined })} variant="quiet">
            Quitar foto
          </ActionButton>
        </Card>
      ) : null}

      {draft.location ? (
        <Card>
          <Text style={{ color: colors.ink, fontWeight: '700' }}>Lugar del problema</Text>
          <Text style={{ color: colors.muted, fontSize: 14 }}>{draft.location.label}</Text>
          <ActionButton onPress={() => setDraft({ location: undefined })} variant="quiet">
            Quitar ubicación
          </ActionButton>
        </Card>
      ) : null}

      <ActionButton onPress={saveReport}>Crear reporte</ActionButton>
      <ActionButton onPress={() => router.back()} variant="quiet">Cancelar</ActionButton>
    </Screen>
  );
}
