import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Paciente } from '../types';
import { Search, UserPlus, History, UserCheck, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { calcularEdad } from '../lib/utils';

interface Props {
  onNext: (paciente: Paciente) => void;
}

export const Paso1Paciente: React.FC<Props> = ({ onNext }) => {
  const [cedula, setCedula] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [esMenor, setEsMenor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState<Partial<Paciente>>({
    sexo: 'F',
    parroquia: 'Paracotos',
    es_menor: false
  });

  const lasConsultas = useLiveQuery(
    () => pacienteEncontrado ? db.consultas.where('paciente_id').equals(pacienteEncontrado.id!).reverse().limit(3).toArray() : [],
    [pacienteEncontrado]
  );

  const buscarPaciente = async () => {
    if (!cedula) return;
    const p = await db.pacientes.where('cedula_representante').equals(cedula).first();
    if (p) {
      setPacienteEncontrado(p);
      setMostrarFormulario(false);
    } else {
      setPacienteEncontrado(null);
      setMostrarFormulario(true);
      setNuevoPaciente({ ...nuevoPaciente, cedula_representante: cedula, es_menor: esMenor });
    }
  };

  const guardarNuevoPaciente = async () => {
    if (!nuevoPaciente.cedula_representante || !nuevoPaciente.nombres || !nuevoPaciente.apellidos) {
      alert('Por favor complete los datos obligatorios (Cédula, Nombres, Apellidos)');
      return;
    }
    
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      // Use a shallow copy to prevent Dexie from mutating the state object 
      // which could cause issues if the same object is used in a retry.
      const id = await db.pacientes.add({ ...nuevoPaciente } as Paciente);
      const p = await db.pacientes.get(id);
      if (p) {
        onNext(p);
      }
    } catch (error) {
      console.error('Error guardando paciente:', error);
      alert('Error al guardar el paciente. Posiblemente ya existe.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Buscar Paciente</h3>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ingrese Cédula Representante..."
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscarPaciente()}
              className="flex-1 text-2xl font-black p-5 bg-slate-50 border-2 border-slate-200 rounded-3xl shadow-inner focus:border-blue-500 focus:bg-white focus:ring-0 outline-none transition-all placeholder:text-slate-300"
            />
            <button 
              onClick={buscarPaciente}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-3xl shadow-xl shadow-blue-100 active:scale-95 transition-all"
            >
              <Search className="w-8 h-8" />
            </button>
          </div>
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all border border-slate-200">
            <input 
              type="checkbox" 
              checked={esMenor} 
              onChange={(e) => setEsMenor(e.target.checked)}
              className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500"
            />
            <span className="font-black text-slate-700 uppercase text-xs tracking-widest">Paciente es Menor de Edad</span>
          </label>
        </div>
      </div>

      {pacienteEncontrado && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white p-8 rounded-[2rem] border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center border-2 border-white shadow-inner">
                <UserCheck className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                    {pacienteEncontrado.es_menor ? pacienteEncontrado.nombre_menor : `${pacienteEncontrado.nombres} ${pacienteEncontrado.apellidos}`}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pacienteEncontrado.sexo === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                    {pacienteEncontrado.sexo === 'F' ? 'Femenino' : 'Masculino'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 font-bold text-slate-400">
                  <p>C.I. Rep: {pacienteEncontrado.cedula_representante}</p>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <p className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {calcularEdad(pacienteEncontrado.fecha_nacimiento)}</p>
                  {pacienteEncontrado.telefono && (
                    <>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <p>Tel: {pacienteEncontrado.telefono}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={() => onNext(pacienteEncontrado)}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-emerald-200 active:scale-95 transition-all"
            >
              INICIAR CONSULTA <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {lasConsultas && lasConsultas.length > 0 && (
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                <History className="w-4 h-4" /> Antecedentes Recientes (Local)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lasConsultas.map(c => (
                  <div key={c.id} className="p-5 bg-slate-50 rounded-2xl border border-white shadow-inner hover:bg-white hover:shadow-md transition-all">
                    <p className="text-xs font-black text-blue-600 uppercase mb-2">{c.fecha}</p>
                    <p className="font-black text-slate-800 leading-tight mb-2">{c.diagnostico || 'SIN DIAGNÓSTICO'}</p>
                    <div className="h-px bg-slate-200 my-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">ESPECIALIDAD: {c.especialidad}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {mostrarFormulario && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2rem] shadow-2xl border border-blue-50 space-y-8"
        >
          <div className="flex items-center gap-3 text-blue-600 border-b border-slate-50 pb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <UserPlus className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight leading-none">Registro Nuevo</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Llene los datos básicos del paciente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-2 tracking-widest">Nombres Completos</label>
              <input 
                type="text" placeholder="Ej: JUAN ALBERTO" value={nuevoPaciente.nombres || ''} 
                onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombres: e.target.value.toUpperCase()})}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-2 tracking-widest">Apellidos Completos</label>
              <input 
                type="text" placeholder="Ej: PEREZ RODRIGUEZ" value={nuevoPaciente.apellidos || ''} 
                onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellidos: e.target.value.toUpperCase()})}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-2 tracking-widest">Fecha de Nacimiento</label>
              <input 
                type="date" value={nuevoPaciente.fecha_nacimiento || ''} 
                onChange={(e) => setNuevoPaciente({...nuevoPaciente, fecha_nacimiento: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-2 tracking-widest">Sexo</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setNuevoPaciente({...nuevoPaciente, sexo: 'F'})}
                  className={`py-4 rounded-2xl font-black border-2 transition-all ${nuevoPaciente.sexo === 'F' ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-100' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                  MUJER
                </button>
                <button 
                  onClick={() => setNuevoPaciente({...nuevoPaciente, sexo: 'M'})}
                  className={`py-4 rounded-2xl font-black border-2 transition-all ${nuevoPaciente.sexo === 'M' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                  HOMBRE
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-2 tracking-widest">Teléfono de Contacto</label>
              <input 
                type="text" placeholder="Ej: 0412-0000000" value={nuevoPaciente.telefono || ''} 
                onChange={(e) => setNuevoPaciente({...nuevoPaciente, telefono: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-2 tracking-widest">Dirección Detallada</label>
              <textarea 
                placeholder="Sector, Calle, Nº de Casa..." value={nuevoPaciente.direccion || ''} 
                onChange={(e) => setNuevoPaciente({...nuevoPaciente, direccion: e.target.value.toUpperCase()})}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all" rows={2}
              ></textarea>
            </div>
          </div>
          <button 
            onClick={guardarNuevoPaciente}
            disabled={isSaving}
            className={`w-full py-6 rounded-3xl font-black text-2xl shadow-2xl transition-all uppercase tracking-tight ${
              isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Guardando...' : 'Guardar Paciente y Continuar'}
          </button>
        </motion.div>
      )}
    </div>
  );
};

