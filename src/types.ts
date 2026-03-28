export interface HealthReport {
  registro: {
    fecha: string;
    dia: string;
    responsable: string;
    medicos: string[];
    semaforo: "VERDE" | "NARANJA" | "ROJO";
  };
  totales: {
    pacientes: number;
    femenino: number;
    masculino: number;
    med_general: number;
    med_interna: number;
    otros: number;
  };
  enfermeria: {
    control_ta: number;
    glicemia: number;
    peso: number;
    talla: number;
    inyectable_ev: number;
    inyectable_im: number;
    curas: number;
    otros_procederes: number;
  };
  etario: {
    "0_18": number;
    "19_59": number;
    "60_mas": number;
  };
  alertas_epidemiologicas: {
    cardiovascular: number;
    diabetes: number;
    ira_asma: number;
    fiebre_dengue: number;
    casos_criticos: number;
  };
}

export interface SupabaseConfig {
  url: string;
  key: string;
}

export interface AppsScriptConfig {
  url: string;
}
