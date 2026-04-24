import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { AuthContext } from '../types';
import { FileText, Copy, CheckCircle2, Share2, ClipboardCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  auth: AuthContext;
}

export const ReporteDiario: React.FC<Props> = ({ auth }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const hoy = new Date().toISOString().split('T')[0];
  const diaSemana = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(new Date()).toUpperCase();

  const reportData = useLiveQuery(async () => {
    const consultasHoy = await db.consultas.where('fecha').equals(hoy).toArray();
    const pacientesIds = consultasHoy.map(c => c.paciente_id);
    const pacientes = await db.pacientes.where('id').anyOf(pacientesIds).toArray();
    const config = await db.configuracion.get(1);
    
    // Stats calculation...
    const pacientesMap = new Map(pacientes.map(p => [p.id, p]));
    
    const stats = {
      total: consultasHoy.length,
      f: consultasHoy.filter(c => pacientesMap.get(c.paciente_id)?.sexo === 'F').length,
      m: consultasHoy.filter(c => pacientesMap.get(c.paciente_id)?.sexo === 'M').length,
      mg: consultasHoy.filter(c => c.especialidad === 'MEDICINA GENERAL').length,
      em: consultasHoy.filter(c => c.especialidad === 'EMERGENCIA').length,
      ped: consultasHoy.filter(c => c.especialidad === 'PEDIATRÍA').length,
      ger: consultasHoy.filter(c => c.especialidad === 'GERIATRÍA').length,
      mi: consultasHoy.filter(c => c.especialidad === 'MEDICINA INTERNA').length,
      gin: consultasHoy.filter(c => c.especialidad === 'GINECOLOGÍA').length,
      pre: consultasHoy.filter(c => c.especialidad === 'PRENATAL').length,
      enf: consultasHoy.filter(c => c.especialidad === 'ENFERMERÍA').length,
      
      actividades: {
        control_ta: consultasHoy.filter(c => c.tipo_actividad?.includes('control_ta')).length,
        control_glicemia: consultasHoy.filter(c => c.tipo_actividad?.includes('control_glicemia')).length,
        control_peso: consultasHoy.filter(c => c.tipo_actividad?.includes('control_peso')).length,
        talla: consultasHoy.filter(c => c.tipo_actividad?.includes('talla')).length,
        tto_ev: consultasHoy.filter(c => c.tipo_actividad?.includes('tto_ev')).length,
        tto_im: consultasHoy.filter(c => c.tipo_actividad?.includes('tto_im')).length,
        tto_sl: consultasHoy.filter(c => c.tipo_actividad?.includes('tto_sl')).length,
        tto_vo: consultasHoy.filter(c => c.tipo_actividad?.includes('tto_vo')).length,
        tto_sc: consultasHoy.filter(c => c.tipo_actividad?.includes('tto_sc')).length,
        protocolo: consultasHoy.filter(c => c.tipo_actividad?.includes('protocolo')).length,
        nebulizaciones: consultasHoy.filter(c => c.tipo_actividad?.includes('nebulizaciones')).length,
        curas: consultasHoy.filter(c => c.tipo_actividad?.includes('curas')).length,
        suturas: consultasHoy.filter(c => c.tipo_actividad?.includes('suturas')).length,
        retiro_puntos: consultasHoy.filter(c => c.tipo_actividad?.includes('retiro_puntos')).length,
        sondas: consultasHoy.filter(c => c.tipo_actividad?.includes('sondas')).length,
        lavado_ocular: consultasHoy.filter(c => c.tipo_actividad?.includes('lavado_ocular')).length,
        lavado_nasal: consultasHoy.filter(c => c.tipo_actividad?.includes('lavado_nasal')).length,
        lavado_oidos: consultasHoy.filter(c => c.tipo_actividad?.includes('lavado_oidos')).length,
        electros: consultasHoy.filter(c => c.tipo_actividad?.includes('electros')).length,
        visitas: consultasHoy.filter(c => c.tipo_actividad?.includes('visitas')).length,
        jornadas: consultasHoy.filter(c => c.tipo_actividad?.includes('jornadas')).length,
        ayudas: consultasHoy.filter(c => c.tipo_actividad?.includes('ayudas')).length,
        vacunas: consultasHoy.filter(c => c.tipo_actividad?.includes('vacunas')).length,
      },
      
      programas: {
        cardio: consultasHoy.filter(c => c.programa_salud?.includes('Cardiovascular')).length,
        diabetes: consultasHoy.filter(c => c.programa_salud?.includes('Diabetes')).length,
        asma: consultasHoy.filter(c => c.programa_salud?.includes('Asma')).length,
        ira: consultasHoy.filter(c => c.programa_salud?.includes('IRA')).length,
        embarazada: consultasHoy.filter(c => c.programa_salud?.includes('Embarazada')).length,
        covid: consultasHoy.filter(c => c.programa_salud?.includes('COVID-19')).length,
        fiebre: consultasHoy.filter(c => c.programa_salud?.includes('Fiebre')).length,
        dengue: consultasHoy.filter(c => c.programa_salud?.includes('Dengue')).length,
        zika: consultasHoy.filter(c => c.programa_salud?.includes('Zika')).length,
        chicungunya: consultasHoy.filter(c => c.programa_salud?.includes('Chicungunya')).length,
        varicela: consultasHoy.filter(c => c.programa_salud?.includes('Varicela')).length,
        rubeola: consultasHoy.filter(c => c.programa_salud?.includes('Rubeola')).length,
        sarampion: consultasHoy.filter(c => c.programa_salud?.includes('Sarampión')).length,
        h1n1: consultasHoy.filter(c => c.programa_salud?.includes('H1N1')).length,
        mordedura: consultasHoy.filter(c => c.programa_salud?.includes('Mordedura Canina')).length,
      },
      
      referencias: consultasHoy.filter(c => c.referido_a && c.referido_a !== '').length,
      refAmbulancia: consultasHoy.filter(c => c.referido_a?.toLowerCase().includes('ambulancia')).length,
    };

    return { stats, config, consultasHoy };
  }, [hoy]);

  const copiarPortapapeles = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setCopied(tipo);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!reportData) return null;

  const { stats, config } = reportData;

  const reporteEnfermeria = `⚕️ Morbilidad diaria
*Fecha:*${hoy}*
*Día: *${diaSemana}*

*1. Pacientes Atendidos: ${stats.total}
Femenino : ${stats.f}
Masculino: ${stats.m}
Medicina General: ${stats.mg}
 Emergencia: ${stats.em}
Pediatría: ${stats.ped}
Geriatría: ${stats.ger}
Medicina Interna:${stats.mi}
Ginecologia:${stats.gin}
Prenatal: ${stats.pre}
Enfermería: ${stats.enf}
*2. Por Actividades*
▪️Control de T/A: ${stats.actividades.control_ta}
▪️Control de: glicemia:${stats.actividades.control_glicemia}
▪️Control peso: ${stats.actividades.control_peso}
▪️Talla: ${stats.actividades.talla}
💉Tto E/V : ${stats.actividades.tto_ev}
💉Tto I/M: ${stats.actividades.tto_im}
💉Tto S/L: ${stats.actividades.tto_sl}
💉Tto V/O: ${stats.actividades.tto_vo}
💉Tto :S/C: ${stats.actividades.tto_sc}
  Tto: protocolo ${stats.actividades.protocolo}
▪️Nebulizaciones: ${stats.actividades.nebulizaciones}
▪️Curas: ${stats.actividades.curas}
➖Suturas: ${stats.actividades.suturas}
--Retiro de puntos: ${stats.actividades.retiro_puntos}
_Sondas: ${stats.actividades.sondas}
 -Lavado ocular : ${stats.actividades.lavado_ocular}
-Lavado nasal: ${stats.actividades.lavado_nasal}
 - Lavado de oidos:${stats.actividades.lavado_oidos}
 _Electros: ${stats.actividades.electros}
▪️Visitas domiciliares: ${stats.actividades.visitas}
▪️Jornadas especiales: ${stats.actividades.jornadas}
▪️Entregas de ayudas: ${stats.actividades.ayudas}
▪️💉 Vacunas de rutinas: ${stats.actividades.vacunas}
*3-Por Grupo Etario*
➖Lactante 0 a 2 años : 0
➖Preescolar 3 a 5 años : 0
➖Escolares 6 a 11 años: 0
➖Adolescente 12 a 18: 0
➖Adulto 19 a 59 años: 0
➖Adulto mayor 60 años o más: 0
▪️ Referencia de casos: ${stats.referencias}
Por Ambulancia de Más salud: ${stats.refAmbulancia}
 Por sus propios medios: ${stats.referencias - stats.refAmbulancia}
*4- Por Programa de Salud*
▪️ Cardiovascular: ${stats.programas.cardio}
▪️ Diabetes: ${stats.programas.diabetes}
▪️Asma: ${stats.programas.asma}
▪️IRA: ${stats.programas.ira}
▪️ Embarazada: ${stats.programas.embarazada}
▪|Casos sospechoso de COVID-19 😷: ${stats.programas.covid}
▪️ Fiebre ${stats.programas.fiebre}
 Dengue: ${stats.programas.dengue}
▪️ Fiebre 🦟 Zika: ${stats.programas.zika}
▪️Fiebre 🦟 Chicungunya: ${stats.programas.chicungunya}
▪️Casos de Varicela: ${stats.programas.varicela}
▪️Casos de Rubeola: ${stats.programas.rubeola}
▪️Casos de Sarampión: ${stats.programas.sarampion}
▪️Casos de H1N1: ${stats.programas.h1n1}
▪️Casos de mordeduras canina: ${stats.programas.mordedura}

▪️💉 *Responsables del Reporte : ${auth.role === 'enfermeria' ? auth.userName : config?.enfermera_guardia_default || ''}
Consulta Médico General: ${auth.role === 'medico' ? auth.userName : config?.medico_guardia_default || ''}*`;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <FileText className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">Generar Reportes</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Estadísticas diarias automatizadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Reporte Enfermeria */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 flex flex-col">
          <div className="flex justify-between items-center bg-emerald-50 p-6 rounded-3xl -mt-2 -mx-2 border border-emerald-100">
            <h3 className="font-black text-emerald-800 uppercase tracking-tighter text-xl">Reporte Enfermería</h3>
            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">WhatsApp</span>
          </div>
          <div className="flex-1 bg-slate-50 p-6 rounded-3xl border border-slate-100 font-mono text-[11px] overflow-auto max-h-96 whitespace-pre-wrap leading-relaxed select-all">
            {reporteEnfermeria}
          </div>
          <button 
            onClick={() => copiarPortapapeles(reporteEnfermeria, 'enf')}
            className={`w-full py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all ${copied === 'enf' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200 scale-95' : 'bg-slate-900 text-white shadow-2xl shadow-slate-300'}`}
          >
            {copied === 'enf' ? <ClipboardCheck className="w-7 h-7" /> : <Copy className="w-7 h-7" />}
            {copied === 'enf' ? '¡COPIADO!' : 'COPIAR REPORTE'}
          </button>
        </motion.div>

        {/* Placeholder para Reporte Médico */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 flex flex-col opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
          <div className="flex justify-between items-center bg-blue-50 p-6 rounded-3xl -mt-2 -mx-2 border border-blue-100">
            <h3 className="font-black text-blue-800 uppercase tracking-tighter text-xl">Reporte Médico</h3>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">Próximamente</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
             <Share2 className="w-16 h-16 text-slate-200" />
             <p className="text-slate-400 font-black uppercase text-sm tracking-widest">El reporte médico detallado se está procesando...</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
