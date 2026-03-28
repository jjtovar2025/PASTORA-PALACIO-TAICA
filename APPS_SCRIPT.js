/**
 * Google Apps Script for Google Sheets integration.
 * 
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1BO1ewJ2OmRLipbuA4tY5p6maWE3sMOsWlps_MsiShnk/edit
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code.
 * 4. Deploy as Web App (Execute as: Me, Who has access: Anyone).
 */

/*
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Morbilidad") || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    // Append row
    sheet.appendRow([
      data.registro.fecha,
      data.registro.dia,
      data.registro.responsable,
      data.registro.medicos.join(", "),
      data.registro.semaforo,
      data.totales.pacientes,
      data.totales.femenino,
      data.totales.masculino,
      data.totales.med_general,
      data.totales.med_interna,
      data.totales.otros,
      data.enfermeria.control_ta,
      data.enfermeria.glicemia,
      data.enfermeria.peso,
      data.enfermeria.talla,
      data.enfermeria.inyectable_ev,
      data.enfermeria.inyectable_im,
      data.enfermeria.curas,
      data.enfermeria.otros_procederes,
      data.etario["0_18"],
      data.etario["19_59"],
      data.etario["60_mas"],
      data.alertas_epidemiologicas.cardiovascular,
      data.alertas_epidemiologicas.diabetes,
      data.alertas_epidemiologicas.ira_asma,
      data.alertas_epidemiologicas.fiebre_dengue,
      data.alertas_epidemiologicas.casos_criticos
    ]);
    
    // Alert if RED
    if (data.registro.semaforo === "ROJO") {
      MailApp.sendEmail({
        to: "jjtovar2025@gmail.com", // User email
        subject: "⚠️ ALERTA EPIDEMIOLÓGICA CRÍTICA - " + data.registro.fecha,
        body: "Se ha registrado un reporte con semáforo ROJO.\nResponsable: " + data.registro.responsable + "\nDetalles: " + JSON.stringify(data.alertas_epidemiologicas)
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/
