import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  InAppNotice,
  Report,
  ReportDraft,
} from '@/types/report';

const REPORTS_KEY = '@mantenimiento-ipf/reportes';
const NOTICES_KEY = '@mantenimiento-ipf/avisos';
const SETTINGS_KEY = '@mantenimiento-ipf/ajustes';

type AppContextValue = {
  reports: Report[];
  notices: InAppNotice[];
  loading: boolean;
  storageError: string | null;
  notificationsEnabled: boolean;
  draft: ReportDraft;
  setDraft: (draft: Partial<ReportDraft>) => void;
  resetDraft: () => void;
  createReport: (draft: ReportDraft) => Promise<Report>;
  updateReport: (id: string, changes: Partial<Omit<Report, 'id'>>) => Promise<void>;
  addNotice: (notice: Omit<InAppNotice, 'id' | 'createdAt'>) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
};

const emptyDraft: ReportDraft = {
  title: '',
  description: '',
  aula: '',
  category: 'Electricidad',
};

const AppContext = createContext<AppContextValue | null>(null);

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

export function AppProvider({ children }: PropsWithChildren) {
  const [reports, setReports] = useState<Report[]>([]);
  const [notices, setNotices] = useState<InAppNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [draft, setDraftState] = useState<ReportDraft>(emptyDraft);

  useEffect(() => {
    let mounted = true;

    async function loadStoredData() {
      try {
        const [storedReports, storedNotices, storedSettings] = await Promise.all([
          AsyncStorage.getItem(REPORTS_KEY),
          AsyncStorage.getItem(NOTICES_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
        ]);

        if (!mounted) return;
        setReports(storedReports ? (JSON.parse(storedReports) as Report[]) : []);
        setNotices(storedNotices ? (JSON.parse(storedNotices) as InAppNotice[]) : []);
        setNotificationsEnabledState(
          storedSettings ? Boolean(JSON.parse(storedSettings).notificationsEnabled) : false,
        );
        setStorageError(null);
      } catch (error) {
        if (mounted) setStorageError(`No se pudieron cargar los datos guardados: ${errorMessage(error)}`);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadStoredData();
    return () => {
      mounted = false;
    };
  }, []);

  const setDraft = useCallback((changes: Partial<ReportDraft>) => {
    setDraftState((current) => ({ ...current, ...changes }));
  }, []);

  const resetDraft = useCallback(() => setDraftState(emptyDraft), []);

  const createReport = useCallback(async (reportDraft: ReportDraft) => {
    const now = new Date().toISOString();
    const report: Report = {
      ...reportDraft,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'pendiente',
      createdAt: now,
      updatedAt: now,
    };
    const next = [report, ...reports];
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(next));
    setReports(next);
    return report;
  }, [reports]);

  const updateReport = useCallback(async (id: string, changes: Partial<Omit<Report, 'id'>>) => {
    const existing = reports.find((report) => report.id === id);
    if (!existing) throw new Error('No se encontró el reporte que intentás actualizar.');

    const next = reports.map((report) =>
      report.id === id
        ? { ...report, ...changes, updatedAt: new Date().toISOString() }
        : report,
    );
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(next));
    setReports(next);
  }, [reports]);

  const addNotice = useCallback(async (notice: Omit<InAppNotice, 'id' | 'createdAt'>) => {
    const nextNotice: InAppNotice = {
      ...notice,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    const next = [nextNotice, ...notices];
    await AsyncStorage.setItem(NOTICES_KEY, JSON.stringify(next));
    setNotices(next);
  }, [notices]);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ notificationsEnabled: enabled }));
    setNotificationsEnabledState(enabled);
  }, []);

  const value = useMemo(
    () => ({
      reports,
      notices,
      loading,
      storageError,
      notificationsEnabled,
      draft,
      setDraft,
      resetDraft,
      createReport,
      updateReport,
      addNotice,
      setNotificationsEnabled,
    }),
    [
      reports,
      notices,
      loading,
      storageError,
      notificationsEnabled,
      draft,
      setDraft,
      resetDraft,
      createReport,
      updateReport,
      addNotice,
      setNotificationsEnabled,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useAppData debe usarse dentro de AppProvider.');
  return value;
}
