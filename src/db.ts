import Dexie, { Table } from 'dexie';
import { Paciente, Consulta, Configuracion, PersonalCentro } from './types';

export class MorbilidadDB extends Dexie {
  pacientes!: Table<Paciente>;
  consultas!: Table<Consulta>;
  configuracion!: Table<Configuracion>;
  personal_centro!: Table<PersonalCentro>;

  constructor() {
    super('MorbilidadCPTDB');
    this.version(1).stores({
      pacientes: '++id, cedula_representante, es_menor',
      consultas: '++id, paciente_id, fecha, estado_sincronizacion',
      configuracion: 'id'
    });
    this.version(2).stores({
      personal_centro: '++id, cedula, nombres, apellidos, rol, cargo, telefono, correo, id_centro, nombre_centro, asic, pin, activo'
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
      nombre_centro: '',
      asic: '',
      parroquia: '',
      medico_guardia_default: '',
      enfermera_guardia_default: '',
      centros_disponibles: [
        { id: '1', nombre: 'CPT 2 Padre Hilario Cabrera', asic: 'Paracotos' },
        { id: '2', nombre: 'CPT 2 Maitana', asic: 'Paracotos' },
        { id: '3', nombre: 'CPT 2 Palo Negro', asic: 'Paracotos' }
      ]
    });
  }
}
