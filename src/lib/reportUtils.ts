import { PatientEntry, HealthReport } from '../types';
import * as XLSX from 'xlsx';

export const patientsToReport = (patients: PatientEntry[], staff: { nurse: string, doctorGen: string, doctorSpec: string }): HealthReport => {
  const date = new Date();
  const report: HealthReport = {
    header: {
      date: date.toISOString().split('T')[0],
      day: new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date).toUpperCase(),
      staff_enfermeria: staff.nurse,
      doctor_general: staff.doctorGen,
      doctor_specialist: staff.doctorSpec
    },
    stats: {
      total_patients: patients.length,
      female: patients.filter(p => p.gender === 'Femenino').length,
      male: patients.filter(p => p.gender === 'Masculino').length,
      med_general: patients.filter(p => p.service === 'Medicina General').length,
      emergencia: patients.filter(p => p.service === 'Emergencia').length,
      pediatria: patients.filter(p => p.service === 'Pediatría').length,
      geriatria: patients.filter(p => p.service === 'Geriatría').length,
      med_interna: patients.filter(p => p.service === 'Medicina Interna').length,
      ginecologia: patients.filter(p => p.service === 'Ginecología').length,
      prenatal: patients.filter(p => p.service === 'Prenatal').length
    },
    activities: {
      ta_control: patients.filter(p => p.activities.includes('Control de T/A')).length,
      glicemia: patients.filter(p => p.activities.includes('Control de glicemia')).length,
      peso: patients.filter(p => p.activities.includes('Control peso')).length,
      talla: patients.filter(p => p.activities.includes('Talla')).length,
      tto_ev: patients.filter(p => p.activities.includes('Tto E/V')).length,
      tto_im: patients.filter(p => p.activities.includes('Tto I/M')).length,
      tto_sl: patients.filter(p => p.activities.includes('Tto S/L')).length,
      tto_vo: patients.filter(p => p.activities.includes('Tto V/O')).length,
      tto_sc: patients.filter(p => p.activities.includes('Tto S/C')).length,
      tto_protocolo: patients.filter(p => p.activities.includes('Tto protocolo')).length,
      nebulizaciones: patients.filter(p => p.activities.includes('Nebulizaciones')).length,
      curas: patients.filter(p => p.activities.includes('Curas')).length,
      suturas: patients.filter(p => p.activities.includes('Suturas')).length,
      retiro_puntos: patients.filter(p => p.activities.includes('Retiro de puntos')).length,
      sondas: patients.filter(p => p.activities.includes('Sondas')).length,
      lavado_ocular: patients.filter(p => p.activities.includes('Lavado ocular')).length,
      lavado_nasal: patients.filter(p => p.activities.includes('Lavado nasal')).length,
      lavado_oidos: patients.filter(p => p.activities.includes('Lavado de oidos')).length,
      electros: patients.filter(p => p.activities.includes('Electros')).length,
      visitas_domiciliares: patients.filter(p => p.activities.includes('Visitas domiciliares')).length,
      jornadas_especiales: patients.filter(p => p.activities.includes('Jornadas especiales')).length,
      entregas_ayudas: patients.filter(p => p.activities.includes('Entregas de ayudas')).length,
      vacunas_rutina: patients.filter(p => p.activities.includes('Vacunas de rutina')).length
    },
    age_groups: {
      lactante_0_2: patients.filter(p => p.age <= 2).length,
      preescolar_3_5: patients.filter(p => p.age >= 3 && p.age <= 5).length,
      escolar_6_11: patients.filter(p => p.age >= 6 && p.age <= 11).length,
      adolescente_12_17: patients.filter(p => p.age >= 12 && p.age <= 17).length,
      adulto_joven_18_29: patients.filter(p => p.age >= 18 && p.age <= 29).length,
      adulto_30_59: patients.filter(p => p.age >= 30 && p.age <= 59).length,
      adulto_mayor_60: patients.filter(p => p.age >= 60).length
    },
    references: {
      ambulancia_mas_salud: patients.filter(p => p.reference === 'Ambulancia').length,
      propios_medios: patients.filter(p => p.reference === 'Propios Medios').length
    },
    epidemiology: {
      cardiovascular: patients.filter(p => p.programs.includes('Cardiovascular')).length,
      diabetes: patients.filter(p => p.programs.includes('Diabetes')).length,
      asma: patients.filter(p => p.programs.includes('Asma')).length,
      ira: patients.filter(p => p.programs.includes('IRA')).length,
      embarazada: patients.filter(p => p.programs.includes('Embarazada')).length,
      covid_19: patients.filter(p => p.programs.includes('COVID-19')).length,
      fiebre: patients.filter(p => p.programs.includes('Fiebre')).length,
      dengue: patients.filter(p => p.programs.includes('Dengue')).length,
      zika: patients.filter(p => p.programs.includes('Zika')).length,
      chicungunya: patients.filter(p => p.programs.includes('Chicungunya')).length,
      varicela: patients.filter(p => p.programs.includes('Varicela')).length,
      rubeola: patients.filter(p => p.programs.includes('Rubeola')).length,
      sarampion: patients.filter(p => p.programs.includes('Sarampión')).length,
      h1n1: patients.filter(p => p.programs.includes('H1N1')).length,
      mordeduras_canina: patients.filter(p => p.programs.includes('Mordedura canina')).length,
      diarreas: 0,
      amigdalitis: 0,
      hipertension: 0,
      otros: 0,
      status_level: 'STABLE'
    },
    whatsapp_summary: ''
  };

  // Generate WhatsApp text
  const pad = (n: number) => n.toString().padStart(2, '0');
  report.whatsapp_summary = `Morbilidad diaria 
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
_Sondas: ${pad(report.activities.sondas)}
 -Lavado ocular : ${pad(report.activities.lavado_ocular)} 
 -Lavado nasal: ${pad(report.activities.lavado_nasal)}
 - Lavado de oidos:${pad(report.activities.lavado_oidos)}
 _Electros: ${pad(report.activities.electros)}
▪️Visitas domiciliares: ${pad(report.activities.visitas_domiciliares)}
▪️Jornadas especiales: ${pad(report.activities.jornadas_especiales)}
▪️Entregas de ayudas: ${pad(report.activities.entregas_ayudas)}
▪️💉 Vacunas de rutinas: ${pad(report.activities.vacunas_rutina)}

*3-Por Grupo Etario*
➖Lactante 0 a 2 años : ${pad(report.age_groups.lactante_0_2)}
➖Preescolar 3 a 5 años : ${pad(report.age_groups.preescolar_3_5)}
➖Escolares 6 a 11 años: ${pad(report.age_groups.escolar_6_11)}
➖Adolescente 12 a 18: ${pad(report.age_groups.adolescente_12_17)}
➖Adulto 19 a 59 años: ${pad(report.age_groups.adulto_joven_18_29 + report.age_groups.adulto_30_59)}
➖Adulto mayor 60 años o más: ${pad(report.age_groups.adulto_mayor_60)}

▪️ Referencia de casos: ${pad(report.references.ambulancia_mas_salud + report.references.propios_medios)}
Por Ambulancia de Más salud: ${pad(report.references.ambulancia_mas_salud)}
 Por sus propios medios: ${pad(report.references.propios_medios)}

*4- Por Programa de Salud*
▪️ Cardiovascular: ${pad(report.epidemiology.cardiovascular)}
▪️ Diabetes: ${pad(report.epidemiology.diabetes)}
▪️Asma: ${pad(report.epidemiology.asma)}
▪️IRA: ${pad(report.epidemiology.ira)}
▪️ Embarazada: ${pad(report.epidemiology.embarazada)}
▪️Casos sospechoso de COVID-19 😷: ${pad(report.epidemiology.covid_19)}
▪️ Fiebre ${pad(report.epidemiology.fiebre)}
 Dengue: ${pad(report.epidemiology.dengue)}
▪️ Fiebre 🦟 Zika: ${pad(report.epidemiology.zika)}
▪️Fiebre 🦟 Chicungunya: ${pad(report.epidemiology.chicungunya)}
▪️Casos de Varicela: ${pad(report.epidemiology.varicela)}
▪️Casos de Rubeola: ${pad(report.epidemiology.rubeola)}
▪️Casos de Sarampión: ${pad(report.epidemiology.sarampion)}
▪️Casos de H1N1: ${pad(report.epidemiology.h1n1)}
▪️Casos de mordeduras canina: ${pad(report.epidemiology.mordeduras_canina)}

▪️💉 *Responsables del Reporte : ${report.header.staff_enfermeria}
Consulta Médico General: ${report.header.doctor_general}
Especialista : ${report.header.doctor_specialist}`;

  return report;
};

