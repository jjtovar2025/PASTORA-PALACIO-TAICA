import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Configuracion } from '../types';
import { Settings, Save, Trash2, Building, User, Activity, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export const ConfiguracionCentro: React.FC = () => {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.configuracion.get(1).then(c => {
      if (c) setConfig(c);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    await db.configuracion.put(config);
    alert('Configuración guardada exitosamente');
  };

  const limpiarBaseDatos = async () => {
    if (!confirm('¿Está seguro de que desea limpiar los reportes antiguos? Solo se borrarán las consultas ya sincronizadas con más de 30 días de antigüedad. La ficha del paciente no se borrará.')) {
      return;
    }

    const unMesAtras = new Date();
    unMesAtras.setDate(unMesAtras.getDate() - 30);
    const fechaLimite = unMesAtras.toISOString().split('T')[0];

    const count = await db.consultas
      .where('estado_sincronizacion').equals('sincronizado')
      .and(c => c.fecha < fechaLimite)
      .delete();

    alert(`Se han eliminado ${count} consultas antiguas.`);
  };

  if (loading || !config) return <div>Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Settings className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Ajustes del Centro</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Configuración inicial del CPT</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs flex items-center gap-2">
                <Building className="w-4 h-4" /> Datos de Identificación
              </h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Nombre del Centro</label>
                  <input 
                    type="text" value={config.nombre_centro} 
                    onChange={e => setConfig({...config, nombre_centro: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">ASIC</label>
                    <input 
                      type="text" value={config.asic} 
                      onChange={e => setConfig({...config, asic: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Parroquia</label>
                    <input 
                      type="text" value={config.parroquia} 
                      onChange={e => setConfig({...config, parroquia: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs flex items-center gap-2">
                <User className="w-4 h-4" /> Personal de Guardia (Default)
              </h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Médico de Guardia</label>
                  <input 
                    type="text" value={config.medico_guardia_default} 
                    onChange={e => setConfig({...config, medico_guardia_default: e.target.value.toUpperCase()})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Enfermero(a) de Guardia</label>
                  <input 
                    type="text" value={config.enfermera_guardia_default} 
                    onChange={e => setConfig({...config, enfermera_guardia_default: e.target.value.toUpperCase()})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 uppercase"
          >
            <Save className="w-6 h-6" /> Guardar Todos los Cambios
          </button>
        </form>
      </div>

      <div className="bg-red-50 p-8 rounded-3xl border border-red-100 space-y-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-8 h-8" />
          <h3 className="text-xl font-black">Zona de Mantenimiento</h3>
        </div>
        <p className="text-red-700 font-medium">
          Limpiar la base de datos local ayuda a que la aplicación funcione más rápido en dispositivos antiguos. 
          Solo se borrarán las consultas antiguas pero el historial global se guarda en Supabase.
        </p>
        <button 
          onClick={limpiarBaseDatos}
          className="bg-white text-red-600 px-8 py-4 rounded-2xl font-black text-lg border-2 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" /> LIMPIAR CONSULTAS ANTIGUAS (&gt;30 DÍAS)
        </button>
      </div>
    </div>
  );
};
