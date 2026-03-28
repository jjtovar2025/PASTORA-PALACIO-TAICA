/**
 * Google Apps Script for Google Sheets integration.
 * 
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1BO1ewJ2OmRLipbuA4tY5p6maWE3sMOsWlps_MsiShnk/edit
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code.
 * 4. Replace SB_URL and SB_KEY with your Supabase credentials if they change.
 * 5. Deploy as Web App (Execute as: Me, Who has access: Anyone).
 */

const SB_URL = "https://jbduezsnztjwsjqrfdbr.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZHVlenNuenRqd3NqcXJmZGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTA0NTYsImV4cCI6MjA4OTQyNjQ1Nn0.WvXMaJw0d9LkXuJS1_eVIETnEMq6siKwRzX-DN5LREA";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Morbilidad") || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    // Append row to Google Sheets (Summary)
    sheet.appendRow([
      data.header.date,
      data.header.day,
      data.header.staff_enfermeria,
      data.header.doctor_general + ", " + data.header.doctor_specialist,
      data.epidemiology.status_level,
      data.stats.total_patients,
      data.stats.female,
      data.stats.male,
      data.stats.med_general,
      data.stats.med_interna,
      (data.stats.emergencia || 0) + (data.stats.pediatria || 0) + (data.stats.geriatria || 0) + (data.stats.ginecologia || 0) + (data.stats.prenatal || 0), // Otros
      data.activities.ta_control,
      data.activities.glicemia,
      data.activities.peso,
      data.activities.talla,
      data.activities.tto_ev,
      data.activities.tto_im,
      data.activities.curas,
      (data.activities.nebulizaciones || 0) + (data.activities.suturas || 0) + (data.activities.retiro_puntos || 0) + (data.activities.sondas || 0), // Otros procederes
      (data.age_groups.lactante_0_2 || 0) + (data.age_groups.preescolar_3_5 || 0) + (data.age_groups.escolar_6_11 || 0) + (data.age_groups.adolescente_12_17 || 0), // 0-18
      (data.age_groups.adulto_joven_18_29 || 0) + (data.age_groups.adulto_30_59 || 0), // 19-59
      data.age_groups.adulto_mayor_60, // 60+
      data.epidemiology.cardiovascular,
      data.epidemiology.diabetes,
      (data.epidemiology.ira || 0) + (data.epidemiology.asma || 0), // IRA/Asma
      (data.epidemiology.fiebre || 0) + (data.epidemiology.dengue || 0), // Fiebre/Dengue
      (data.epidemiology.covid_19 || 0) + (data.epidemiology.varicela || 0) + (data.epidemiology.sarampion || 0) // Casos Críticos
    ]);

    // Sync individual patients to "Libro de Pacientes" sheet
    if (data.patients && data.patients.length > 0) {
      var patientSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Libro de Pacientes");
      if (!patientSheet) {
        patientSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Libro de Pacientes");
        patientSheet.appendRow([
          "FECHA", "HORA", "NOMBRE", "CEDULA", "EDAD", "SEXO", "PESO", "TALLA", "VITALES", "MOTIVO", "ESPECIALIDAD", "DIAGNOSTICO", "TRATAMIENTO"
        ]);
      }
      
      data.patients.forEach(function(p) {
        patientSheet.appendRow([
          p.date,
          p.entryTime,
          p.name,
          p.idNumber,
          p.age,
          p.gender,
          p.weight,
          p.height,
          "FC:" + p.heartRate + " SpO2:" + p.spo2 + "% T:" + p.temperature + " PA:" + p.bloodPressure,
          p.reason,
          p.specialty,
          p.diagnosis,
          p.treatmentGiven
        ]);
      });
    }
    
    // Alert if CRITICAL
    if (data.epidemiology.status_level === "CRITICAL") {
      MailApp.sendEmail({
        to: "jjtovar2025@gmail.com",
        subject: "⚠️ ALERTA EPIDEMIOLÓGICA CRÍTICA - " + data.header.date,
        body: "Se ha registrado un reporte CRÍTICO.\nResponsable: " + data.header.staff_enfermeria + "\nDetalles: " + JSON.stringify(data.epidemiology)
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Run this function manually to migrate existing data from ALL sheets to Supabase.
 * This version is optimized for the "Patient List" format provided by the user.
 */
function migrateToSupabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  
  sheets.forEach(function(sheet) {
    var sheetName = sheet.getName();
    Logger.log("Procesando hoja: " + sheetName);
    
    var values = sheet.getDataRange().getValues();
    var reportDate = "";
    var doctors = "";
    var nursingStaff = "";
    
    // 1. Extract Header Info
    for (var i = 0; i < Math.min(values.length, 15); i++) {
      var rowStr = values[i].join(" ");
      if (rowStr.includes("FECHA:")) {
        var match = rowStr.match(/FECHA:\s*(\d{2}\/\d{2}\/\d{4})/);
        if (match) reportDate = match[1];
      }
      if (rowStr.includes("MEDICO DE GUARDIA:")) {
        doctors = rowStr.split("MEDICO DE GUARDIA:")[1].trim();
      }
      if (rowStr.includes("PERSONAL DE ENFERMERIA DE GUARDIA:")) {
        nursingStaff = rowStr.split("PERSONAL DE ENFERMERIA DE GUARDIA:")[1].trim();
      }
    }
    
    if (!reportDate) {
      Logger.log("No se encontró fecha en la hoja " + sheetName + ". Saltando.");
      return;
    }

    // 2. Aggregate Patient Data
    var stats = { total: 0, female: 0, male: 0, general: 0, internal: 0 };
    var activities = { ta: 0, gl: 0, peso: 0, talla: 0, ev: 0, im: 0, curas: 0 };
    var epidemiology = { hta: 0, diabetes: 0, ira: 0, fiebre: 0, otros: 0 };
    var ageGroups = { peds: 0, adults: 0, seniors: 0 };

    // Find table start (usually row with "N°" in first or second column)
    var tableStartRow = -1;
    for (var i = 0; i < values.length; i++) {
      if (values[i][0] === 1 || values[i][0] === "1") {
        tableStartRow = i;
        break;
      }
    }

    if (tableStartRow === -1) {
      Logger.log("No se encontró la tabla de pacientes en la hoja " + sheetName);
      return;
    }

    for (var i = tableStartRow; i < values.length; i++) {
      var row = values[i];
      if (!row[2]) continue; // Skip if no name

      stats.total++;
      
      // Sex (M is col 6, F is col 7 in 0-indexed)
      if (row[6] && row[6].toString().toUpperCase() === "X") stats.male++;
      if (row[7] && row[7].toString().toUpperCase() === "X") stats.female++;

      // Age Groups (Col 5)
      var age = parseInt(row[5]);
      if (!isNaN(age)) {
        if (age < 18) ageGroups.peds++;
        else if (age < 60) ageGroups.adults++;
        else ageGroups.seniors++;
      }

      // Specialty (Col 20)
      var spec = (row[20] || "").toString().toUpperCase();
      if (spec.includes("GENERAL")) stats.general++;
      if (spec.includes("INTERNA")) stats.internal++;

      // Activities
      if (row[13]) activities.ta++; // P.A.
      if (row[14]) activities.gl++; // Gl
      if (row[8]) activities.peso++; // Peso
      if (row[9]) activities.talla++; // Talla
      
      var tto = (row[22] || "").toString().toUpperCase();
      if (tto.includes("E.V") || tto.includes("EV")) activities.ev++;
      if (tto.includes("I.M") || tto.includes("IM")) activities.im++;
      if (tto.includes("CURA")) activities.curas++;

      // Epidemiology (Col 21 - Diagnóstico)
      var dx = (row[21] || "").toString().toUpperCase();
      if (dx.includes("HTA") || dx.includes("HIPERTEN")) epidemiology.hta++;
      if (dx.includes("DIABETES")) epidemiology.diabetes++;
      if (dx.includes("IRA") || dx.includes("ASMA") || dx.includes("GRIPE")) epidemiology.ira++;
      if (dx.includes("FIEBRE") || dx.includes("DENGUE")) epidemiology.fiebre++;
    }

    // 3. Construct Report Object
    var report = {
      header: {
        date: formatDate(reportDate),
        day: getDayName(reportDate),
        staff_enfermeria: nursingStaff || "Jexury Rio",
        doctor_general: doctors.split(".")[0] || "Lesther Rivas",
        doctor_specialist: doctors.split(".")[1] || "Eli Marrero"
      },
      stats: {
        total_patients: stats.total,
        female: stats.female,
        male: stats.male,
        med_general: stats.general,
        med_interna: stats.internal,
        emergencia: 0, pediatria: 0, geriatria: 0, ginecologia: 0, prenatal: 0
      },
      activities: {
        ta_control: activities.ta,
        glicemia: activities.gl,
        peso: activities.peso,
        talla: activities.talla,
        tto_ev: activities.ev,
        tto_im: activities.im,
        curas: activities.curas,
        nebulizaciones: 0, suturas: 0, retiro_puntos: 0, sondas: 0
      },
      age_groups: {
        lactante_0_2: 0, preescolar_3_5: 0, escolar_6_11: 0, adolescente_12_17: ageGroups.peds,
        adulto_joven_18_29: 0, adulto_30_59: ageGroups.adults,
        adulto_mayor_60: ageGroups.seniors
      },
      references: { ambulancia_mas_salud: 0, propios_medios: 0 },
      epidemiology: {
        cardiovascular: epidemiology.hta,
        diabetes: epidemiology.diabetes,
        ira: epidemiology.ira,
        asma: 0, embarazada: 0, covid_19: 0, fiebre: epidemiology.fiebre, dengue: 0, zika: 0, chicungunya: 0, varicela: 0, rubeola: 0, sarampion: 0, h1n1: 0, mordeduras_canina: 0, diarreas: 0, amigdalitis: 0, hipertension: epidemiology.hta, otros: 0,
        status_level: epidemiology.hta > 3 ? "CRITICAL" : "STABLE"
      },
      whatsapp_summary: "Migración automática desde hoja: " + sheetName
    };
    
    sendToSupabase(report);
  });
}

function getDayName(dateStr) {
  var parts = dateStr.split("/");
  var date = new Date(parts[2], parts[1] - 1, parts[0]);
  var days = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
  return days[date.getDay()];
}

function formatDate(date) {
  if (date instanceof Date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  if (typeof date === "string" && date.includes("/")) {
    var parts = date.split("/");
    return parts[2] + "-" + parts[1] + "-" + parts[0];
  }
  return date;
}

function sendToSupabase(report) {
  var url = SB_URL + "/rest/v1/reportes_diarios";
  var options = {
    method: "post",
    headers: {
      "apikey": SB_KEY,
      "Authorization": "Bearer " + SB_KEY,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    payload: JSON.stringify({
      report_date: report.header.date,
      data: report,
      status_level: report.epidemiology.status_level
    }),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  Logger.log("Row processed: " + report.header.date + " - Status: " + response.getResponseCode());
}