export const exportToExcel = (patients: PatientEntry[], report: HealthReport) => {
  const wb = XLSX.utils.book_new();
  
  // Patients sheet
  const patientsData = patients.map(p => ({
    Nombre: p.name,
    Edad: p.age,
    Género: p.gender,
    Servicio: p.service,
    Actividades: p.activities.join(', '),
    Programas: p.programs.join(', '),
    Referencia: p.reference || 'Ninguna',
    Hora: new Date(p.timestamp).toLocaleTimeString()
  }));
  const wsPatients = XLSX.utils.json_to_sheet(patientsData);
  XLSX.utils.book_append_sheet(wb, wsPatients, "Pacientes");
  
  // Summary sheet
  const summaryData = [
    ["Resumen de Morbilidad Diaria"],
    ["Centro", "Pastora Palacios Taica"],
    ["Fecha", report.header.date],
    ["Día", report.header.day],
    [""],
    ["Estadísticas"],
    ["Total Pacientes", report.stats.total_patients],
    ["Femenino", report.stats.female],
    ["Masculino", report.stats.male],
    ["Medicina General", report.stats.med_general],
    ["Emergencia", report.stats.emergencia],
    ["Pediatría", report.stats.pediatria],
    ["Geriatría", report.stats.geriatria],
    ["Medicina Interna", report.stats.med_interna],
    ["Ginecología", report.stats.ginecologia],
    ["Prenatal", report.stats.prenatal]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");
  
  XLSX.writeFile(wb, `Reporte_Morbilidad_${report.header.date}.xlsx`);
};
