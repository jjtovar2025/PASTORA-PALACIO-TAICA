import React, { useState, useEffect } from 'react';
import { HealthReport } from '../types';
import { saveReport } from '../lib/supabase';
import { Loader2, Send, MessageSquare, Save, User, Activity, Users, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

interface ManualReportFormProps {
  onSuccess: (report: HealthReport) => void;
  phoneNumbers: string[];
}

export const ManualReportForm: React.FC<ManualReportFormProps> = ({ onSuccess, phoneNumbers }) => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('header');
  const [showWhatsAppOptions, setShowWhatsAppOptions] = useState(false);
  const [lastReport, setLastReport] = useState<HealthReport | null>(null);
  
  const [formData, setFormData] = useState<Partial<HealthReport>>({
    header: {
      date: new Date().toISOString().split('T')[0],
      day: new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(new Date()).toUpperCase(),
      staff_enfermeria: '',
      doctor_general: '',
      doctor_specialist: ''
    },
    stats: {
      total_patients: 0,
      female: 0,
      male: 0,
      med_general: 0,
      emergencia: 0,
      pediatria: 0,
      geriatria: 0,
      med_interna: 0,
      ginecologia: 0,
      prenatal: 0
    },
    activities: {
      ta_control: 0,
      glicemia: 0,
      peso: 0,
      talla: 0,
      tto_ev: 0,
      tto_im: 0,
      tto_sl: 0,
      tto_vo: 0,
      tto_sc: 0,
      tto_protocolo: 0,
      nebulizaciones: 0,
      curas: 0,
      suturas: 0,
      retiro_puntos: 0,
      sondas: 0,
      lavado_ocular: 0,
      lavado_nasal: 0,
      lavado_oidos: 0,
      electros: 0,
      visitas_domiciliares: 0,
      jornadas_especiales: 0,
      entregas_ayudas: 0,
      vacunas_rutina: 0
    },
    age_groups: {
      lactante_0_2: 0,
      preescolar_3_5: 0,
      escolar_6_11: 0,
      adolescente_12_17: 0,
      adulto_joven_18_29: 0,
      adulto_30_59: 0,
      adulto_mayor_60: 0
    },
    references: {
      ambulancia_mas_salud: 0,
      propios_medios: 0
    },
    epidemiology: {
      cardiovascular: 0,
      diabetes: 0,
      asma: 0,
      ira: 0,
      embarazada: 0,
      covid_19: 0,
      fiebre: 0,
      dengue: 0,
      zika: 0,
      chicungunya: 0,
      varicela: 0,
      rubeola: 0,
      sarampion: 0,
      h1n1: 0,
      mordeduras_canina: 0,
      diarreas: 0,
      amigdalitis: 0,
      hipertension: 0,
      otros: 0,
      status_level: 'STABLE'
    }
  });

  // Auto-calculate total patients
  useEffect(() => {
    const s = formData.stats;
    if (s) {
      const total = (s.med_general || 0) + (s.emergencia || 0) + (s.pediatria || 0) + 
                    (s.geriatria || 0) + (s.med_interna || 0) + (s.ginecologia || 0) + (s.prenatal || 0);
      if (total !== s.total_patients) {
        setFormData(prev => ({
          ...prev,
          stats: { ...prev.stats!, total_patients: total }
        }));
      }
    }
  }, [formData.stats]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: value
      }
    }));
  };

  const generateWhatsAppText = (data: HealthReport) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    return `Morbilidad diaria 
*Centro + Salud. Pastora Palacios Taica*
*Fecha:* ${data.header.date.split('-').reverse().join('/')}
*Día:* ${data.header.day}

*1. Pacientes Atendidos: ${data.stats.total_patients}*
Femenino: ${pad(data.stats.female)}
Masculino: ${pad(data.stats.male)}
Medicina General: ${pad(data.stats.med_general)}
Emergencia: ${pad(data.stats.emergencia)}
Pediatría: ${pad(data.stats.pediatria)}
Geriatría: ${pad(data.stats.geriatria)}
Medicina Interna: ${pad(data.stats.med_interna)}
Ginecología: ${pad(data.stats.ginecologia)}
Prenatal: ${pad(data.stats.prenatal)}
Enfermería:

*2. Por Actividades*
▪️Control de T/A: ${pad(data.activities.ta_control)}
▪️Control de: glicemia:${pad(data.activities.glicemia)}
▪️Control peso: ${pad(data.activities.peso)}
▪️Talla: ${pad(data.activities.talla)}
💉Tto E/V : ${pad(data.activities.tto_ev)}
💉Tto I/M: ${pad(data.activities.tto_im)}
💉Tto S/L: ${pad(data.activities.tto_sl)}
💉Tto V/O: ${pad(data.activities.tto_vo)}
💉Tto :S/C: ${pad(data.activities.tto_sc)}
  Tto: protocolo ${pad(data.activities.tto_protocolo)}
▪️Nebulizaciones: ${pad(data.activities.nebulizaciones)}
▪️Curas: ${pad(data.activities.curas)}
➖Suturas: ${pad(data.activities.suturas)}
--Retiro de puntos: ${pad(data.activities.retiro_puntos)}
_Sondas: ${pad(data.activities.sondas)}.      
 -Lavado ocular : ${pad(data.activities.lavado_ocular)} 
-Lavado nasal: ${pad(data.activities.lavado_nasal)}
 - Lavado de oidos:${pad(data.activities.lavado_oidos)}
 _Electros: ${pad(data.activities.electros)}
▪️Visitas domiciliares: ${pad(data.activities.visitas_domiciliares)}
▪️Jornadas especiales: ${pad(data.activities.jornadas_especiales)}
▪️Entregas de ayudas: ${pad(data.activities.entregas_ayudas)}
▪️💉 Vacunas de rutinas: ${pad(data.activities.vacunas_rutina)}

*3-Por Grupo Etario*
➖Lactante 0 a 2 años : ${pad(data.age_groups.lactante_0_2)}
➖Preescolar 3 a 5 años : ${pad(data.age_groups.preescolar_3_5)}
➖Escolares 6 a 11 años: ${pad(data.age_groups.escolar_6_11)}
➖Adolescentes 12 a 17 años: ${pad(data.age_groups.adolescente_12_17)}
➖Adulto joven 18 a 29 años: ${pad(data.age_groups.adulto_joven_18_29)}
➖Adulto 30 a 59 años: ${pad(data.age_groups.adulto_30_59)}
➖Adulto mayor 60 y más: ${pad(data.age_groups.adulto_mayor_60)}

▪️ Referencia de casos: ${pad(data.references.ambulancia_mas_salud + data.references.propios_medios)}
Por Ambulancia de Más salud: ${pad(data.references.ambulancia_mas_salud)}
Por sus propios medios: ${pad(data.references.propios_medios)}

*4- Por Programa de Salud*
▪️ Cardiovascular: ${pad(data.epidemiology.cardiovascular)}
▪️ Diabetes: ${pad(data.epidemiology.diabetes)}
▪️Asma: ${pad(data.epidemiology.asma)}
▪️IRA: ${pad(data.epidemiology.ira)}
▪️ Embarazada: ${pad(data.epidemiology.embarazada)}
▪️Casos sospechoso de COVID-19 😷: ${pad(data.epidemiology.covid_19)}
▪️ Fiebre: ${pad(data.epidemiology.fiebre)}
Dengue: ${pad(data.epidemiology.dengue)}
▪️ Fiebre 🦟 Zika: ${pad(data.epidemiology.zika)}
▪️Fiebre 🦟 Chicungunya: ${pad(data.epidemiology.chicungunya)}
▪️Casos de Varicela: ${pad(data.epidemiology.varicela)}
▪️Casos de Rubeola: ${pad(data.epidemiology.rubeola)}
▪️Casos de Sarampión: ${pad(data.epidemiology.sarampion)}
▪️Casos de H1N1: ${pad(data.epidemiology.h1n1)}
▪️Casos de mordeduras canina: ${pad(data.epidemiology.mordeduras_canina)}
▪️Diarreas: ${pad(data.epidemiology.diarreas)}
▪️Amigdalitis: ${pad(data.epidemiology.amigdalitis)}
▪️Hipertensión: ${pad(data.epidemiology.hipertension)}
▪️Otros: ${pad(data.epidemiology.otros)}

▪️💉 *Responsables del Reporte:* ${data.header.staff_enfermeria}
Consulta Médico General: ${data.header.doctor_general}
Especialista: ${data.header.doctor_specialist}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalReport = {
        ...formData,
        whatsapp_summary: generateWhatsAppText(formData as HealthReport)
      } as HealthReport;

      // 1. Save to Supabase
      try {
        await saveReport(finalReport);
      } catch (err: any) {
        console.error('Error saving to Supabase:', err);
        alert(`AVISO: No se pudo guardar en Supabase: ${err.message}. El proceso continuará para WhatsApp.`);
      }

      // 2. Send to Apps Script
      const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
      if (appsScriptUrl) {
        try {
          await fetch(appsScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalReport)
          });
        } catch (err) {
          console.error('Error sending to Apps Script:', err);
        }
      }

      // 3. Prepare for WhatsApp
      setLastReport(finalReport);
      setShowWhatsAppOptions(true);

      onSuccess(finalReport);
    } catch (err: any) {
      console.error('Error general:', err);
      alert(`Error crítico: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ id, title, icon: Icon }: { id: string, title: string, icon: any }) => (
    <button
      type="button"
      onClick={() => setActiveSection(activeSection === id ? '' : id)}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all mb-2 ${
        activeSection === id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-bold">{title}</span>
      </div>
      {activeSection === id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </button>
  );

  const InputField = ({ label, section, field, type = "number", placeholder = "" }: any) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{label}</label>
      <input
        type={type}
        value={(formData as any)[section][field]}
        onChange={(e) => handleInputChange(section, field, type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      {/* HEADER */}
      <SectionHeader id="header" title="Encabezado y Personal" icon={User} />
      {activeSection === 'header' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2">
          <InputField label="Fecha" section="header" field="date" type="date" />
          <InputField label="Día" section="header" field="day" type="text" />
          <InputField label="Responsable Enfermería" section="header" field="staff_enfermeria" type="text" placeholder="Ej: JEXURY RIO" />
          <InputField label="Médico General" section="header" field="doctor_general" type="text" placeholder="Ej: Dr. Lesther Rivas" />
          <InputField label="Especialista" section="header" field="doctor_specialist" type="text" placeholder="Ej: Dr. Eli Marrero" />
        </div>
      )}

      {/* STATS */}
      <SectionHeader id="stats" title="Pacientes Atendidos" icon={Users} />
      {activeSection === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="col-span-2 md:col-span-3 bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center">
            <span className="font-bold text-blue-800">TOTAL ATENDIDOS:</span>
            <span className="text-2xl font-black text-blue-600">{formData.stats?.total_patients}</span>
          </div>
          <InputField label="Femenino" section="stats" field="female" />
          <InputField label="Masculino" section="stats" field="male" />
          <InputField label="Medicina General" section="stats" field="med_general" />
          <InputField label="Emergencia" section="stats" field="emergencia" />
          <InputField label="Pediatría" section="stats" field="pediatria" />
          <InputField label="Geriatría" section="stats" field="geriatria" />
          <InputField label="Medicina Interna" section="stats" field="med_interna" />
          <InputField label="Ginecología" section="stats" field="ginecologia" />
          <InputField label="Prenatal" section="stats" field="prenatal" />
        </div>
      )}

      {/* ACTIVITIES */}
      <SectionHeader id="activities" title="Actividades de Enfermería" icon={Activity} />
      {activeSection === 'activities' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <InputField label="Control T/A" section="activities" field="ta_control" />
          <InputField label="Glicemia" section="activities" field="glicemia" />
          <InputField label="Peso" section="activities" field="peso" />
          <InputField label="Talla" section="activities" field="talla" />
          <InputField label="Tto E/V" section="activities" field="tto_ev" />
          <InputField label="Tto I/M" section="activities" field="tto_im" />
          <InputField label="Tto S/L" section="activities" field="tto_sl" />
          <InputField label="Tto V/O" section="activities" field="tto_vo" />
          <InputField label="Tto S/C" section="activities" field="tto_sc" />
          <InputField label="Tto Protocolo" section="activities" field="tto_protocolo" />
          <InputField label="Nebulizaciones" section="activities" field="nebulizaciones" />
          <InputField label="Curas" section="activities" field="curas" />
          <InputField label="Suturas" section="activities" field="suturas" />
          <InputField label="Retiro Puntos" section="activities" field="retiro_puntos" />
          <InputField label="Sondas" section="activities" field="sondas" />
          <InputField label="Lavado Ocular" section="activities" field="lavado_ocular" />
          <InputField label="Lavado Nasal" section="activities" field="lavado_nasal" />
          <InputField label="Lavado Oídos" section="activities" field="lavado_oidos" />
          <InputField label="Electros" section="activities" field="electros" />
          <InputField label="Visitas Dom." section="activities" field="visitas_domiciliares" />
          <InputField label="Jornadas" section="activities" field="jornadas_especiales" />
          <InputField label="Ayudas" section="activities" field="entregas_ayudas" />
          <InputField label="Vacunas" section="activities" field="vacunas_rutina" />
        </div>
      )}

      {/* AGE GROUPS */}
      <SectionHeader id="age" title="Grupo Etario" icon={Users} />
      {activeSection === 'age' && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <InputField label="Lactante (0-2)" section="age_groups" field="lactante_0_2" />
          <InputField label="Preescolar (3-5)" section="age_groups" field="preescolar_3_5" />
          <InputField label="Escolar (6-11)" section="age_groups" field="escolar_6_11" />
          <InputField label="Adolescente (12-17)" section="age_groups" field="adolescente_12_17" />
          <InputField label="Adulto Joven (18-29)" section="age_groups" field="adulto_joven_18_29" />
          <InputField label="Adulto (30-59)" section="age_groups" field="adulto_30_59" />
          <InputField label="Adulto Mayor (60+)" section="age_groups" field="adulto_mayor_60" />
        </div>
      )}

      {/* EPIDEMIOLOGY */}
      <SectionHeader id="epi" title="Vigilancia Epidemiológica" icon={ShieldAlert} />
      {activeSection === 'epi' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <InputField label="Cardiovascular" section="epidemiology" field="cardiovascular" />
          <InputField label="Diabetes" section="epidemiology" field="diabetes" />
          <InputField label="Asma" section="epidemiology" field="asma" />
          <InputField label="IRA" section="epidemiology" field="ira" />
          <InputField label="Embarazada" section="epidemiology" field="embarazada" />
          <InputField label="COVID-19" section="epidemiology" field="covid_19" />
          <InputField label="Fiebre" section="epidemiology" field="fiebre" />
          <InputField label="Dengue" section="epidemiology" field="dengue" />
          <InputField label="Zika" section="epidemiology" field="zika" />
          <InputField label="Chicungunya" section="epidemiology" field="chicungunya" />
          <InputField label="Varicela" section="epidemiology" field="varicela" />
          <InputField label="Rubeola" section="epidemiology" field="rubeola" />
          <InputField label="Sarampión" section="epidemiology" field="sarampion" />
          <InputField label="H1N1" section="epidemiology" field="h1n1" />
          <InputField label="Mordedura Canina" section="epidemiology" field="mordeduras_canina" />
          <InputField label="Diarreas" section="epidemiology" field="diarreas" />
          <InputField label="Amigdalitis" section="epidemiology" field="amigdalitis" />
          <InputField label="Hipertensión" section="epidemiology" field="hipertension" />
          <InputField label="Otros" section="epidemiology" field="otros" />
          
          <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Estado Alerta</label>
            <select
              value={formData.epidemiology?.status_level}
              onChange={(e) => handleInputChange('epidemiology', 'status_level', e.target.value)}
              className="p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            >
              <option value="STABLE">🟢 ESTABLE</option>
              <option value="WARNING">🟡 ADVERTENCIA</option>
              <option value="CRITICAL">🔴 CRÍTICO</option>
            </select>
          </div>
        </div>
      )}

      <div className="pt-6">
        {showWhatsAppOptions && lastReport ? (
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl animate-in zoom-in-95 duration-300">
            <h3 className="text-emerald-900 font-black text-center mb-4 uppercase tracking-widest text-sm">¡Reporte Guardado! Enviar a:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {phoneNumbers.map((phone, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const encodedText = encodeURIComponent(lastReport.whatsapp_summary);
                    const cleanPhone = phone.replace(/\D/g, '');
                    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 px-6 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  <MessageSquare className="w-5 h-5" />
                  {phone}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const encodedText = encodeURIComponent(lastReport.whatsapp_summary);
                  window.open(`https://wa.me/?text=${encodedText}`, '_blank');
                }}
                className="flex items-center justify-center gap-3 bg-slate-600 text-white py-4 px-6 rounded-2xl font-black text-sm hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
              >
                <Send className="w-5 h-5" />
                OTRO CONTACTO
              </button>
            </div>
            <button 
              type="button"
              onClick={() => setShowWhatsAppOptions(false)}
              className="w-full mt-4 text-emerald-600 font-bold text-xs uppercase tracking-widest hover:underline"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-200 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-6 h-6" />
                Guardando Reporte...
              </>
            ) : (
              <>
                <MessageSquare className="w-6 h-6" />
                Finalizar y Enviar WhatsApp
              </>
            )}
          </button>
        )}
        <p className="text-center text-xs text-gray-400 mt-3">
          Se guardará en Supabase, Excel y se abrirá WhatsApp automáticamente.
        </p>
      </div>
    </form>
  );
};
