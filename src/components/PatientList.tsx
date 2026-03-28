import React from 'react';
import { PatientEntry, HealthReport } from '../types';
import { Trash2, User, Clock, ChevronRight, FileCheck, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientListProps {
  patients: PatientEntry[];
  onRemove: (id: string) => void;
  onCloseDay: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, onRemove, onCloseDay }) => {
  if (patients.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 border-dashed text-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
          <User className="text-slate-300 w-8 h-8" />
        </div>
        <div className="space-y-1">
          <p className="text-slate-500 font-bold text-sm">No hay pacientes registrados hoy</p>
          <p className="text-slate-400 text-xs">Comienza registrando un paciente en el formulario.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          Pacientes de Hoy
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-black">{patients.length}</span>
        </h3>
        <button
          onClick={onCloseDay}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
        >
          <FileCheck className="w-4 h-4" />
          CERRAR JORNADA
        </button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {patients.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    p.gender === 'F' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {p.gender}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{p.idNumber || 'S/C'}</span>
                      <span>•</span>
                      <span>{p.age} años</span>
                      <span>•</span>
                      <span className="text-blue-500 font-bold">{p.specialty || 'Gral'}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {p.entryTime}
                      </div>
                    </div>
                    {p.diagnosis && (
                      <p className="text-[10px] text-slate-500 mt-1 font-bold italic truncate max-w-[200px]">
                        Dx: {p.diagnosis}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(p.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
