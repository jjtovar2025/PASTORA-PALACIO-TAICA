import React, { useState, useMemo } from 'react';
import { PatientEntry, HealthReport } from '../types';
import { Trash2, User, Clock, ChevronRight, FileCheck, Send, MessageSquare, Filter, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientListProps {
  patients: PatientEntry[];
  onRemove: (id: string) => void;
  onCloseDay: () => void;
}

const ITEMS_PER_PAGE = 5;

export const PatientList: React.FC<PatientListProps> = ({ patients, onRemove, onCloseDay }) => {
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique specialties for the filter
  const specialties = useMemo(() => {
    const specs = patients.map(p => p.specialty || 'General');
    return ['all', ...Array.from(new Set(specs))];
  }, [patients]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (specialtyFilter === 'all') return true;
      return (p.specialty || 'General') === specialtyFilter;
    });
  }, [patients, specialtyFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPatients, currentPage]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [specialtyFilter]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          Pacientes de Hoy
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-black">{patients.length}</span>
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">Todas las Especialidades</option>
              {specialties.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onCloseDay}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
          >
            <FileCheck className="w-4 h-4" />
            CERRAR JORNADA
          </button>
        </div>
      </div>

      <div className="space-y-3 min-h-[400px]">
        <AnimatePresence mode="wait">
          {paginatedPatients.length > 0 ? (
            <motion.div
              key={currentPage + specialtyFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {paginatedPatients.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
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
            </motion.div>
          ) : (
            <div className="py-12 text-center text-slate-400 font-medium">
              No hay pacientes para esta especialidad.
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
