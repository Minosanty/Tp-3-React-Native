export const REPORT_CATEGORIES = [
  'Electricidad',
  'Agua',
  'Mobiliario',
  'Equipos',
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
export type ReportStatus = 'pendiente' | 'en curso' | 'resuelto';

export type ReportLocation = {
  label: string;
  latitude?: number;
  longitude?: number;
  approximate: boolean;
};

export type ReportDraft = {
  title: string;
  description: string;
  aula: string;
  category: ReportCategory;
  imageUri?: string;
  location?: ReportLocation;
};

export type Report = ReportDraft & {
  id: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
};

export type InAppNotice = {
  id: string;
  title: string;
  message: string;
  reportId?: string;
  createdAt: string;
};
