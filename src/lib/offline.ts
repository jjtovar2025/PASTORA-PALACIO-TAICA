import { HealthReport } from '../types';

const OFFLINE_REPORTS_KEY = 'health_app_pending_reports';

export interface PendingReport {
  id: string;
  report: HealthReport;
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

export function clearPendingReports() {
  localStorage.removeItem(OFFLINE_REPORTS_KEY);
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}
