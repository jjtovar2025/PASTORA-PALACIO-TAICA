export interface Paciente {
  id?: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F';
  direccion: string;
  parroquia: string;
  telefono: string;
  telefono_acompanante: string;
}

export interface Consulta {
  id?: number;
  paciente_id: number;
  fecha: string;
  hora_ingreso: string;
  medico_guardia: string;
  enfermera_guardia: string;
  peso: number;
  talla: number;
  fc: number;
  spo2: number;
  temp_c: number;
  pa_sistolica: number;
  pa_diastolica: number;
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
  estado_sincronizacion: 'pendiente' | 'sincronizado' | 'error';
}

export interface Configuracion {
  id: number;
  nombre_centro: string;
  asic: string;
  parroquia: string;
  medico_guardia_default: string;
  enfermera_guardia_default: string;
}
