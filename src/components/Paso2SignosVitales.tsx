import React from 'react';
import { Consulta, Paciente } from '../types';
import { Activity, Thermometer, Heart, Weight, Ruler, ClipboardList, Stethoscope, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  paciente: Paciente;
  consulta: Partial<Consulta>;
  onUpdate: (data: Partial<Consulta>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CardField = ({ icon: Icon, label, children, color = "blue" }: any) => (
  <div className={`p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2 border-l-4 border-l-${color}-500`}>
    <div className="flex items-center gap-2 text-slate-400">
      <Icon className="w-4 h-4" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    {children}
  </div>
);

export const Paso2SignosVitales: React.FC<Props> = ({ paciente, consulta, onUpdate, onNext, onBack }) => {
  const handleChange = (field: keyof Consulta, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center font-black text-blue-600">
          {paciente.nombres[0]}{paciente.apellidos[0]}
        </div>
        <div>
          <h4 className="font-black text-slate-800">{paciente.nombres} {paciente.apellidos}</h4>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">C.I.: {paciente.cedula}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CardField icon={Activity} label="Tensión Sistólica" color="red">
          <input 
            type="number" value={consulta.pa_sistolica || ''} 
            onChange={(e) => handleChange('pa_sistolica', parseInt(e.target.value))}
            placeholder="0" className="w-full text-2xl font-black focus:outline-none"
          />
        </CardField>
        <CardField icon={Activity} label="Tensión Diastólica" color="red">
          <input 
            type="number" value={consulta.pa_diastolica || ''} 
            onChange={(e) => handleChange('pa_diastolica', parseInt(e.target.value))}
            placeholder="0" className="w-full text-2xl font-black focus:outline-none"
          />
        </CardField>
        <CardField icon={Heart} label="Frec. Cardíaca" color="rose">
          <input 
            type="number" value={consulta.fc || ''} 
            onChange={(e) => handleChange('fc', parseInt(e.target.value))}
            placeholder="0" className="w-full text-2xl font-black focus:outline-none"
          />
        </CardField>
        <CardField icon={Activity} label="SpO2 %" color="blue">
          <input 
            type="number" value={consulta.spo2 || ''} 
            onChange={(e) => handleChange('spo2', parseInt(e.target.value))}
            placeholder="0" className="w-full text-2xl font-black focus:outline-none"
          />
        </CardField>
        <CardField icon={Thermometer} label="Temperatura ºC" color="orange">
          <input 
            type="number" step="0.1" value={consulta.temp_c || ''} 
            onChange={(e) => handleChange('temp_c', parseFloat(e.target.value))}
            placeholder="0.0" className="w-full text-2xl font-black focus:outline-none"
          />
        </CardField>
        <CardField icon={Weight} label="Peso Kg" color="purple">
          <input 
            type="number" step="0.1" value={consulta.peso || ''} 
            onChange={(e) => handleChange('peso', parseFloat(e.target.value))}
            placeholder="0.0" className="w-full text-2xl font-black focus:outline-none"
          />
        </CardField>
        <CardField icon={Ruler} label="Talla Cm" color="indigo">
          <input 
            type="number" value={consulta.talla || ''} 
            onChange={(e) => handleChange('talla', parseInt(e.target.value))}
            placeholder="0" className="w-full text-2xl font-black focus:outline-none"
          />
        </CardField>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
              <ClipboardList className="w-3 h-3" /> Motivo de Consulta *
            </label>
            <textarea 
              value={consulta.motivo_consulta || ''} 
              onChange={(e) => handleChange('motivo_consulta', e.target.value.toUpperCase())}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" rows={2}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
                <Stethoscope className="w-3 h-3" /> Especialidad
              </label>
              <select 
                value={consulta.especialidad || 'MEDICINA GENERAL'} 
                onChange={(e) => handleChange('especialidad', e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
              >
                <option value="MEDICINA GENERAL">MEDICINA GENERAL</option>
                <option value="PEDIATRIA">PEDIATRÍA</option>
                <option value="GERIATRIA">GERIATRÍA</option>
                <option value="GINECO-OBSTETRICIA">GINECO-OBSTETRICIA</option>
                <option value="EMERGENCIA">EMERGENCIA</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Diagnóstico / FEN</label>
              <input 
                type="text" value={consulta.diagnostico || ''} 
                onChange={(e) => handleChange('diagnostico', e.target.value.toUpperCase())}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Tratamiento Colocado (Centro)</label>
            <textarea 
              value={consulta.tratamiento_colocado || ''} 
              onChange={(e) => handleChange('tratamiento_colocado', e.target.value.toUpperCase())}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" rows={2}
            ></textarea>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Tratamiento Recetado (Casa)</label>
            <textarea 
              value={consulta.tratamiento_recetado || ''} 
              onChange={(e) => handleChange('tratamiento_recetado', e.target.value.toUpperCase())}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" rows={2}
            ></textarea>
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
          onClick={onNext}
          className="flex-[2] bg-blue-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 uppercase"
        >
          SIGUIENTE <ChevronRight />
        </button>
      </div>
    </div>
  );
};
