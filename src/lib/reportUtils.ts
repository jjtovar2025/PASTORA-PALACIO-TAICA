import { PatientEntry, HealthReport } from '../types';
import * as XLSX from 'xlsx';

export const patientsToReport = (patients: PatientEntry[], staff: { nurse: string, doctorGen: string, doctorSpec: string }): HealthReport => {
  const date = new Date();
  const report: HealthReport = {
    patients: [...patients],
    header: {
      date: date.toISOString().split('T')[0],
      day: new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date).toUpperCase(),
      staff_enfermeria: staff.nurse,
      doctor_general: staff.doctorGen,
      doctor_specialist: staff.doctorSpec
    },
    stats: {
      total_patients: patients.length,
      female: patients.filter(p => p.gender === 'F').length,
      male: patients.filter(p => p.gender === 'M').length,
      med_general: patients.filter(p => p.specialty?.toUpperCase().includes('GENERAL')).length,
      med_interna: patients.filter(p => p.specialty?.toUpperCase().includes('INTERNA')).length,
      emergencia: patients.filter(p => p.specialty?.toUpperCase().includes('EMERGENCIA')).length,
      pediatria: patients.filter(p => p.specialty?.toUpperCase().includes('PEDIATRIA')).length,
      geriatria: patients.filter(p => p.specialty?.toUpperCase().includes('GERIATRIA')).length,
      ginecologia: patients.filter(p => p.specialty?.toUpperCase().includes('GINECOLOGIA')).length,
      prenatal: patients.filter(p => p.specialty?.toUpperCase().includes('PRENATAL')).length,
    },
    age_groups: {
      lactante_0_2: patients.filter(p => (parseInt(p.age) || 0) <= 2).length,
      preescolar_3_5: patients.filter(p => { const a = parseInt(p.age) || 0; return a >= 3 && a <= 5; }).length,
      escolar_6_11: patients.filter(p => { const a = parseInt(p.age) || 0; return a >= 6 && a <= 11; }).length,
      adolescente_12_18: patients.filter(p => { const a = parseInt(p.age) || 0; return a >= 12 && a <= 18; }).length,
      adulto_19_59: patients.filter(p => { const a = parseInt(p.age) || 0; return a >= 19 && a <= 59; }).length,
      adulto_mayor_60: patients.filter(p => (parseInt(p.age) || 0) >= 60).length
    },
    activities: {
      ta_control: patients.filter(p => p.bloodPressure && p.bloodPressure !== '').length,
      glicemia: patients.filter(p => p.glucose && p.glucose !== '').length,
      peso: patients.filter(p => p.weight && p.weight !== '').length,
      talla: patients.filter(p => p.height && p.height !== '').length,
      tto_ev: patients.filter(p => p.tto_ev).length,
      tto_im: patients.filter(p => p.tto_im).length,
      tto_sl: patients.filter(p => p.tto_sl).length,
      tto_vo: patients.filter(p => p.tto_vo).length,
      tto_sc: patients.filter(p => p.tto_sc).length,
      tto_protocolo: patients.filter(p => p.tto_protocolo).length,
      nebulizaciones: patients.filter(p => p.nebulizaciones).length,
      curas: patients.filter(p => p.curas).length,
      suturas: patients.filter(p => p.suturas).length,
      retiro_puntos: patients.filter(p => p.retiro_puntos).length,
      sondas: patients.filter(p => p.sondas).length,
      lavado_ocular: patients.filter(p => p.lavado_ocular).length,
      lavado_nasal: patients.filter(p => p.lavado_nasal).length,
      lavado_oidos: patients.filter(p => p.lavado_oidos).length,
      electros: patients.filter(p => p.electros).length,
      visitas_domiciliares: patients.filter(p => p.visitas_domiciliares).length,
      jornadas_especiales: patients.filter(p => p.jornadas_especiales).length,
      entregas_ayudas: patients.filter(p => p.entregas_ayudas).length,
      vacunas_rutinas: patients.filter(p => p.vacunas_rutinas).length,
    },
    references: {
      total: patients.filter(p => p.referencia_ambulancia || p.referencia_propios_medios).length,
      ambulancia: patients.filter(p => p.referencia_ambulancia).length,
      propios_medios: patients.filter(p => p.referencia_propios_medios).length,
    },
    epidemiology: {
      cardiovascular: patients.filter(p => p.diagnosis?.toUpperCase().match(/HTA|HIPERTEN|CARDIO|CORAZON/)).length,
      diabetes: patients.filter(p => p.diagnosis?.toUpperCase().match(/DIABETES|GLICEMIA|AZUCAR/)).length,
      ira: patients.filter(p => p.diagnosis?.toUpperCase().match(/IRA|ASMA|GRIPE|TOS|RESPIRATORIO|BRONQUITIS/)).length,
      asma: patients.filter(p => p.diagnosis?.toUpperCase().includes('ASMA')).length,
      embarazada: patients.filter(p => p.diagnosis?.toUpperCase().match(/EMBARAZADA|PRENATAL|GESTANTE/)).length,
      covid: patients.filter(p => p.diagnosis?.toUpperCase().match(/COVID|CORONAVIRUS/)).length,
      fiebre: patients.filter(p => p.diagnosis?.toUpperCase().match(/FIEBRE|FEBRIL/)).length,
      dengue: patients.filter(p => p.diagnosis?.toUpperCase().includes('DENGUE')).length,
      zika: patients.filter(p => p.diagnosis?.toUpperCase().includes('ZIKA')).length,
      chicungunya: patients.filter(p => p.diagnosis?.toUpperCase().includes('CHICUNGUNYA')).length,
      varicela: patients.filter(p => p.diagnosis?.toUpperCase().includes('VARICELA')).length,
      rubeola: patients.filter(p => p.diagnosis?.toUpperCase().includes('RUBEOLA')).length,
      sarampion: patients.filter(p => p.diagnosis?.toUpperCase().includes('SARAMPION')).length,
      h1n1: patients.filter(p => p.diagnosis?.toUpperCase().includes('H1N1')).length,
      mordedura_canina: patients.filter(p => p.diagnosis?.toUpperCase().match(/MORDEDURA|CANINA|PERRO/)).length,
      status_level: patients.filter(p => p.diagnosis?.toUpperCase().match(/HTA|HIPERTEN/)).length > 5 ? 'CRITICAL' : 'STABLE'
    },
    whatsapp_summary: ''
  };

  // Generate WhatsApp text
  const pad = (n: number) => n.toString().padStart(2, '0');
  report.whatsapp_summary = `*Reporte de Enfermería*
Morbilidad diaria 
*Centro + Salud. Pastora Palacios Taica 
*Fecha:*${report.header.date.split('-').reverse().join('/')}*
*Día: *${report.header.day}*

*1. Pacientes Atendidos: ${report.stats.total_patients}
Femenino : ${pad(report.stats.female)}
Masculino: ${pad(report.stats.male)}
Medicina General: ${pad(report.stats.med_general)}
 Emergencia: ${pad(report.stats.emergencia)}
Pediatría: ${pad(report.stats.pediatria)}
Geriatría: ${pad(report.stats.geriatria)}
Medicina Interna:${pad(report.stats.med_interna)}
Ginecologia:${pad(report.stats.ginecologia)}
Prenatal: ${pad(report.stats.prenatal)}
Enfermería:
*2. Por Actividades*
▪️Control de T/A: ${pad(report.activities.ta_control)}
▪️Control de: glicemia:${pad(report.activities.glicemia)}
▪️Control peso: ${pad(report.activities.peso)}
▪️Talla: ${pad(report.activities.talla)}
💉Tto E/V : ${pad(report.activities.tto_ev)}
💉Tto I/M: ${pad(report.activities.tto_im)}
💉Tto S/L: ${pad(report.activities.tto_sl)}
💉Tto V/O: ${pad(report.activities.tto_vo)}
💉Tto :S/C: ${pad(report.activities.tto_sc)}
  Tto: protocolo ${pad(report.activities.tto_protocolo)}
▪️Nebulizaciones: ${pad(report.activities.nebulizaciones)}
▪️Curas: ${pad(report.activities.curas)}
➖Suturas: ${pad(report.activities.suturas)}
--Retiro de puntos: ${pad(report.activities.retiro_puntos)}
_Sondas: ${pad(report.activities.sondas)}.      
 -Lavado ocular : ${pad(report.activities.lavado_ocular)} 
-Lavado nasal: ${pad(report.activities.lavado_nasal)}
 - Lavado de oidos:${pad(report.activities.lavado_oidos)}
 _Electros: ${pad(report.activities.electros)}
▪️Visitas domiciliares: ${pad(report.activities.visitas_domiciliares)}
▪️Jornadas especiales: ${pad(report.activities.jornadas_especiales)}
▪️Entregas de ayudas: ${pad(report.activities.entregas_ayudas)}
▪️💉 Vacunas de rutinas: ${pad(report.activities.vacunas_rutinas)}
*3-Por Grupo Etario*
➖Lactante 0 a 2 años : ${pad(report.age_groups.lactante_0_2)}
➖Preescolar 3 a 5 años : ${pad(report.age_groups.preescolar_3_5)}
➖Escolares 6 a 11 años: ${pad(report.age_groups.escolar_6_11)}
➖Adolescente 12 a 18: ${pad(report.age_groups.adolescente_12_18)}
➖Adulto 19 a 59 años: ${pad(report.age_groups.adulto_19_59)}
➖Adulto mayor 60 años o más: ${pad(report.age_groups.adulto_mayor_60)}
▪️ Referencia de casos: ${pad(report.references.total)}
Por Ambulancia de Más salud: ${pad(report.references.ambulancia)}                
 Por sus propios medios: ${pad(report.references.propios_medios)}
*4- Por Programa de Salud*
▪️ Cardiovascular: ${pad(report.epidemiology.cardiovascular)}
▪️ Diabetes: ${pad(report.epidemiology.diabetes)}
▪️Asma: ${pad(report.epidemiology.asma)}
▪️IRA: ${pad(report.epidemiology.ira)}
▪️ Embarazada: ${pad(report.epidemiology.embarazada)}
▪️Casos sospechoso de COVID-19 😷: ${pad(report.epidemiology.covid)}
▪️ Fiebre ${pad(report.epidemiology.fiebre)}
 Dengue: ${pad(report.epidemiology.dengue)}
▪️ Fiebre 🦟 Zika: ${pad(report.epidemiology.zika)}
▪️Fiebre 🦟 Chicungunya: ${pad(report.epidemiology.chicungunya)}
▪️Casos de Varicela: ${pad(report.epidemiology.varicela)}
▪️Casos de Rubeola: ${pad(report.epidemiology.rubeola)}
▪️Casos de Sarampión: ${pad(report.epidemiology.sarampion)}
▪️Casos de H1N1: ${pad(report.epidemiology.h1n1)}
▪️Casos de mordeduras canina: ${pad(report.epidemiology.mordedura_canina)}

▪️💉 *Responsables del Reporte : ${report.header.staff_enfermeria}
Consulta Médico General: ${report.header.doctor_general}
Especialista : ${report.header.doctor_specialist}`;

  return report;
};

