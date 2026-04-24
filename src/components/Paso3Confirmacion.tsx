import React from 'react';
import { Consulta, Paciente, Configuracion } from '../types';
import { Check, ChevronLeft, Save, User, Activity, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  paciente: Paciente;
  consulta: Partial<Consulta>;
  config: Configuracion;
  onBack: () => void;
  onSave: () => void;
}

export const Paso3Confirmacion: React.FC<Props> = ({ paciente, consulta, config, onBack, onSave }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">Resumen de Consulta</h3>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Verifique los datos antes de guardar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs flex items-center gap-2">
              <User className="w-4 h-4" /> Paciente
            </h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xl font-black text-slate-800">{paciente.nombres} {paciente.apellidos}</p>
              <p className="font-bold text-slate-500">C.I.: {paciente.cedula}</p>
              <p className="text-sm text-slate-400 mt-2">{paciente.parroquia}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs flex items-center gap-2">
              <Activity className="w-4 h-4" /> Signos Vitales
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase">Tensión</p>
                <p className="font-black text-lg">{consulta.pa_sistolica}/{consulta.pa_diastolica}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase">Temp</p>
                <p className="font-black text-lg">{consulta.temp_c}ºC</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase">SpO2</p>
                <p className="font-black text-lg">{consulta.spo2}%</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase">FC</p>
                <p className="font-black text-lg">{consulta.fc} lpm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs flex items-center gap-2">
            <FileText className="w-4 h-4" /> Detalles Médicos
          </h4>
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Motivo</p>
              <p className="font-bold text-slate-800">{consulta.motivo_consulta}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Especialidad</p>
                <p className="font-bold text-blue-600">{consulta.especialidad}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Diagnóstico</p>
                <p className="font-bold text-slate-800">{consulta.diagnostico}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Centro</p>
              <p className="font-bold text-slate-600">{config.nombre_centro} - {config.parroquia}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={onBack}
          className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-2"
        >
          <ChevronLeft /> VOLVER
        </button>
        <button 
          onClick={onSave}
          className="flex-[2] bg-emerald-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 uppercase transition-all active:scale-95"
        >
          <Save className="w-6 h-6" /> GUARDAR CONSULTA
        </button>
      </div>
    </div>
  );
};
