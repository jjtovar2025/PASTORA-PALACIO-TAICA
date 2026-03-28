import { HealthReport, PatientEntry } from '../types';

const OFFLINE_REPORTS_KEY = 'health_app_pending_reports';
const OFFLINE_PATIENTS_KEY = 'health_app_pending_patients';

export interface PendingReport {
  id: string;
  report: HealthReport;
  timestamp: number;
}

export interface PendingPatient {
  id: string;
  patient: PatientEntry;
  timestamp: number;
}

export function savePendingReport(report: HealthReport) {
  const pending = getPendingReports();
  const newPending: PendingReport = {
    id: crypto.randomUUID(),
    report,
    timestamp: Date.now()
  };
  localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify([...pending, newPending]));
  return newPending;
}

export function getPendingReports(): PendingReport[] {
  const saved = localStorage.getItem(OFFLINE_REPORTS_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function removePendingReport(id: string) {
  const pending = getPendingReports();
  localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(pending.filter(p => p.id !== id)));
}

export function savePendingPatient(patient: PatientEntry) {
  const pending = getPendingPatients();
  const newPending: PendingPatient = {
    id: patient.id,
    patient,
    timestamp: Date.now()
  };
  localStorage.setItem(OFFLINE_PATIENTS_KEY, JSON.stringify([...pending, newPending]));
  return newPending;
}

export function getPendingPatients(): PendingPatient[] {
  const saved = localStorage.getItem(OFFLINE_PATIENTS_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function removePendingPatient(id: string) {
  const pending = getPendingPatients();
  localStorage.setItem(OFFLINE_PATIENTS_KEY, JSON.stringify(pending.filter(p => p.id !== id)));
}

export function clearPendingReports() {
  localStorage.removeItem(OFFLINE_REPORTS_KEY);
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}
