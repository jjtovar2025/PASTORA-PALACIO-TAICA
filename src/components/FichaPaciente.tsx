import React, { useState } from 'react';
import { db } from '../db';
import { Paciente, Consulta } from '../types';
import { Search, User, History, Calendar, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FichaPaciente: React.FC = () => {
  const [cedula, setCedula] = useState('');
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historial, setHistorial] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    if (!cedula) return;
    setLoading(true);
    const p = await db.pacientes.where('cedula_representante').equals(cedula).first();
    if (p) {
      setPaciente(p);
      const h = await db.consultas.where('paciente_id').equals(p.id!).reverse().toArray();
      setHistorial(h);
    } else {
      setPaciente(null);
      setHistorial([]);
      alert('Paciente no encontrado');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <History className="text-blue-600" /> Historial Clínico
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ingrese Cédula para buscar historial"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && buscar()}
            className="flex-1 text-xl font-bold p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-all"
          />
          <button 
            onClick={buscar}
            className="bg-blue-900 text-white px-8 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            <Search className="w-8 h-8" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {paciente && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Ficha Personal */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">{paciente.es_menor ? paciente.nombre_menor : paciente.nombres}</h4>
                  <h4 className="text-xl font-black text-slate-400">{paciente.es_menor ? '(MENOR)' : paciente.apellidos}</h4>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">C.I. Rep</span>
                    <span className="font-black text-slate-700">{paciente.cedula_representante}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Nacimiento</span>
                    <span className="font-black text-slate-700">{paciente.fecha_nacimiento}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Sexo</span>
                    <span className="font-black text-slate-700">{paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                  </div>
                  {paciente.telefono && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Teléfono</span>
                      <span className="font-black text-slate-700">{paciente.telefono}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Dirección</span>
                    <p className="font-bold text-slate-600 text-sm mt-1">{paciente.direccion}</p>
                    <p className="font-black text-blue-600 text-[10px] mt-1">{paciente.parroquia}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Historial */}
            <div className="lg:col-span-2 space-y-6">
              <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs ml-2">Línea de Tiempo de Consultas</h4>
              {historial.length === 0 ? (
                <div className="bg-slate-50 p-12 rounded-3xl text-center border-2 border-dashed border-slate-200">
                  <p className="font-bold text-slate-400">No hay consultas previas registradas localmente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historial.map((c, idx) => (
                    <div key={c.id} className="relative pl-8 group">
                      {/* Línea vertical del timeline */}
                      {idx !== historial.length - 1 && (
                        <div className="absolute left-3.5 top-8 bottom-[-1rem] w-0.5 bg-slate-100 group-hover:bg-blue-100 transition-colors"></div>
                      )}
                      
                      <div className="absolute left-0 top-3 w-7 h-7 bg-white rounded-full border-4 border-slate-100 group-hover:border-blue-500 transition-all flex items-center justify-center z-10">
                        <div className="w-1.5 h-1.5 bg-slate-200 group-hover:bg-blue-500 rounded-full"></div>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-black text-slate-800">{c.fecha}</span>
                            <span className="text-xs font-bold text-slate-400">• {c.hora_ingreso}</span>
                          </div>
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest border border-blue-100">
                            {c.especialidad}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Signos Vitales</p>
                            <div className="flex gap-4">
                              <div className="text-center">
                                <p className="text-xs font-bold text-slate-400">P.A.</p>
                                <p className="font-black text-slate-700">{c.pa_sistolica}/{c.pa_diastolica}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-bold text-slate-400">Temp</p>
                                <p className="font-black text-slate-700">{c.temp_c}ºC</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-bold text-slate-400">SpO2</p>
                                <p className="font-black text-slate-700">{c.spo2}%</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Diagnóstico</p>
                            <p className="font-bold text-slate-800 leading-tight">{c.diagnostico}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-50">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Motivo</p>
                          <p className="text-sm font-medium text-slate-600 italic">"{c.motivo_consulta}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
