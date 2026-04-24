import Dexie, { Table } from 'dexie';
import { Paciente, Consulta, Configuracion } from './types';

export class MorbilidadDB extends Dexie {
  pacientes!: Table<Paciente>;
  consultas!: Table<Consulta>;
  configuracion!: Table<Configuracion>;

  constructor() {
    super('MorbilidadCPTDB');
    this.version(1).stores({
      pacientes: '++id, cedula_representante, es_menor',
      consultas: '++id, paciente_id, fecha, estado_sincronizacion',
      configuracion: 'id'
    });
  }
}

export const db = new MorbilidadDB();

// Initialize configuration if not exists
export async function initDB() {
  const config = await db.configuracion.get(1);
  if (!config) {
    await db.configuracion.put({
      id: 1,
      nombre_centro: 'CPT 2 Padre Hilario Cabrera',
      asic: 'Paracotos',
      parroquia: 'Paracotos',
      medico_guardia_default: '',
      enfermera_guardia_default: ''
    });
  }
}
