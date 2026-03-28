import React, { useState, useEffect } from 'react';
import { HealthReport } from './types';
import { ReportForm } from './components/ReportForm';
import { ManualReportForm } from './components/ManualReportForm';
import { Dashboard } from './components/Dashboard';
import { getReports } from './lib/supabase';
import { 
  Activity, 
  History, 
  LayoutDashboard, 
  PlusCircle, 
  Loader2, 
  AlertCircle,
  Stethoscope,
  FileText,
  BrainCircuit,
  Settings,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function App() {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new' | 'history'>('dashboard');
  const [entryMode, setEntryMode] = useState<'manual' | 'ai'>('manual');
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      if (data && Array.isArray(data)) {
        const formattedReports = data.map((r: any) => r.data as HealthReport);
        setReports(formattedReports);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('No se pudo conectar con la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSuccess = (newReport: HealthReport) => {
    setReports([newReport, ...reports]);
    setActiveTab('dashboard');
  };

  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isAIScriptConfigured = !!import.meta.env.VITE_APPS_SCRIPT_URL;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Navigation Rail */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 md:top-0 md:bottom-0 md:left-0 md:w-24 md:flex-col md:border-r md:border-t-0 z-50 flex justify-around items-center">
        <div className="hidden md:flex mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Stethoscope className="text-white w-7 h-7" />
          </div>
        </div>
        
        <div className="flex md:flex-col gap-8 md:gap-6">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setShowSettings(false); }} 
            icon={LayoutDashboard} 
            label="Panel" 
          />
          <NavButton 
            active={activeTab === 'new'} 
            onClick={() => { setActiveTab('new'); setShowSettings(false); }} 
            icon={PlusCircle} 
            label="Nuevo" 
          />
          <NavButton 
            active={activeTab === 'history'} 
            onClick={() => { setActiveTab('history'); setShowSettings(false); }} 
            icon={History} 
            label="Libro" 
          />
          <NavButton 
            active={showSettings} 
            onClick={() => setShowSettings(!showSettings)} 
            icon={Settings} 
            label="Ajustes" 
          />
        </div>

        <div className="hidden md:flex mt-auto">
          {/* Espacio reservado */}
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-24 pb-24 md:pb-0 min-h-screen">
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">PASTORA PALACIOS TAICA</h1>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Centro + Salud • Gestión de Morbilidad</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase">Estado del Sistema</span>
                <span className={`text-xs font-black flex items-center gap-1 ${isConfigured ? 'text-emerald-500' : 'text-red-500'}`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isConfigured ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {isConfigured ? 'EN LÍNEA' : 'DESCONECTADO'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">Configuración del Sistema</h2>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                  <PlusCircle className="w-6 h-6 rotate-45" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Base de Datos (Supabase)</h3>
                  <div className={`p-4 rounded-2xl border ${isConfigured ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-3">
                      {isConfigured ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-red-500" />}
                      <div>
                        <p className={`font-bold ${isConfigured ? 'text-emerald-900' : 'text-red-900'}`}>
                          {isConfigured ? 'Conectado a Supabase' : 'Faltan credenciales'}
                        </p>
                        <p className="text-xs text-slate-500">Permite guardar y ver el historial en la app.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Exportación (Google Sheets)</h3>
                  <div className={`p-4 rounded-2xl border ${isAIScriptConfigured ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                    <div className="flex items-center gap-3">
                      {isAIScriptConfigured ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-amber-500" />}
                      <div>
                        <p className={`font-bold ${isAIScriptConfigured ? 'text-emerald-900' : 'text-amber-900'}`}>
                          {isAIScriptConfigured ? 'Conectado a Sheets' : 'URL de Script no configurada'}
                        </p>
                        <p className="text-xs text-slate-500">Permite enviar los datos al libro de Excel.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!isConfigured && (
                <div className="mt-8 p-4 bg-slate-100 rounded-2xl">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <b>Instrucciones:</b> Para activar el sistema, ve al menú de <b>Settings > Secrets</b> de este editor y agrega:
                    <br />1. <code className="bg-white px-1 rounded">VITE_SUPABASE_URL</code>
                    <br />2. <code className="bg-white px-1 rounded">VITE_SUPABASE_ANON_KEY</code>
                    <br />3. <code className="bg-white px-1 rounded">VITE_APPS_SCRIPT_URL</code>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[60vh] gap-4"
              >
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="font-bold text-slate-400 animate-pulse">CARGANDO DATOS...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center max-w-md mx-auto mt-12"
              >
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-black text-red-900 mb-2">ERROR DE CONEXIÓN</h2>
                <p className="text-red-700 font-medium mb-6">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  REINTENTAR
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-slate-900">Panel de Control</h2>
                      <span className="bg-white px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-500 shadow-sm">
                        ACTUALIZADO: {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <Dashboard reports={reports} />
                  </div>
                )}

                {activeTab === 'new' && (
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-black text-slate-900 mb-2">Registrar Morbilidad</h2>
                      <p className="text-slate-500 font-medium">Elija el método de entrada para el reporte diario</p>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex p-1 bg-slate-200 rounded-2xl mb-8 max-w-md mx-auto">
                      <button
                        onClick={() => setEntryMode('manual')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                          entryMode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        Formulario
                      </button>
                      <button
                        onClick={() => setEntryMode('ai')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                          entryMode === 'ai' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <BrainCircuit className="w-4 h-4" />
                        Pegar Texto
                      </button>
                    </div>

                    {entryMode === 'manual' ? (
                      <ManualReportForm onSuccess={handleReportSuccess} />
                    ) : (
                      <ReportForm onSuccess={handleReportSuccess} />
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-slate-900">Libro de Morbilidad</h2>
                      <button 
                        onClick={loadReports}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Activity className="w-3 h-3" />
                        ACTUALIZAR
                      </button>
                    </div>
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Día</th>
                              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Atendidos</th>
                              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Alerta</th>
                              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reports.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                  No hay reportes registrados aún.
                                </td>
                              </tr>
                            ) : (
                              reports.map((report, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                  <td className="px-6 py-4 font-bold text-slate-700">{report.header.date}</td>
                                  <td className="px-6 py-4 font-bold text-slate-500">{report.header.day}</td>
                                  <td className="px-6 py-4">
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-black text-sm">
                                      {report.stats.total_patients}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-tighter ${
                                      report.epidemiology.status_level === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                      report.epidemiology.status_level === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                                      'bg-emerald-100 text-emerald-700'
                                    }`}>
                                      {report.epidemiology.status_level}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => {
                                        const encodedText = encodeURIComponent(report.whatsapp_summary);
                                        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
                                      }}
                                      className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-green-600 hover:text-white transition-all"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      REENVIAR
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all group relative ${
        active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className={`p-3 rounded-2xl transition-all ${
        active ? 'bg-blue-50' : 'group-hover:bg-slate-50'
      }`}>
        <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full hidden md:block"
        />
      )}
    </button>
  );
}

export default App;
