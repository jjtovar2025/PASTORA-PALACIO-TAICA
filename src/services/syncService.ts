import { createClient } from '@supabase/supabase-js';
import { db } from '../db';
import { Paciente, Consulta } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function sincronizarPendientes() {
  if (!supabase) return { success: false, message: 'Supabase no configurado' };

  try {
    // 1. Sincronizar pacientes primero (importante para FK si las hay en backend)
    const pacientes = await db.pacientes.toArray();
    if (pacientes.length > 0) {
      const { error: pError } = await supabase.from('pacientes').upsert(
        pacientes.map(p => ({
          cedula: p.cedula,
          nombres: p.nombres,
          apellidos: p.apellidos,
          fecha_nacimiento: p.fecha_nacimiento,
          sexo: p.sexo,
          direccion: p.direccion,
          parroquia: p.parroquia,
          telefono: p.telefono,
          telefono_acompanante: p.telefono_acompanante
        })),
        { onConflict: 'cedula' }
      );
      if (pError) throw pError;
    }

    // 2. Sincronizar consultas pendientes
    const pendientes = await db.consultas.where('estado_sincronizacion').equals('pendiente').toArray();
    
    if (pendientes.length === 0) return { success: true, message: 'Nada que sincronizar' };

    for (const consulta of pendientes) {
      // Necesitamos la cedula del paciente para el backend (mejor que ID autoincremental local)
      const paciente = await db.pacientes.get(consulta.paciente_id);
      if (!paciente) continue;

      const { error: cError } = await supabase.from('morbilidad').insert([{
        ...consulta,
        cedula_paciente: paciente.cedula, // Campo extra para relacionar en Supabase
        id: undefined // Dejar que Supabase genere el ID o usar UUID
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
