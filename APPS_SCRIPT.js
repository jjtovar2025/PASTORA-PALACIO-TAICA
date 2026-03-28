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
    
    // Append row to Google Sheets
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
 * Run this function manually to migrate existing data from the Sheet to Supabase.
 */
function migrateToSupabase() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Morbilidad") || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  
  // Skip header row
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue; // Skip empty rows
    
    var report = {
      header: {
        date: formatDate(row[0]),
        day: row[1],
        staff_enfermeria: row[2],
        doctor_general: (row[3] || "").split(",")[0] || "",
        doctor_specialist: (row[3] || "").split(",")[1] || ""
      },
      stats: {
        total_patients: Number(row[5] || 0),
        female: Number(row[6] || 0),
        male: Number(row[7] || 0),
        med_general: Number(row[8] || 0),
        med_interna: Number(row[9] || 0),
        emergencia: 0, pediatria: 0, geriatria: 0, ginecologia: 0, prenatal: 0
      },
      activities: {
        ta_control: Number(row[11] || 0),
        glicemia: Number(row[12] || 0),
        peso: Number(row[13] || 0),
        talla: Number(row[14] || 0),
        tto_ev: Number(row[15] || 0),
        tto_im: Number(row[16] || 0),
        curas: Number(row[17] || 0),
        nebulizaciones: 0, suturas: 0, retiro_puntos: 0, sondas: 0
      },
      age_groups: {
        lactante_0_2: 0, preescolar_3_5: 0, escolar_6_11: 0, adolescente_12_17: Number(row[19] || 0),
        adulto_joven_18_29: 0, adulto_30_59: Number(row[20] || 0),
        adulto_mayor_60: Number(row[21] || 0)
      },
      references: { ambulancia_mas_salud: 0, propios_medios: 0 },
      epidemiology: {
        cardiovascular: Number(row[22] || 0),
        diabetes: Number(row[23] || 0),
        ira: Number(row[24] || 0),
        asma: 0, embarazada: 0, covid_19: 0, fiebre: Number(row[25] || 0), dengue: 0, zika: 0, chicungunya: 0, varicela: 0, rubeola: 0, sarampion: 0, h1n1: 0, mordeduras_canina: 0, diarreas: 0, amigdalitis: 0, hipertension: 0, otros: 0,
        status_level: row[4] || "STABLE"
      },
      whatsapp_summary: "Migración histórica"
    };
    
    sendToSupabase(report);
  }
}

function formatDate(date) {
  if (date instanceof Date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
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
