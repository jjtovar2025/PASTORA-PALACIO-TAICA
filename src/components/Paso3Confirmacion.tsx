import React, { useState } from 'react';
import { Paciente, Consulta, AuthContext } from '../types';
import { db } from '../db';
import { CheckCircle2, ChevronLeft, User, Activity, Stethoscope, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  paciente: Paciente;
  consulta: Partial<Consulta>;
  config: any;
  auth: AuthContext;
  onBack: () => void;
  onFinish: () => void;
}

export const Paso3Confirmacion: React.FC<Props> = ({ paciente, consulta, config, auth, onBack, onFinish }) => {
  const [isSaving, setIsSaving] = useState(false);

  const guardarConsulta = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const finalConsulta: Consulta = {
        ...consulta as Consulta,
        paciente_id: paciente.id!,
        fecha: new Date().toISOString().split('T')[0],
        hora_ingreso: consulta.hora_ingreso || new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }),
        medico_guardia: auth.role === 'medico' ? auth.userName : config.medico_guardia_default || 'NO ESPECIFICADO',
        enfermera_guardia: auth.role === 'enfermeria' ? auth.userName : config.enfermera_guardia_default || 'NO ESPECIFICADO',
        centro_nombre: config.nombre_centro,
        centro_asic: config.asic,
        centro_parroquia: config.parroquia,
        es_menor: paciente.es_menor,
        nombre_menor: paciente.es_menor ? paciente.nombre_menor || '' : '',
        estado_sincronizacion: 'pendiente'
      };

      await db.consultas.add(finalConsulta);
      onFinish();
    } catch (error) {
      console.error('Error guardando consulta:', error);
      alert('Error al guardar la consulta.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
        <div className="flex items-center gap-4 text-emerald-600">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black tracking-tight uppercase leading-none">Resumen de Consulta</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" /> Datos del Paciente
            </h4>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-xl font-black text-slate-800 uppercase leading-none">
                {paciente.es_menor ? paciente.nombre_menor : `${paciente.nombres} ${paciente.apellidos}`}
              </p>
              <p className="text-xs font-bold text-slate-500 mt-2">C.I. Rep: {paciente.cedula_representante}</p>
              <div className="flex gap-4 mt-4">
                <div className="bg-white px-3 py-1 rounded-full border border-slate-200 text-[10px] font-black">{paciente.sexo === 'F' ? 'FEMENINO' : 'MASCULINO'}</div>
                <div className="bg-white px-3 py-1 rounded-full border border-slate-200 text-[10px] font-black">{paciente.es_menor ? 'MENOR DE EDAD' : 'ADULTO'}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3" /> Signos Vitales
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <StatItem label="P.A." value={`${consulta.pa_sistolica || '--'}/${consulta.pa_diastolica || '--'}`} />
              <StatItem label="TEMP." value={`${consulta.temp_c || '--'} ºC`} />
              <StatItem label="FC" value={`${consulta.fc || '--'} lpm`} />
              <StatItem label="SpO2" value={`${consulta.spo2 || '--'} %`} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Stethoscope className="w-3 h-3" /> Diagnóstico y Tratamiento
          </h4>
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-4">
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Diagnóstico</p>
              <p className="font-bold text-blue-900">{consulta.diagnostico || 'SIN ESPECIFICAR'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-100">
               <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Tto Colocado</p>
                <p className="text-sm font-bold text-blue-800">{consulta.tratamiento_colocado || 'NINGUNO'}</p>
               </div>
               <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Referencia</p>
                <p className="text-sm font-bold text-blue-800">{consulta.referido_a || 'SIN REFERENCIA'}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrado por</p>
              <p className="text-sm font-black uppercase text-blue-100">{auth.userName} ({auth.role})</p>
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="flex-1 bg-white border-2 border-slate-200 text-slate-400 py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
          <ChevronLeft /> CORREGIR
        </button>
        <button 
          onClick={guardarConsulta} 
          disabled={isSaving}
          className={`flex-[2] py-6 rounded-3xl font-black text-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${
            isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'
          }`}
        >
          {isSaving ? <Loader2 className="animate-spin" /> : 'FINALIZAR Y GUARDAR'}
          {!isSaving && <CheckCircle2 />}
        </button>
      </div>
    </div>
  );
};

const StatItem = ({ label, value }: any) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-lg font-black text-slate-700">{value}</p>
  </div>
);
