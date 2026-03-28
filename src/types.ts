export interface HealthReport {
  id?: string;
  created_at?: string;
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
    vacunas_rutina: number;
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
  references: {
    ambulancia_mas_salud: number;
    propios_medios: number;
  };
  epidemiology: {
    cardiovascular: number;
    diabetes: number;
    asma: number;
    ira: number;
    embarazada: number;
    covid_19: number;
    fiebre: number;
    dengue: number;
    zika: number;
    chicungunya: number;
    varicela: number;
    rubeola: number;
    sarampion: number;
    h1n1: number;
    mordeduras_canina: number;
    diarreas: number;
    amigdalitis: number;
    hipertension: number;
    otros: number;
    status_level: 'STABLE' | 'WARNING' | 'CRITICAL';
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
