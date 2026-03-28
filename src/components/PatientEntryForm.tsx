import React, { useState } from 'react';
import { PatientEntry } from '../types';
import { User, Activity, ShieldAlert, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface PatientEntryFormProps {
  onAdd: (entry: PatientEntry) => void;
}

export const PatientEntryForm: React.FC<PatientEntryFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState<Omit<PatientEntry, 'id' | 'timestamp'>>({
    name: '',
    age: 0,
    gender: 'Femenino',
    service: 'Medicina General',
    activities: [],
    programs: [],
    reference: undefined
  });

  const services = [
    'Medicina General', 'Emergencia', 'Pediatría', 'Geriatría', 
    'Medicina Interna', 'Ginecología', 'Prenatal', 'Enfermería'
  ];

  const activities = [
    'Control de T/A', 'Control de glicemia', 'Control peso', 'Talla',
    'Tto E/V', 'Tto I/M', 'Tto S/L', 'Tto V/O', 'Tto S/C', 'Tto protocolo',
    'Nebulizaciones', 'Curas', 'Suturas', 'Retiro de puntos', 'Sondas',
    'Lavado ocular', 'Lavado nasal', 'Lavado de oidos', 'Electros',
    'Visitas domiciliares', 'Jornadas especiales', 'Entregas de ayudas', 'Vacunas de rutina'
  ];

  const programs = [
    'Cardiovascular', 'Diabetes', 'Asma', 'IRA', 'Embarazada',
    'COVID-19', 'Fiebre', 'Dengue', 'Zika', 'Chicungunya',
    'Varicela', 'Rubeola', 'Sarampión', 'H1N1', 'Mordedura canina'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: PatientEntry = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    onAdd(entry);
    // Reset form but keep some context if needed
    setFormData({
      name: '',
      age: 0,
      gender: 'Femenino',
      service: 'Medicina General',
      activities: [],
      programs: [],
      reference: undefined
    });
  };

  const toggleItem = (list: string[], item: string, field: 'activities' | 'programs') => {
    const newList = list.includes(item) 
      ? list.filter(i => i !== item)
      : [...list, item];
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <User className="text-blue-600 w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800">Datos del Paciente</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Edad</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={formData.age || ''}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, age: parseInt(val) || 0 });
                }}
                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Género</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Servicio de Atención</label>
          <div className="flex flex-wrap gap-2">
            {services.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData({ ...formData, service: s as any })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  formData.service === s 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Activity className="text-emerald-600 w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Actividades / Tto</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {activities.map(a => (
              <button
                key={a}
                type="button"
                onClick={() => toggleItem(formData.activities, a, 'activities')}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold text-left transition-all ${
                  formData.activities.includes(a)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <ShieldAlert className="text-amber-600 w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Programas de Salud</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {programs.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => toggleItem(formData.programs, p, 'programs')}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold text-left transition-all ${
                  formData.programs.includes(p)
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Referencia</label>
            <div className="flex gap-2 mt-2">
              {['Ambulancia', 'Propios Medios'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, reference: formData.reference === r ? undefined : r as any })}
                  className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${
                    formData.reference === r
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-4 rounded-3xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        REGISTRAR PACIENTE
      </button>
    </form>
  );
};
