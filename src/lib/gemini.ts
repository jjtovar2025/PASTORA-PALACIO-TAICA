import { GoogleGenAI, Type } from "@google/genai";
import { HealthReport } from "./types";

const SYSTEM_INSTRUCTION = `Rol: Actúa como un Analista de Datos Médicos Senior especializado en la gestión de morbilidad para el Centro + Salud "Pastora Palacios Taica". Tu tarea es procesar reportes de WhatsApp y convertirlos en datos estructurados para Google Sheets.

1. OBJETIVO DE EXTRACCIÓN:
Analiza el texto proporcionado y extrae con precisión quirúrgica los siguientes grupos de datos:
Encabezado: Fecha, Día de la semana, Responsable, Médicos de guardia.
Estadísticas Generales: Total atendidos, desglose por Sexo y por Especialidad (Medicina General, Interna, Emergencia, etc.).
Actividades de Enfermería: Conteo exacto de cada procedimiento (T/A, Glicemia, Pesos, Tallas, Inyectables E/V e I/M, Curas, etc.).
Grupos Etarios: Distribución desde Lactantes hasta Adulto Mayor.
Programas de Salud: Casos detectados de enfermedades crónicas o infecciosas.

2. LÓGICA DE SEMÁFORO EPIDEMIOLÓGICO:
Debes generar un campo llamado semaforo basado en las siguientes reglas:
🔴 CRÍTICO (Rojo): Si hay >= 1 caso de COVID-19, Varicela, Sarampión, H1N1 o cualquier enfermedad eruptiva.
🟠 ALERTA (Naranja): Si hay >= 3 casos de IRA (Infecciones Respiratorias), Dengue, Fiebre o Mordeduras Caninas.
🟢 ESTABLE (Verde): Si no se cumplen las condiciones anteriores.

3. FORMATO DE SALIDA (ESTRICTO JSON):
No escribas texto adicional, ni saludos, ni explicaciones. Tu respuesta debe ser ÚNICAMENTE un objeto JSON con la estructura definida.`;

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
          registro: {
            type: Type.OBJECT,
            properties: {
              fecha: { type: Type.STRING },
              dia: { type: Type.STRING },
              responsable: { type: Type.STRING },
              medicos: { type: Type.ARRAY, items: { type: Type.STRING } },
              semaforo: { type: Type.STRING, enum: ["VERDE", "NARANJA", "ROJO"] }
            },
            required: ["fecha", "dia", "responsable", "medicos", "semaforo"]
          },
          totales: {
            type: Type.OBJECT,
            properties: {
              pacientes: { type: Type.NUMBER },
              femenino: { type: Type.NUMBER },
              masculino: { type: Type.NUMBER },
              med_general: { type: Type.NUMBER },
              med_interna: { type: Type.NUMBER },
              otros: { type: Type.NUMBER }
            },
            required: ["pacientes", "femenino", "masculino", "med_general", "med_interna", "otros"]
          },
          enfermeria: {
            type: Type.OBJECT,
            properties: {
              control_ta: { type: Type.NUMBER },
              glicemia: { type: Type.NUMBER },
              peso: { type: Type.NUMBER },
              talla: { type: Type.NUMBER },
              inyectable_ev: { type: Type.NUMBER },
              inyectable_im: { type: Type.NUMBER },
              curas: { type: Type.NUMBER },
              otros_procederes: { type: Type.NUMBER }
            },
            required: ["control_ta", "glicemia", "peso", "talla", "inyectable_ev", "inyectable_im", "curas", "otros_procederes"]
          },
          etario: {
            type: Type.OBJECT,
            properties: {
              "0_18": { type: Type.NUMBER },
              "19_59": { type: Type.NUMBER },
              "60_mas": { type: Type.NUMBER }
            },
            required: ["0_18", "19_59", "60_mas"]
          },
          alertas_epidemiologicas: {
            type: Type.OBJECT,
            properties: {
              cardiovascular: { type: Type.NUMBER },
              diabetes: { type: Type.NUMBER },
              ira_asma: { type: Type.NUMBER },
              fiebre_dengue: { type: Type.NUMBER },
              casos_criticos: { type: Type.NUMBER }
            },
            required: ["cardiovascular", "diabetes", "ira_asma", "fiebre_dengue", "casos_criticos"]
          }
        },
        required: ["registro", "totales", "enfermeria", "etario", "alertas_epidemiologicas"]
      }
    }
  });

  return JSON.parse(response.text);
}
