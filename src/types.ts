export interface Paciente {
  id?: number;
  cedula_representante: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F';
  direccion: string;
  parroquia: string;
  telefono: string;
  es_menor: boolean;
  nombre_menor?: string;
  fecha_nacimiento_menor?: string;
  sexo_menor?: 'M' | 'F';
}

export interface Consulta {
  id?: number;
  paciente_id: number;
  fecha: string;
  hora_ingreso: string;
  medico_guardia: string;
  enfermera_guardia: string;
  peso: number | null;
  talla: number | null;
  fc: number | null;
  spo2: number | null;
  temp_c: number | null;
  pa_sistolica: number | null;
  pa_diastolica: number | null;
  motivo_consulta: string;
  especialidad: string;
  diagnostico: string;
  tratamiento_colocado: string;
  tratamiento_recetado: string;
  referido_a: string;
  hora_salida: string;
  centro_nombre: string;
  centro_asic: string;
  centro_parroquia: string;
  es_menor: boolean;
  nombre_menor: string;
  tipo_actividad: string[]; // ['control_ta', 'tto_im', etc]
  grupo_etario: string;
  programa_salud: string[]; // ['cardiovascular', 'diabetes']
  estado_sincronizacion: 'pendiente' | 'sincronizado' | 'error';
}

export interface PersonalCentro {
  id?: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  rol: UserRole;
  cargo: 'Enfermero/a' | 'Médico/a' | 'Ambos';
  telefono: string;
  correo: string;
  id_centro: string;
  nombre_centro: string;
  asic: string;
  pin: string;
  activo: boolean;
}

export interface Configuracion {
  id: number;
  nombre_centro: string;
  asic: string;
  parroquia: string;
  medico_guardia_default: string;
  enfermera_guardia_default: string;
  centros_disponibles?: Array<{ id: string, nombre: string, asic: string }>;
}

export type UserRole = 'enfermeria' | 'medico';

export interface AuthContext {
  role: UserRole;
  userName: string;
  cedula: string;
  centro?: string;
  personalId?: number;
}