export const exportToExcel = (patients: PatientEntry[], report: HealthReport) => {
  const wb = XLSX.utils.book_new();
  
  // Patients sheet with requested columns
  const patientsData = patients.map((p, index) => ({
    'N°': index + 1,
    'FECHA': p.date,
    'HORA DE INGRESO': p.entryTime,
    'NOMBRES APELLIDOS': p.name,
    'CEDULA': p.idNumber,
    'FECHA DE NACIMIENTO': p.birthDate,
    'EDAD': p.age,
    'SEXO (M)': p.gender === 'M' ? 'X' : '',
    'SEXO (F)': p.gender === 'F' ? 'X' : '',
    'PESO': p.weight,
    'TALLA': p.height,
    'F.C': p.heartRate,
    '% sPo2': p.spo2,
    'temp ºc': p.temperature,
    'P.A': p.bloodPressure,
    'Gl': p.glucose,
    'DIRECCION': p.address,
    'PARROQUIA': p.parish,
    'Nº TELEFONICO': p.phone,
    'Nº TELEFONICO ACOMPAÑANTE': p.companionPhone,
    'MOTIVO DE CONSULTA': p.reason,
    'ESPECIALIDAD': p.specialty,
    'DIAGNOSTICO MEDICO': p.diagnosis,
    'TRATAMIENTO COLOCADO': p.treatmentGiven,
    'TRATAMIENTO RECETADO': p.treatmentPrescribed,
    'Tto E/V': p.tto_ev ? 'X' : '',
    'Tto I/M': p.tto_im ? 'X' : '',
    'Tto S/L': p.tto_sl ? 'X' : '',
    'Tto V/O': p.tto_vo ? 'X' : '',
    'Tto S/C': p.tto_sc ? 'X' : '',
    'Tto Protocolo': p.tto_protocolo ? 'X' : '',
    'Nebulizaciones': p.nebulizaciones ? 'X' : '',
    'Curas': p.curas ? 'X' : '',
    'Suturas': p.suturas ? 'X' : '',
    'Retiro Puntos': p.retiro_puntos ? 'X' : '',
    'Sondas': p.sondas ? 'X' : '',
    'Lavado Ocular': p.lavado_ocular ? 'X' : '',
    'Lavado Nasal': p.lavado_nasal ? 'X' : '',
    'Lavado Oídos': p.lavado_oidos ? 'X' : '',
    'Electros': p.electros ? 'X' : '',
    'Visitas Dom.': p.visitas_domiciliares ? 'X' : '',
    'Jornadas Esp.': p.jornadas_especiales ? 'X' : '',
    'Entrega Ayudas': p.entregas_ayudas ? 'X' : '',
    'Vacunas Rut.': p.vacunas_rutinas ? 'X' : '',
    'Ref. Ambulancia': p.referencia_ambulancia ? 'X' : '',
    'Ref. Propios Medios': p.referencia_propios_medios ? 'X' : '',
    'REFERIDO AL HVSR': p.referredHvsr ? 'SI' : 'NO',
    'REFERIDO A CONSULTA ESPECILIZADA': p.referredSpecialist ? 'SI' : 'NO',
    'HORA DE SALIDA': p.exitTime
  }));
  
  const wsPatients = XLSX.utils.json_to_sheet(patientsData);
  XLSX.utils.book_append_sheet(wb, wsPatients, "Libro de Pacientes");
  
  // Summary sheet
  const summaryData = [
    ["Resumen de Morbilidad Diaria"],
    ["Centro", "Pastora Palacios Taica"],
    ["Fecha", report.header.date],
    ["Día", report.header.day],
    [""],
    ["1. Estadísticas de Atención"],
    ["Total Pacientes", report.stats.total_patients],
    ["Femenino", report.stats.female],
    ["Masculino", report.stats.male],
    ["Medicina General", report.stats.med_general],
    ["Emergencia", report.stats.emergencia],
    ["Pediatría", report.stats.pediatria],
    ["Geriatría", report.stats.geriatria],
    ["Medicina Interna", report.stats.med_interna],
    ["Ginecología", report.stats.ginecologia],
    ["Prenatal", report.stats.prenatal],
    [""],
    ["2. Por Actividades"],
    ["Control de T/A", report.activities.ta_control],
    ["Control de Glicemia", report.activities.glicemia],
    ["Control Peso", report.activities.peso],
    ["Talla", report.activities.talla],
    ["Tto E/V", report.activities.tto_ev],
    ["Tto I/M", report.activities.tto_im],
    ["Tto S/L", report.activities.tto_sl],
    ["Tto V/O", report.activities.tto_vo],
    ["Tto S/C", report.activities.tto_sc],
    ["Tto Protocolo", report.activities.tto_protocolo],
    ["Nebulizaciones", report.activities.nebulizaciones],
    ["Curas", report.activities.curas],
    ["Suturas", report.activities.suturas],
    ["Retiro de Puntos", report.activities.retiro_puntos],
    ["Sondas", report.activities.sondas],
    ["Lavado Ocular", report.activities.lavado_ocular],
    ["Lavado Nasal", report.activities.lavado_nasal],
    ["Lavado de Oídos", report.activities.lavado_oidos],
    ["Electros", report.activities.electros],
    ["Visitas Domiciliares", report.activities.visitas_domiciliares],
    ["Jornadas Especiales", report.activities.jornadas_especiales],
    ["Entregas de Ayudas", report.activities.entregas_ayudas],
    ["Vacunas de Rutinas", report.activities.vacunas_rutinas],
    [""],
    ["3. Por Grupo Etario"],
    ["Lactante 0-2", report.age_groups.lactante_0_2],
    ["Preescolar 3-5", report.age_groups.preescolar_3_5],
    ["Escolar 6-11", report.age_groups.escolar_6_11],
    ["Adolescente 12-18", report.age_groups.adolescente_12_18],
    ["Adulto 19-59", report.age_groups.adulto_19_59],
    ["Adulto Mayor 60+", report.age_groups.adulto_mayor_60],
    [""],
    ["4. Referencias"],
    ["Total Referencias", report.references.total],
    ["Por Ambulancia", report.references.ambulancia],
    ["Por Propios Medios", report.references.propios_medios],
    [""],
    ["5. Programas de Salud"],
    ["Cardiovascular", report.epidemiology.cardiovascular],
    ["Diabetes", report.epidemiology.diabetes],
    ["Asma", report.epidemiology.asma],
    ["IRA", report.epidemiology.ira],
    ["Embarazada", report.epidemiology.embarazada],
    ["COVID-19", report.epidemiology.covid],
    ["Fiebre", report.epidemiology.fiebre],
    ["Dengue", report.epidemiology.dengue],
    ["Zika", report.epidemiology.zika],
    ["Chicungunya", report.epidemiology.chicungunya],
    ["Varicela", report.epidemiology.varicela],
    ["Rubeola", report.epidemiology.rubeola],
    ["Sarampión", report.epidemiology.sarampion],
    ["H1N1", report.epidemiology.h1n1],
    ["Mordedura Canina", report.epidemiology.mordedura_canina]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

  // SQL Schema sheet
  const sqlSchema = [
    ["-- TABLA DE PACIENTES"],
    ["CREATE TABLE pacientes ("],
    ["  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),"],
    ["  date DATE NOT NULL,"],
    ["  entry_time TIME NOT NULL,"],
    ["  name TEXT NOT NULL,"],
    ["  id_number TEXT,"],
    ["  birth_date DATE,"],
    ["  age TEXT,"],
    ["  gender CHAR(1),"],
    ["  weight TEXT,"],
    ["  height TEXT,"],
    ["  heart_rate TEXT,"],
    ["  spo2 TEXT,"],
    ["  temperature TEXT,"],
    ["  blood_pressure TEXT,"],
    ["  glucose TEXT,"],
    ["  address TEXT,"],
    ["  parish TEXT,"],
    ["  phone TEXT,"],
    ["  companion_phone TEXT,"],
    ["  reason TEXT,"],
    ["  specialty TEXT,"],
    ["  diagnosis TEXT,"],
    ["  treatment_given TEXT,"],
    ["  treatment_prescribed TEXT,"],
    ["  referred_hvsr BOOLEAN DEFAULT FALSE,"],
    ["  referred_specialist BOOLEAN DEFAULT FALSE,"],
    ["  exit_time TIME,"],
    ["  tto_ev BOOLEAN DEFAULT FALSE,"],
    ["  tto_im BOOLEAN DEFAULT FALSE,"],
    ["  tto_sl BOOLEAN DEFAULT FALSE,"],
    ["  tto_vo BOOLEAN DEFAULT FALSE,"],
    ["  tto_sc BOOLEAN DEFAULT FALSE,"],
    ["  tto_protocolo BOOLEAN DEFAULT FALSE,"],
    ["  nebulizaciones BOOLEAN DEFAULT FALSE,"],
    ["  curas BOOLEAN DEFAULT FALSE,"],
    ["  suturas BOOLEAN DEFAULT FALSE,"],
    ["  retiro_puntos BOOLEAN DEFAULT FALSE,"],
    ["  sondas BOOLEAN DEFAULT FALSE,"],
    ["  lavado_ocular BOOLEAN DEFAULT FALSE,"],
    ["  lavado_nasal BOOLEAN DEFAULT FALSE,"],
    ["  lavado_oidos BOOLEAN DEFAULT FALSE,"],
    ["  electros BOOLEAN DEFAULT FALSE,"],
    ["  visitas_domiciliares BOOLEAN DEFAULT FALSE,"],
    ["  jornadas_especiales BOOLEAN DEFAULT FALSE,"],
    ["  entregas_ayudas BOOLEAN DEFAULT FALSE,"],
    ["  vacunas_rutinas BOOLEAN DEFAULT FALSE,"],
    ["  referencia_ambulancia BOOLEAN DEFAULT FALSE,"],
    ["  referencia_propios_medios BOOLEAN DEFAULT FALSE"],
    [");"],
    [""],
    ["-- TABLA DE REPORTES DIARIOS"],
    ["CREATE TABLE reportes_diarios ("],
    ["  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),"],
    ["  created_at TIMESTAMPTZ DEFAULT now(),"],
    ["  date DATE NOT NULL,"],
    ["  data JSONB NOT NULL"],
    [");"]
  ];
  const wsSql = XLSX.utils.aoa_to_sheet(sqlSchema);
  XLSX.utils.book_append_sheet(wb, wsSql, "Esquema SQL");
  
  XLSX.writeFile(wb, `Libro_Pacientes_${report.header.date}.xlsx`);
};
