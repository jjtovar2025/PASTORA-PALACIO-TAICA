export interface PatientEntry {
  id: string;
  date: string;
  entryTime: string;
  name: string;
  idNumber: string;
  birthDate: string;
  age: string;
  gender: 'M' | 'F';
  weight: string;
  height: string;
  heartRate: string;
  spo2: string;
  temperature: string;
  bloodPressure: string;
  glucose: string;
  address: string;
  parish: string;
  phone: string;
  companionPhone: string;
  reason: string;
  specialty: string;
  diagnosis: string;
  treatmentGiven: string;
  treatmentPrescribed: string;
  referredHvsr: boolean;
  referredSpecialist: boolean;
  exitTime: string;
  // New activity/treatment fields
  tto_ev: boolean;
  tto_im: boolean;
  tto_sl: boolean;
  tto_vo: boolean;
  tto_sc: boolean;
  tto_protocolo: boolean;
  nebulizaciones: boolean;
  curas: boolean;
  suturas: boolean;
  retiro_puntos: boolean;
  sondas: boolean;
  lavado_ocular: boolean;
  lavado_nasal: boolean;
  lavado_oidos: boolean;
  electros: boolean;
  visitas_domiciliares: boolean;
  jornadas_especiales: boolean;
  entregas_ayudas: boolean;
  vacunas_rutinas: boolean;
  referencia_ambulancia: boolean;
  referencia_propios_medios: boolean;
}

export interface HealthReport {
  id?: string;
  created_at?: string;
  patients?: PatientEntry[];
  header: {
    date: string;
    day: string;
    staff_enfermeria: string;
    doctor_general: string;
    doctor_specialist: string;
  };
  stats: {
    total_patients: number;
    female: number;
    male: number;
    med_general: number;
    emergencia: number;
    pediatria: number;
    geriatria: number;
    med_interna: number;
    ginecologia: number;
    prenatal: number;
    [key: string]: any;
  };
  activities: {
    ta_control: number;
    glicemia: number;
    peso: number;
    talla: number;
    tto_ev: number;
    tto_im: number;
    tto_sl: number;
    tto_vo: number;
    tto_sc: number;
    tto_protocolo: number;
    nebulizaciones: number;
    curas: number;
    suturas: number;
    retiro_puntos: number;
    sondas: number;
    lavado_ocular: number;
    lavado_nasal: number;
    lavado_oidos: number;
    electros: number;
    visitas_domiciliares: number;
    jornadas_especiales: number;
    entregas_ayudas: number;
    vacunas_rutinas: number;
    [key: string]: number;
  };
  age_groups: {
    lactante_0_2: number;
    preescolar_3_5: number;
    escolar_6_11: number;
    adolescente_12_18: number;
    adulto_19_59: number;
    adulto_mayor_60: number;
  };
  references: {
    total: number;
    ambulancia: number;
    propios_medios: number;
    [key: string]: number;
  };
  epidemiology: {
    status_level: 'STABLE' | 'WARNING' | 'CRITICAL';
    cardiovascular: number;
    diabetes: number;
    asma: number;
    ira: number;
    embarazada: number;
    covid: number;
    fiebre: number;
    dengue: number;
    zika: number;
    chicungunya: number;
    varicela: number;
    rubeola: number;
    sarampion: number;
    h1n1: number;
    mordedura_canina: number;
    [key: string]: any;
  };
  whatsapp_summary: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface AppsScriptConfig {
  url: string;
}
