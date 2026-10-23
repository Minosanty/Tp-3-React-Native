import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import {
  ActionButton,
  Card,
  Eyebrow,
  Heading,
  Loading,
  Screen,
  colors,
} from '@/components/ui';
import { useAppData } from '@/context/AppContext';
import { Report, ReportStatus } from '@/types/report';

const statusColors: Record<ReportStatus, { color: string; background: string }> = {
  pendiente: { color: '#916300', background: '#fff4d4' },
  'en curso': { color: '#245f9e', background: '#e5f0fb' },
  resuelto: { color: '#20744d', background: '#e5f4ea' },
};

function ReportCard({ report, onPress }: { report: Report; onPress: () => void }) {
  const statusStyle = statusColors[report.status];
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
          <Text style={{ flex: 1, color: colors.ink, fontSize: 17, fontWeight: '800' }}>
            {report.title}
          </Text>
          <Text
            style={{
              alignSelf: 'flex-start',
              overflow: 'hidden',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 5,
              color: statusStyle.color,
              backgroundColor: statusStyle.background,
              fontSize: 11,
              fontWeight: '800',
              textTransform: 'uppercase',
            }}
          >
            {report.status}
          </Text>
        </View>
        <Text style={{ color: colors.muted, fontSize: 14 }}>
          {report.category} · Aula {report.aula}
        </Text>
        <Text numberOfLines={2} style={{ color: colors.ink, fontSize: 14, lineHeight: 20 }}>
          {report.description}
        </Text>
      </Card>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { reports, loading, notices } = useAppData();

  return (
    <Screen>
      <Eyebrow>Instituto Politécnico Formosa</Eyebrow>
      <Heading subtitle="Reportá un desperfecto y seguí su estado sin perder de vista tu privacidad.">
        Mantenimiento IPF
      </Heading>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <ActionButton onPress={() => router.push('/reporte/nuevo')}>Nuevo reporte</ActionButton>
        </View>
        <View style={{ flex: 1 }}>
          <ActionButton onPress={() => router.push('/avisos')} variant="secondary">
            Avisos{notices.length ? ` · ${notices.length}` : ''}
          </ActionButton>
        </View>
      </View>

      <Card style={{ backgroundColor: colors.primaryLight, borderColor: '#c7e8dc' }}>
        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '800' }}>
          Cada permiso aparece en contexto
        </Text>
        <Text style={{ color: colors.ink, fontSize: 14, lineHeight: 21 }}>
          Escanear, fotografiar, ubicar o recibir avisos son decisiones separadas. Si no habilitás una función, podés seguir usando las demás.
        </Text>
        <ActionButton onPress={() => router.push('/permisos')} variant="quiet">
          Ver panel de permisos
        </ActionButton>
      </Card>

      <View style={{ gap: 10 }}>
        <Heading subtitle="Tus reportes quedan guardados en este dispositivo.">
          Reportes recientes
        </Heading>
        {loading ? <Loading label="Cargando reportes…" /> : null}
        {!loading && reports.length === 0 ? (
          <Card>
            <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '700' }}>
              Todavía no hay reportes
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
              Cuando detectes una luz quemada, una canilla con pérdida o un equipo roto, empezá un reporte. La app también funciona si denegás un permiso.
            </Text>
          </Card>
        ) : null}
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onPress={() =>
              router.push({ pathname: '/reporte/[id]', params: { id: report.id } })
            }
          />
        ))}
      </View>

      <ActionButton onPress={() => router.push('/ajustes-app')} variant="quiet">
        Ajustes de avisos
      </ActionButton>
    </Screen>
  );
}
