import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { 
  Users, 
  Venus, 
  Mars, 
  Stethoscope, 
  TrendingUp, 
  Calendar,
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { getFullDate } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const hoy = new Date().toISOString().split('T')[0];
  
  const stats = useLiveQuery(async () => {
    const consultasHoy = await db.consultas.where('fecha').equals(hoy).toArray();
    const pacientesIds = consultasHoy.map(c => c.paciente_id);
    const pacientes = await db.pacientes.where('id').anyOf(pacientesIds).toArray();
    
    const pacientesMap = new Map(pacientes.map(p => [p.id, p]));
    
    let fm = 0;
    let masc = 0;
    const especialidades: Record<string, number> = {};
    
    consultasHoy.forEach(c => {
      const p = pacientesMap.get(c.paciente_id);
      if (p?.sexo === 'F') fm++;
      if (p?.sexo === 'M') masc++;
      especialidades[c.especialidad] = (especialidades[c.especialidad] || 0) + 1;
    });

    return {
      total: consultasHoy.length,
      femenino: fm,
      masculino: masc,
      especialidades: Object.entries(especialidades).sort((a, b) => b[1] - a[1])
    };
  }, [hoy]);

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Welcome & Date */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Panel de Control</h2>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2 mt-1">
            <Calendar className="w-3 h-3" /> {getFullDate()}
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">Consultas hoy</p>
            <p className="text-2xl font-black text-blue-600 leading-none">{stats.total}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
            <Venus className="w-10 h-10" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Femenino</p>
            <p className="text-4xl font-black text-slate-800">{stats.femenino}</p>
            <p className="text-xs text-slate-400 font-bold">Pacientes hoy</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            <Mars className="w-10 h-10" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Masculino</p>
            <p className="text-4xl font-black text-slate-800">{stats.masculino}</p>
            <p className="text-xs text-slate-400 font-bold">Pacientes hoy</p>
          </div>
        </motion.div>
      </div>

      {/* Specialty Breakdown */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Stethoscope className="text-blue-600" /> Distribución por Especialidad
        </h3>
        
        {stats.especialidades.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-bold">
            No hay consultas registradas el día de hoy.
          </div>
        ) : (
          <div className="space-y-4">
            {stats.especialidades.map(([nombre, count], idx) => (
              <div key={nombre} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-black uppercase tracking-tight">
                  <span className="text-slate-600">{nombre}</span>
                  <span className="text-blue-600">{count}</span>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${(count / stats.total) * 100}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-900 rounded-2xl text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-200" />
            </div>
            <p className="font-bold text-sm">Gestionar Pacientes</p>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-300" />
        </div>
        <div className="p-4 bg-slate-800 rounded-2xl text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-slate-300" />
            </div>
            <p className="font-bold text-sm">Reporte Epidemiológico</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
