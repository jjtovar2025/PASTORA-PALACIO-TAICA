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
      adolescente_12_17: patients.filter(p => { const a = parseInt(p.age) || 0; return a >= 12 && a <= 17; }).length,
      adulto_joven_18_29: patients.filter(p => { const a = parseInt(p.age) || 0; return a >= 18 && a <= 29; }).length,
      adulto_30_59: patients.filter(p => { const a = parseInt(p.age) || 0; return a >= 30 && a <= 59; }).length,
      adulto_mayor_60: patients.filter(p => (parseInt(p.age) || 0) >= 60).length
    },
    activities: {
      ta_control: patients.filter(p => p.bloodPressure && p.bloodPressure !== '').length,
      glicemia: patients.filter(p => p.glucose && p.glucose !== '').length,
      peso: patients.filter(p => p.weight && p.weight !== '').length,
      talla: patients.filter(p => p.height && p.height !== '').length,
      tto_ev: patients.filter(p => p.treatmentGiven?.toUpperCase().includes('EV')).length,
      tto_im: patients.filter(p => p.treatmentGiven?.toUpperCase().includes('IM')).length,
      curas: patients.filter(p => p.treatmentGiven?.toUpperCase().includes('CURA')).length,
      nebulizaciones: patients.filter(p => p.treatmentGiven?.toUpperCase().includes('NEBULIZ')).length,
      suturas: patients.filter(p => p.treatmentGiven?.toUpperCase().includes('SUTURA')).length,
      retiro_puntos: patients.filter(p => p.treatmentGiven?.toUpperCase().includes('RETIRO')).length,
      sondas: patients.filter(p => p.treatmentGiven?.toUpperCase().includes('SONDA')).length,
    },
    epidemiology: {
      cardiovascular: patients.filter(p => p.diagnosis?.toUpperCase().match(/HTA|HIPERTEN/)).length,
      diabetes: patients.filter(p => p.diagnosis?.toUpperCase().includes('DIABETES')).length,
      ira: patients.filter(p => p.diagnosis?.toUpperCase().match(/IRA|ASMA|GRIPE/)).length,
      asma: patients.filter(p => p.diagnosis?.toUpperCase().includes('ASMA')).length,
      fiebre: patients.filter(p => p.diagnosis?.toUpperCase().includes('FIEBRE')).length,
      dengue: patients.filter(p => p.diagnosis?.toUpperCase().includes('DENGUE')).length,
      covid_19: patients.filter(p => p.diagnosis?.toUpperCase().includes('COVID')).length,
      diarreas: patients.filter(p => p.diagnosis?.toUpperCase().includes('DIARREA')).length,
      hipertension: patients.filter(p => p.diagnosis?.toUpperCase().match(/HTA|HIPERTEN/)).length,
      status_level: patients.filter(p => p.diagnosis?.toUpperCase().match(/HTA|HIPERTEN/)).length > 5 ? 'CRITICAL' : 'STABLE'
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

*2. Por Actividades*
▪️Control de T/A: ${pad(report.activities?.ta_control || 0)}
▪️Control de: glicemia:${pad(report.activities?.glicemia || 0)}
▪️Control peso: ${pad(report.activities?.peso || 0)}
▪️Talla: ${pad(report.activities?.talla || 0)}
💉Tto E/V : ${pad(report.activities?.tto_ev || 0)}
💉Tto I/M: ${pad(report.activities?.tto_im || 0)}
▪️Nebulizaciones: ${pad(report.activities?.nebulizaciones || 0)}
▪️Curas: ${pad(report.activities?.curas || 0)}
➖Suturas: ${pad(report.activities?.suturas || 0)}
--Retiro de puntos: ${pad(report.activities?.retiro_puntos || 0)}
_Sondas: ${pad(report.activities?.sondas || 0)}

*3-Por Grupo Etario*
➖Lactante 0 a 2 años : ${pad(report.age_groups.lactante_0_2)}
➖Preescolar 3 a 5 años : ${pad(report.age_groups.preescolar_3_5)}
➖Escolares 6 a 11 años: ${pad(report.age_groups.escolar_6_11)}
➖Adolescente 12 a 18: ${pad(report.age_groups.adolescente_12_17)}
➖Adulto 19 a 59 años: ${pad(report.age_groups.adulto_joven_18_29 + report.age_groups.adulto_30_59)}
➖Adulto mayor 60 años o más: ${pad(report.age_groups.adulto_mayor_60)}

▪️ Referencia de casos: ${pad((report.references?.ambulancia_mas_salud || 0) + (report.references?.propios_medios || 0))}

*4- Por Programa de Salud*
▪️ Cardiovascular: ${pad(report.epidemiology.cardiovascular)}
▪️ Diabetes: ${pad(report.epidemiology.diabetes)}
▪️Asma: ${pad(report.epidemiology.asma)}
▪️IRA: ${pad(report.epidemiology.ira)}
▪️Casos de mordeduras canina: ${pad(report.epidemiology.mordeduras_canina || 0)}

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
    ["Estadísticas"],
    ["Total Pacientes", report.stats.total_patients],
    ["Femenino", report.stats.female],
    ["Masculino", report.stats.male],
    [""],
    ["Grupo Etario"],
    ["Lactante 0-2", report.age_groups.lactante_0_2],
    ["Preescolar 3-5", report.age_groups.preescolar_3_5],
    ["Escolar 6-11", report.age_groups.escolar_6_11],
    ["Adolescente 12-17", report.age_groups.adolescente_12_17],
    ["Adulto 18-59", report.age_groups.adulto_joven_18_29 + report.age_groups.adulto_30_59],
    ["Adulto Mayor 60+", report.age_groups.adulto_mayor_60]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");
  
  XLSX.writeFile(wb, `Libro_Pacientes_${report.header.date}.xlsx`);
};
