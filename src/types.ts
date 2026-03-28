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
    [key: string]: number;
  };
  activities?: {
    [key: string]: number;
  };
  age_groups: {
    lactante_0_2: number;
    preescolar_3_5: number;
    escolar_6_11: number;
    adolescente_12_17: number;
    adulto_joven_18_29: number;
    adulto_30_59: number;
    adulto_mayor_60: number;
  };
  references?: {
    [key: string]: number;
  };
  epidemiology: {
    status_level: 'STABLE' | 'WARNING' | 'CRITICAL';
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
