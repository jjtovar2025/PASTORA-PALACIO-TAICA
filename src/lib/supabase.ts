import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function saveReport(report: any) {
  if (!supabase) return null;
  
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
