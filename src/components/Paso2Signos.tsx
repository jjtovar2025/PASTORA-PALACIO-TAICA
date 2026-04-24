import React, { useState } from 'react';
import { Consulta } from '../types';
import { Activity, ChevronLeft, ChevronRight, Weight, Thermometer, Droplets, Heart, Scale } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onBack: () => void;
  onNext: (datos: Partial<Consulta>) => void;
}

const ACTIVIDADES = [
  { id: 'control_ta', label: 'Control T/A', icon: '🩺' },
  { id: 'control_glicemia', label: 'Glicemia', icon: '🩸' },
  { id: 'control_peso', label: 'Peso/Talla', icon: '⚖️' },
  { id: 'tto_ev', label: 'Tto E/V', icon: '💉' },
  { id: 'tto_im', label: 'Tto I/M', icon: '💉' },
  { id: 'nebulizaciones', label: 'Nebulización', icon: '💨' },
  { id: 'curas', label: 'Cura/Sutura', icon: '🩹' },
  { id: 'visitas', label: 'Visita Dom.', icon: '🏠' },
];

export const Paso2Signos: React.FC<Props> = ({ onBack, onNext }) => {
  const [datos, setDatos] = useState<Partial<Consulta>>({
    peso: null, talla: null, fc: null, spo2: null, temp_c: null,
    pa_sistolica: null, pa_diastolica: null, motivo_consulta: '',
    tipo_actividad: []
  });

  const toggleActividad = (id: string) => {
    const current = datos.tipo_actividad || [];
    if (current.includes(id)) {
      setDatos({ ...datos, tipo_actividad: current.filter(cid => cid !== id) });
    } else {
      setDatos({ ...datos, tipo_actividad: [...current, id] });
    }
  };

  const calcularIMC = () => {
    if (datos.peso && datos.talla) {
      const metros = datos.talla / 100;
      return (datos.peso / (metros * metros)).toFixed(1);
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <Activity className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Signos Vitales y Actividades</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACTIVIDADES.map(act => (
            <button
              key={act.id}
              onClick={() => toggleActividad(act.id)}
              className={`p-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${
                datos.tipo_actividad?.includes(act.id)
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-blue-200'
              }`}
            >
              <span className="text-2xl">{act.icon}</span>
              {act.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputSigno label="Peso (Kg)" icon={Scale} value={datos.peso} onChange={v => setDatos({...datos, peso: v ? parseFloat(v) : null})} />
          <InputSigno label="Talla (Cm)" icon={Weight} value={datos.talla} onChange={v => setDatos({...datos, talla: v ? parseFloat(v) : null})} />
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IMC</label>
            <p className="text-3xl font-black text-slate-800">{calcularIMC() || '--'}</p>
          </div>
          
          <InputSigno label="P.A. Sistólica" icon={Activity} value={datos.pa_sistolica} onChange={v => setDatos({...datos, pa_sistolica: v ? parseFloat(v) : null})} color="text-red-600" />
          <InputSigno label="P.A. Diastólica" icon={Activity} value={datos.pa_diastolica} onChange={v => setDatos({...datos, pa_diastolica: v ? parseFloat(v) : null})} color="text-red-600" />
          <InputSigno label="F.C. (Lpm)" icon={Heart} value={datos.fc} onChange={v => setDatos({...datos, fc: v ? parseFloat(v) : null})} />
          
          <InputSigno label="SpO2 (%)" icon={Droplets} value={datos.spo2} onChange={v => setDatos({...datos, spo2: v ? parseFloat(v) : null})} />
          <InputSigno label="Temp. (ºC)" icon={Thermometer} value={datos.temp_c} onChange={v => setDatos({...datos, temp_c: v ? parseFloat(v) : null})} />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-black text-slate-800 uppercase tracking-tight ml-2">Motivo de Consulta</label>
          <textarea 
            value={datos.motivo_consulta}
            onChange={(e) => setDatos({...datos, motivo_consulta: e.target.value.toUpperCase()})}
            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold min-h-[120px] focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
            placeholder="Describa el motivo..."
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="flex-1 bg-white border-2 border-slate-200 text-slate-400 py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
          <ChevronLeft /> ATRÁS
        </button>
        <button onClick={() => onNext(datos)} className="flex-[2] bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all">
          SIGUIENTE <ChevronRight />
        </button>
      </div>
    </div>
  );
};

const InputSigno = ({ label, icon: Icon, value, onChange, color = "text-blue-600" }: any) => (
  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 space-y-2 focus-within:bg-white focus-within:border-blue-500 transition-all">
    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
      <Icon className={`w-3 h-3 ${color}`} /> {label}
    </label>
    <input 
      type="number" step="any"
      value={value === null ? '' : value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none"
    />
  </div>
);
