import React, { useState } from 'react';
import { Consulta } from '../types';
import { User, ChevronLeft, ChevronRight, Stethoscope, ClipboardList, BriefcaseMedical } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onBack: () => void;
  onNext: (datos: Partial<Consulta>) => void;
}

const ESPECIALIDADES = [
  'MEDICINA GENERAL', 'PEDIATRÍA', 'EMERGENCIA', 'MEDICINA INTERNA', 
  'GINECOLOGÍA', 'PRENATAL', 'GERIATRÍA', 'ENFERMERÍA'
];

const PROGRAMAS = [
  'Cardiovascular', 'Diabetes', 'Asma', 'IRA', 'Embarazada', 
  'Fiebre', 'Dengue', 'Zika', 'Chicungunya', 'Varicela', 
  'Rubeola', 'Sarampión', 'H1N1', 'COVID-19', 'Mordedura Canina'
];

export const Paso3Diagnostico: React.FC<Props> = ({ onBack, onNext }) => {
  const [datos, setDatos] = useState<Partial<Consulta>>({
    especialidad: 'MEDICINA GENERAL',
    diagnostico: '',
    tratamiento_colocado: '',
    tratamiento_recetado: '',
    referido_a: '',
    programa_salud: []
  });

  const togglePrograma = (id: string) => {
    const current = datos.programa_salud || [];
    if (current.includes(id)) {
      setDatos({ ...datos, programa_salud: current.filter(cid => cid !== id) });
    } else {
      setDatos({ ...datos, programa_salud: [...current, id] });
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Diagnóstico Médico</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Especialidad</label>
            <div className="grid grid-cols-2 gap-2">
              {ESPECIALIDADES.map(esp => (
                <button
                  key={esp}
                  onClick={() => setDatos({ ...datos, especialidad: esp })}
                  className={`p-3 rounded-2xl border-2 font-black text-[9px] uppercase tracking-tighter text-center transition-all ${
                    datos.especialidad === esp
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-50'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  {esp}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Programas de Salud (Opcional)</label>
            <div className="flex flex-wrap gap-2">
              {PROGRAMAS.map(prog => (
                <button
                  key={prog}
                  onClick={() => togglePrograma(prog)}
                  className={`px-4 py-2 rounded-full border-2 font-black text-[9px] uppercase tracking-widest transition-all ${
                    datos.programa_salud?.includes(prog)
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-50'
                      : 'bg-white border-slate-100 text-slate-400'
                  }`}
                >
                  {prog}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <InputGrande label="Diagnóstico Médico" value={datos.diagnostico} onChange={v => setDatos({...datos, diagnostico: v.toUpperCase()})} placeholder="Escriba diagnóstico..." icon={ClipboardList} />
          <InputGrande label="Tratamiento Colocado (Inyectables, etc)" value={datos.tratamiento_colocado} onChange={v => setDatos({...datos, tratamiento_colocado: v.toUpperCase()})} placeholder="Escriba tto colocado..." icon={BriefcaseMedical} />
          <InputGrande label="Tratamiento Recetado (Recipe)" value={datos.tratamiento_recetado} onChange={v => setDatos({...datos, tratamiento_recetado: v.toUpperCase()})} placeholder="Escriba recipe..." icon={ClipboardList} />
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Referido a</label>
            <input 
              type="text" value={datos.referido_a} onChange={e => setDatos({...datos, referido_a: e.target.value.toUpperCase()})} 
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
              placeholder="Ej: HOSPITAL HVSR / ESPECIALISTA (Opcional)"
            />
          </div>
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

const InputGrande = ({ label, value, onChange, placeholder, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
       <Icon className="w-3 h-3" /> {label}
    </label>
    <textarea 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
      rows={2}
      placeholder={placeholder}
    />
  </div>
);
