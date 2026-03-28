import { GoogleGenAI, Type } from "@google/genai";
import { HealthReport } from "../types";

const SYSTEM_INSTRUCTION = `Rol: Eres un Agente de Inteligencia de Datos para el Centro + Salud "Pastora Palacios Taica". Tu función es procesar reportes de texto clínico y devolver una estructura de datos estandarizada para su almacenamiento en la base de datos y envío a Google Sheets.

1. REGLAS DE NORMALIZACIÓN DE DATOS:
- Fechas: Convierte cualquier fecha encontrada al formato ISO YYYY-MM-DD.
- Cantidades: Asegúrate de que todos los valores sean números enteros. Si el reporte dice "00", devuelve 0.
- Semaforización (Campo status_level): 
  * CRITICAL: Presencia de COVID-19, Varicela, Sarampión o enfermedades infectocontagiosas eruptivas.
  * WARNING: >= 3 casos de Fiebre, Dengue o IRA.
  * STABLE: Casos normales de control o consultas de rutina.

2. MAPEO DE ESTRUCTURA (JSON):
Extrae todos los campos detallados de estadísticas, actividades de enfermería, grupos etarios y programas de salud.

3. RESTRICCIÓN DE SALIDA:
No incluyas markdown (como \`\`\`json), no incluyas texto explicativo. Solo el objeto JSON plano.`;

export async function processReport(text: string): Promise<HealthReport> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY) || (process.env.GEMINI_API_KEY);
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no configurada en los Secrets.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          header: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              day: { type: Type.STRING },
              staff_enfermeria: { type: Type.STRING },
              doctor_general: { type: Type.STRING },
              doctor_specialist: { type: Type.STRING }
            },
            required: ["date", "day", "staff_enfermeria", "doctor_general", "doctor_specialist"]
          },
          stats: {
            type: Type.OBJECT,
            properties: {
              total_patients: { type: Type.NUMBER },
              female: { type: Type.NUMBER },
              male: { type: Type.NUMBER },
              med_general: { type: Type.NUMBER },
              emergencia: { type: Type.NUMBER },
              pediatria: { type: Type.NUMBER },
              geriatria: { type: Type.NUMBER },
              med_interna: { type: Type.NUMBER },
              ginecologia: { type: Type.NUMBER },
              prenatal: { type: Type.NUMBER }
            },
            required: ["total_patients", "female", "male", "med_general", "emergencia", "pediatria", "geriatria", "med_interna", "ginecologia", "prenatal"]
          },
          activities: {
            type: Type.OBJECT,
            properties: {
              ta_control: { type: Type.NUMBER },
              glicemia: { type: Type.NUMBER },
              peso: { type: Type.NUMBER },
              talla: { type: Type.NUMBER },
              tto_ev: { type: Type.NUMBER },
              tto_im: { type: Type.NUMBER },
              tto_sl: { type: Type.NUMBER },
              tto_vo: { type: Type.NUMBER },
              tto_sc: { type: Type.NUMBER },
              tto_protocolo: { type: Type.NUMBER },
              nebulizaciones: { type: Type.NUMBER },
              curas: { type: Type.NUMBER },
              suturas: { type: Type.NUMBER },
              retiro_puntos: { type: Type.NUMBER },
              sondas: { type: Type.NUMBER },
              lavado_ocular: { type: Type.NUMBER },
              lavado_nasal: { type: Type.NUMBER },
              lavado_oidos: { type: Type.NUMBER },
              electros: { type: Type.NUMBER },
              visitas_domiciliares: { type: Type.NUMBER },
              jornadas_especiales: { type: Type.NUMBER },
              entregas_ayudas: { type: Type.NUMBER },
              vacunas_rutina: { type: Type.NUMBER }
            },
            required: ["ta_control", "glicemia", "peso", "talla", "tto_ev", "tto_im", "tto_sl", "tto_vo", "tto_sc", "tto_protocolo", "nebulizaciones", "curas", "suturas", "retiro_puntos", "sondas", "lavado_ocular", "lavado_nasal", "lavado_oidos", "electros", "visitas_domiciliares", "jornadas_especiales", "entregas_ayudas", "vacunas_rutina"]
          },
          age_groups: {
            type: Type.OBJECT,
            properties: {
              lactante_0_2: { type: Type.NUMBER },
              preescolar_3_5: { type: Type.NUMBER },
              escolar_6_11: { type: Type.NUMBER },
              adolescente_12_17: { type: Type.NUMBER },
              adulto_joven_18_29: { type: Type.NUMBER },
              adulto_30_59: { type: Type.NUMBER },
              adulto_mayor_60: { type: Type.NUMBER }
            },
            required: ["lactante_0_2", "preescolar_3_5", "escolar_6_11", "adolescente_12_17", "adulto_joven_18_29", "adulto_30_59", "adulto_mayor_60"]
          },
          references: {
            type: Type.OBJECT,
            properties: {
              ambulancia_mas_salud: { type: Type.NUMBER },
              propios_medios: { type: Type.NUMBER }
            },
            required: ["ambulancia_mas_salud", "propios_medios"]
          },
          epidemiology: {
            type: Type.OBJECT,
            properties: {
              cardiovascular: { type: Type.NUMBER },
              diabetes: { type: Type.NUMBER },
              asma: { type: Type.NUMBER },
              ira: { type: Type.NUMBER },
              embarazada: { type: Type.NUMBER },
              covid_19: { type: Type.NUMBER },
              fiebre: { type: Type.NUMBER },
              dengue: { type: Type.NUMBER },
              zika: { type: Type.NUMBER },
              chicungunya: { type: Type.NUMBER },
              varicela: { type: Type.NUMBER },
              rubeola: { type: Type.NUMBER },
              sarampion: { type: Type.NUMBER },
              h1n1: { type: Type.NUMBER },
              mordeduras_canina: { type: Type.NUMBER },
              diarreas: { type: Type.NUMBER },
              amigdalitis: { type: Type.NUMBER },
              hipertension: { type: Type.NUMBER },
              otros: { type: Type.NUMBER },
              status_level: { type: Type.STRING, enum: ["STABLE", "WARNING", "CRITICAL"] }
            },
            required: ["cardiovascular", "diabetes", "asma", "ira", "embarazada", "covid_19", "fiebre", "dengue", "zika", "chicungunya", "varicela", "rubeola", "sarampion", "h1n1", "mordeduras_canina", "diarreas", "amigdalitis", "hipertension", "otros", "status_level"]
          },
          whatsapp_summary: { type: Type.STRING }
        },
        required: ["header", "stats", "activities", "age_groups", "references", "epidemiology", "whatsapp_summary"]
      }
    }
  });

  return JSON.parse(response.text);
}
