import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { ActionButton, Card, Eyebrow, Heading, Screen, colors } from '@/components/ui';
import { useAppData } from '@/context/AppContext';

export default function NoticesScreen() {
  const router = useRouter();
  const { notices, reports } = useAppData();

  return (
    <Screen>
      <Eyebrow>Alternativa dentro de la app</Eyebrow>
      <Heading subtitle="Los mensajes importantes también aparecen acá, aunque no habilites notificaciones del sistema.">
        Bandeja de avisos
      </Heading>
      {notices.length === 0 ? (
        <Card>
          <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '700' }}>No hay avisos todavía</Text>
          <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
            Al actualizar un reporte, el aviso queda disponible en esta bandeja.
          </Text>
        </Card>
      ) : notices.map((notice) => {
        const reportExists = notice.reportId && reports.some((report) => report.id === notice.reportId);
        return (
          <Card key={notice.id}>
            <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '800' }}>{notice.title}</Text>
            <Text style={{ color: colors.ink, fontSize: 14, lineHeight: 21 }}>{notice.message}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              {new Date(notice.createdAt).toLocaleString()}
            </Text>
            {reportExists ? (
              <ActionButton
                onPress={() =>
                  router.push({ pathname: '/reporte/[id]', params: { id: notice.reportId! } })
                }
                variant="quiet"
              >
                Ver reporte
              </ActionButton>
            ) : null}
          </Card>
        );
      })}
      <ActionButton onPress={() => router.back()} variant="secondary">Volver</ActionButton>
    </Screen>
  );
}
