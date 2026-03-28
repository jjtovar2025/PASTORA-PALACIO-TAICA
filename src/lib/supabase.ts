import { createClient } from '@supabase/supabase-js';
import { 
  savePendingReport, 
  getPendingReports, 
  removePendingReport, 
  isOnline,
  savePendingPatient,
  getPendingPatients,
  removePendingPatient
} from './offline';
import { PatientEntry } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function saveReport(report: any) {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Verifique las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
  }

  // If offline, save locally
  if (!isOnline()) {
    console.warn('Offline: Guardando reporte localmente.');
    savePendingReport(report);
    return { offline: true };
  }
  
  try {
    const { data, error } = await supabase
      .from('reportes_diarios')
      .insert([
        {
          report_date: report.header.date,
          data: report,
          status_level: report.epidemiology.status_level
        }
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (err) {
    // If it's a network error, save locally
    if (err instanceof Error && (err.message.includes('fetch') || err.message.includes('Network'))) {
      console.warn('Network Error: Guardando reporte localmente.');
      savePendingReport(report);
      return { offline: true };
    }
    throw err;
  }
}

export async function savePatient(patient: PatientEntry) {
  if (!supabase) return { offline: true };

  if (!isOnline()) {
    savePendingPatient(patient);
    return { offline: true };
  }

  try {
    const { data, error } = await supabase
      .from('pacientes')
      .upsert([
        {
          id: patient.id,
          patient_date: patient.date,
          data: patient
        }
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (err) {
    if (err instanceof Error && (err.message.includes('fetch') || err.message.includes('Network'))) {
      savePendingPatient(patient);
      return { offline: true };
    }
    throw err;
  }
}

export async function deletePatientFromSupabase(id: string) {
  if (!supabase || !isOnline()) return;
  await supabase.from('pacientes').delete().eq('id', id);
}

export async function syncPendingData() {
  if (!supabase || !isOnline()) return;

  // Sync Patients first
  const pendingPatients = getPendingPatients();
  for (const item of pendingPatients) {
    try {
      const { error } = await supabase
        .from('pacientes')
        .upsert([{ id: item.id, patient_date: item.patient.date, data: item.patient }]);
      if (!error) removePendingPatient(item.id);
    } catch (err) {
      console.error('Error syncing patient:', err);
    }
  }

  // Sync Reports
  const pending = getPendingReports();
  if (pending.length === 0) return;

  console.log(`Sincronizando ${pending.length} reportes pendientes...`);

  for (const item of pending) {
    try {
      const { error } = await supabase
        .from('reportes_diarios')
        .insert([
          {
            report_date: item.report.header.date,
            data: item.report,
            status_level: item.report.epidemiology.status_level
          }
        ]);

      if (!error) {
        removePendingReport(item.id);
        console.log(`Reporte ${item.id} sincronizado.`);
      } else {
        console.error(`Error sincronizando reporte ${item.id}:`, error);
      }
    } catch (err) {
      console.error(`Error sincronizando reporte ${item.id}:`, err);
      break; // Stop if there's a network error during sync
    }
  }
}

export async function getReports() {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('reportes_diarios')
    .select('*')
    .order('report_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPatientsFromSupabase(date: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('pacientes')
    .select('data')
    .eq('patient_date', date);
  
  if (error) throw error;
  return data.map(d => d.data as PatientEntry);
}
