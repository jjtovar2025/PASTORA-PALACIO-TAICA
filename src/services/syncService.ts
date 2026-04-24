import { createClient } from '@supabase/supabase-js';
import { db } from '../db';
import { Paciente, Consulta } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function sincronizarPendientes() {
  if (!supabase) return { success: false, message: 'Supabase no configurado' };

  try {
    // 1. Sincronizar pacientes primero
    const pacientes = await db.pacientes.toArray();
    if (pacientes.length > 0) {
      const { error: pError } = await supabase.from('morbilidad_pacientes').upsert(
        pacientes.map(p => ({
          cedula_representante: p.cedula_representante,
          nombres: p.nombres,
          apellidos: p.apellidos,
          fecha_nacimiento: p.fecha_nacimiento,
          sexo: p.sexo,
          direccion: p.direccion,
          parroquia: p.parroquia,
          telefono: p.telefono,
          es_menor: p.es_menor,
          nombre_menor: p.nombre_menor,
          fecha_nacimiento_menor: p.fecha_nacimiento_menor,
          sexo_menor: p.sexo_menor
        })),
        { onConflict: 'cedula_representante' }
      );
      if (pError) throw pError;
    }

    // 2. Sincronizar consultas pendientes
    const pendientes = await db.consultas.where('estado_sincronizacion').equals('pendiente').toArray();
    if (pendientes.length === 0) return { success: true, message: 'Nada que sincronizar' };

    // Obtener mapeo de cedulas -> IDs remotos para asegurar FKs
    const { data: remotePacientes } = await supabase.from('morbilidad_pacientes').select('id, cedula_representante');
    const remoteIdMap = new Map(remotePacientes?.map(p => [p.cedula_representante, p.id]) || []);

    for (const consulta of pendientes) {
      const paciente = await db.pacientes.get(consulta.paciente_id);
      if (!paciente) continue;

      const remotePacienteId = remoteIdMap.get(paciente.cedula_representante);
      if (!remotePacienteId) continue;

      const { error: cError } = await supabase.from('morbilidad_consultas').insert([{
        ...consulta,
        paciente_id: remotePacienteId,
        id: undefined 
      }]);

      if (!cError) {
        await db.consultas.update(consulta.id!, { estado_sincronizacion: 'sincronizado' });
      } else {
        await db.consultas.update(consulta.id!, { estado_sincronizacion: 'error' });
        console.error('Error sincronizando consulta:', cError);
      }
    }

    return { success: true, message: 'Sincronización completada' };
  } catch (error) {
    console.error('Error en sincronización:', error);
    return { success: false, message: 'Error durante la sincronización' };
  }
}
