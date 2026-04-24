import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Paciente, Consulta } from '../types';
import { Search, UserPlus, History, UserCheck, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onNext: (paciente: Paciente) => void;
}

export const Paso1Paciente: React.FC<Props> = ({ onNext }) => {
  const [cedula, setCedula] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState<Partial<Paciente>>({
    sexo: 'F',
    parroquia: 'Paracotos'
  });

  const lasConsultas = useLiveQuery(
    () => pacienteEncontrado ? db.consultas.where('paciente_id').equals(pacienteEncontrado.id!).reverse().limit(5).toArray() : [],
    [pacienteEncontrado]
  );

  const buscarPaciente = async () => {
    if (!cedula) return;
    const p = await db.pacientes.where('cedula').equals(cedula).first();
    if (p) {
      setPacienteEncontrado(p);
      setMostrarFormulario(false);
    } else {
      setPacienteEncontrado(null);
      setMostrarFormulario(true);
      setNuevoPaciente({ ...nuevoPaciente, cedula });
    }
  };

  const guardarNuevoPaciente = async () => {
    if (!nuevoPaciente.cedula || !nuevoPaciente.nombres || !nuevoPaciente.apellidos) {
      alert('Por favor complete los datos obligatorios (Cédula, Nombres, Apellidos)');
      return;
    }
    const id = await db.pacientes.add(nuevoPaciente as Paciente);
    const p = await db.pacientes.get(id);
    if (p) {
      setPacienteEncontrado(p);
      setMostrarFormulario(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <Search className="text-blue-600" /> Identificación del Paciente
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ingrese Cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && buscarPaciente()}
            className="flex-1 text-2xl font-bold p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-all"
          />
          <button 
            onClick={buscarPaciente}
            className="bg-blue-600 text-white px-8 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all"
          >
            <Search className="w-8 h-8" />
          </button>
        </div>
      </div>

      {pacienteEncontrado && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-3xl flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <UserCheck className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-emerald-900 uppercase">
                  {pacienteEncontrado.nombres} {pacienteEncontrado.apellidos}
                </h4>
                <p className="text-emerald-700 font-bold">C.I.: {pacienteEncontrado.cedula}</p>
              </div>
            </div>
            <button 
              onClick={() => onNext(pacienteEncontrado)}
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
            >
              CONTINUAR <ChevronRight />
            </button>
          </div>

          {lasConsultas && lasConsultas.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <History className="w-4 h-4" /> Historial Reciente
              </h4>
              <div className="space-y-3">
                {lasConsultas.map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{c.fecha} - {c.hora_ingreso}</span>
                      <span className="text-blue-600">{c.especialidad}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">DX: {c.diagnostico}</p>
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
          className="bg-white p-6 rounded-3xl shadow-xl border-2 border-blue-100 space-y-6"
        >
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <UserPlus /> <h3 className="text-xl font-black">Registrar Nuevo Paciente</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Nombres *</label>
              <input 
                type="text" value={nuevoPaciente.nombres || ''} 
                onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombres: e.target.value.toUpperCase()})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Apellidos *</label>
              <input 
                type="text" value={nuevoPaciente.apellidos || ''} 
                onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellidos: e.target.value.toUpperCase()})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Fecha Nacimiento</label>
              <input 
                type="date" value={nuevoPaciente.fecha_nacimiento || ''} 
                onChange={(e) => setNuevoPaciente({...nuevoPaciente, fecha_nacimiento: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Sexo</label>
              <select 
                value={nuevoPaciente.sexo} 
                onChange={(e) => setNuevoPaciente({...nuevoPaciente, sexo: e.target.value as 'M' | 'F'})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
              >
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Dirección</label>
              <textarea 
                value={nuevoPaciente.direccion || ''} 
                onChange={(e) => setNuevoPaciente({...nuevoPaciente, direccion: e.target.value.toUpperCase()})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" rows={2}
              ></textarea>
            </div>
          </div>
          <button 
            onClick={guardarNuevoPaciente}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase"
          >
            Guardar Paciente y Continuar
          </button>
        </motion.div>
      )}
    </div>
  );
};
