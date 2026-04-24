import React, { useState } from 'react';
import { UserRole, AuthContext } from '../types';
import { Stethoscope, User, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onLogin: (auth: AuthContext) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role && name.trim()) {
      onLogin({ role, userName: name.trim().toUpperCase() });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden"
      >
        <div className="bg-blue-600 p-10 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-24 h-24 rotate-12" />
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <Stethoscope className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Morbilidad CPT</h2>
          <p className="text-blue-100 font-bold uppercase text-[10px] tracking-[0.2em] mt-3">Salud Pública • Venezuela</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Seleccione su Rol</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('enfermeria')}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
                  role === 'enfermeria' 
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-lg shadow-blue-50' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 grayscale opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role === 'enfermeria' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Activity className="w-7 h-7" />
                </div>
                <span className="font-black text-xs uppercase">Enfermería</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('medico')}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
                  role === 'medico' 
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-lg shadow-blue-50' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 grayscale opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role === 'medico' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <User className="w-7 h-7" />
                </div>
                <span className="font-black text-xs uppercase">Médico</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Nombre del Profesional</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: DR. JUAN PEREZ"
                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-700 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                <User className="w-6 h-6" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!role || !name.trim()}
            className="w-full bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tight"
          >
            Entrar al Sistema <ChevronRight className="w-6 h-6" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
