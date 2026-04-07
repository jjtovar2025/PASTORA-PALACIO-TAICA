import React, { useState, useEffect } from 'react';
import { HealthReport } from './types';
import { ReportForm } from './components/ReportForm';
import { ManualReportForm } from './components/ManualReportForm';
import { Dashboard } from './components/Dashboard';
import { getReports } from './lib/supabase';
import { PatientEntryForm } from './components/PatientEntryForm';
import { PatientList } from './components/PatientList';
import { PatientEntry } from './types';
import { patientsToReport, exportToExcel } from './lib/reportUtils';
import { saveReport, syncPendingData, savePatient, getPatientsFromSupabase, deletePatientFromSupabase, supabase } from './lib/supabase';
import { isOnline } from './lib/offline';
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
  CheckCircle2,
  MessageSquare,
  Users,
  Download,
  ChevronDown,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function App() {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'patients'>('patients');
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      syncPendingData().then(() => loadReports());
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check
    if (isOnline()) {
      syncPendingData().then(() => loadReports());
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [patients, setPatients] = useState<PatientEntry[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientEntry | null>(null);
  const [showCloseDayModal, setShowCloseDayModal] = useState(false);
  const [closingDay, setClosingDay] = useState(false);
  const [staff, setStaff] = useState({
    nurse: '',
    doctorGen: '',
    doctorSpec: ''
  });
  const [lastGeneratedReport, setLastGeneratedReport] = useState<HealthReport | null>(null);
  const [showWhatsAppOptions, setShowWhatsAppOptions] = useState(false);

  useEffect(() => {
    localStorage.setItem('health_app_patients', JSON.stringify(patients));
  }, [patients]);
  const [entryMode, setEntryMode] = useState<'manual' | 'ai'>('manual');
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(() => {
    const saved = localStorage.getItem('health_app_phones');
    return saved ? JSON.parse(saved) : ['+584241208234'];
  });
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    localStorage.setItem('health_app_phones', JSON.stringify(phoneNumbers));
  }, [phoneNumbers]);

  useEffect(() => {
    loadReports();
    loadPatients();
  }, []);

  // Real-time subscription for patients and reports
  useEffect(() => {
    if (!supabase) return;

    const patientsChannel = supabase
      .channel('public:pacientes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'pacientes' }, 
        () => {
          loadPatients();
        }
      )
      .subscribe();

    const reportsChannel = supabase
      .channel('public:reportes_diarios')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'reportes_diarios' }, 
        () => {
          loadReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(patientsChannel);
      supabase.removeChannel(reportsChannel);
    };
  }, []);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const today = new Date().toISOString().split('T')[0];
      const data = await getPatientsFromSupabase(today);
      setPatients(data);
    } catch (err) {
      console.error('Error loading patients:', err);
      // Fallback to localStorage if offline and fetch fails
      const saved = localStorage.getItem('health_app_patients');
      if (saved) setPatients(JSON.parse(saved));
    } finally {
      setLoadingPatients(false);
    }
  };

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

  const handleAddPatient = async (p: PatientEntry) => {
    const newPatients = [p, ...patients];
    setPatients(newPatients);
    localStorage.setItem('health_app_patients', JSON.stringify(newPatients));
    await savePatient(p);
  };

  const handleUpdatePatient = async (p: PatientEntry) => {
    const newPatients = patients.map(item => item.id === p.id ? p : item);
    setPatients(newPatients);
    localStorage.setItem('health_app_patients', JSON.stringify(newPatients));
    setEditingPatient(null);
    await savePatient(p); // savePatient uses upsert, so it works for updates too
  };

  const handleRemovePatient = async (id: string) => {
    const newPatients = patients.filter(p => p.id !== id);
    setPatients(newPatients);
    localStorage.setItem('health_app_patients', JSON.stringify(newPatients));
    await deletePatientFromSupabase(id);
  };

  const handleReportSuccess = (newReport: HealthReport) => {
    setReports([newReport, ...reports]);
    setActiveTab('dashboard');
  };

  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null);

  const handleCloseDay = async () => {
    if (patients.length === 0) {
      alert('No hay pacientes registrados para cerrar el día.');
      setShowCloseDayModal(false);
      return;
    }

    setClosingDay(true);
    try {
      console.log(`Iniciando cierre de día con ${patients.length} pacientes.`);
      const report = patientsToReport(patients, staff);
      
      // 1. Save to Supabase
      try {
        const result = await saveReport(report);
        console.log('Reporte guardado en Supabase:', result);
        if (result && (result as any).offline) {
          alert('MODO OFFLINE: El reporte de cierre se guardó localmente y se sincronizará al recuperar internet.');
        }
      } catch (err) {
        console.error('Error saving to Supabase:', err);
        alert('Error al guardar en la base de datos, pero el proceso continuará localmente.');
      }

      // 2. Send to Apps Script
      const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
      if (appsScriptUrl) {
        console.log('Enviando reporte a Google Sheets...');
        try {
          await fetch(appsScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
          });
        } catch (err) {
          console.error('Error sending to Apps Script:', err);
        }
      }

      // 3. Export to Excel
      console.log('Generando archivo Excel...');
      exportToExcel(patients, report);

      setLastGeneratedReport(report);
      
      // Update local reports list immediately
      setReports(prev => [report, ...prev]);
      
      // Clear patients for next day
      setPatients([]); 
      localStorage.removeItem('health_app_patients');
      
      setShowCloseDayModal(false);
      setShowWhatsAppOptions(true);
      
      // Refresh reports from server to be sure
      setTimeout(() => loadReports(), 2000);
      
    } catch (err) {
      console.error('Error closing day:', err);
      alert('Error crítico al generar el reporte de cierre.');
    } finally {
      setClosingDay(false);
    }
  };

  const sendWhatsApp = (phone: string) => {
    if (!lastGeneratedReport) return;
    const text = encodeURIComponent(lastGeneratedReport.whatsapp_summary);
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
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
            active={activeTab === 'patients'} 
            onClick={() => { setActiveTab('patients'); setShowSettings(false); }} 
            icon={Users} 
            label="Pacientes" 
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
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black flex items-center gap-1 ${isConfigured ? 'text-emerald-500' : 'text-red-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {isConfigured ? 'DB OK' : 'DB ERROR'}
                  </span>
                  <span className={`text-[10px] font-black flex items-center gap-1 ${online ? 'text-blue-500' : 'text-amber-500'}`}>
                    {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {online ? 'CONECTADO' : 'MODO OFFLINE'}
                  </span>
                </div>
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

              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Contactos de WhatsApp (Enfermería)</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  {phoneNumbers.map((phone, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl font-bold text-sm border border-blue-100">
                      <span>{phone}</span>
                      <button 
                        onClick={() => setPhoneNumbers(phoneNumbers.filter((_, i) => i !== idx))}
                        className="text-blue-400 hover:text-red-500 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 rotate-45" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 max-w-md">
                  <input 
                    type="text" 
                    placeholder="Ej: +584241208234"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <button 
                    onClick={() => {
                      if (newPhone.trim()) {
                        setPhoneNumbers([...phoneNumbers, newPhone.trim()]);
                        setNewPhone('');
                      }
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {!isConfigured && (
                <div className="mt-8 p-4 bg-slate-100 rounded-2xl">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <b>Instrucciones:</b> Para activar el sistema, ve al menú de <b>Settings &gt; Secrets</b> de este editor y agrega:
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
                {activeTab === 'patients' && (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900">Gestión de Pacientes</h2>
                        <p className="text-slate-500 font-medium">Registro individual y cierre de jornada</p>
                      </div>
                      {loadingPatients && (
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          SINCRONIZANDO...
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-1">
                        <PatientEntryForm 
                          onAdd={handleAddPatient} 
                          editingPatient={editingPatient}
                          onUpdate={handleUpdatePatient}
                          onCancelEdit={() => setEditingPatient(null)}
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <PatientList 
                          patients={patients} 
                          onRemove={handleRemovePatient}
                          onCloseDay={() => setShowCloseDayModal(true)}
                          onReopen={loadPatients}
                          onEdit={(p) => {
                            setEditingPatient(p);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

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
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        onClick={() => setSelectedReport(report)}
                                        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl font-bold text-[10px] hover:bg-blue-600 hover:text-white transition-all"
                                      >
                                        <Users className="w-3 h-3" />
                                        PACIENTES
                                      </button>
                                      {phoneNumbers.length > 0 ? (
                                        phoneNumbers.map((phone, pIdx) => (
                                          <button
                                            key={pIdx}
                                            onClick={() => {
                                              const encodedText = encodeURIComponent(report.whatsapp_summary);
                                              const cleanPhone = phone.replace(/\D/g, '');
                                              window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
                                            }}
                                            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-bold text-[10px] hover:bg-emerald-600 hover:text-white transition-all"
                                            title={`Enviar a ${phone}`}
                                          >
                                            <MessageSquare className="w-3 h-3" />
                                            {phoneNumbers.length === 1 ? 'REENVIAR' : phone.slice(-4)}
                                          </button>
                                        ))
                                      ) : (
                                        <button
                                          onClick={() => {
                                            const encodedText = encodeURIComponent(report.whatsapp_summary);
                                            window.open(`https://wa.me/?text=${encodedText}`, '_blank');
                                          }}
                                          className="flex items-center gap-2 bg-slate-50 text-slate-400 px-3 py-1.5 rounded-xl font-bold text-[10px] hover:bg-slate-200 transition-all"
                                        >
                                          <MessageSquare className="w-3 h-3" />
                                          COMPARTIR
                                        </button>
                                      )}
                                    </div>
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

      {/* MODALS */}
      <AnimatePresence>
        {showCloseDayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900">Cierre de Jornada</h3>
                <button onClick={() => setShowCloseDayModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Enfermero(a) Responsable</label>
                  <input 
                    type="text" 
                    value={staff.nurse}
                    onChange={(e) => setStaff({...staff, nurse: e.target.value})}
                    placeholder="Nombre completo"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Médico General</label>
                  <input 
                    type="text" 
                    value={staff.doctorGen}
                    onChange={(e) => setStaff({...staff, doctorGen: e.target.value})}
                    placeholder="Nombre del médico"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Especialista</label>
                  <input 
                    type="text" 
                    value={staff.doctorSpec}
                    onChange={(e) => setStaff({...staff, doctorSpec: e.target.value})}
                    placeholder="Nombre del especialista"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <button
                onClick={handleCloseDay}
                disabled={closingDay || !staff.nurse}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {closingDay ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                GENERAR REPORTE Y CERRAR
              </button>
            </motion.div>
          </motion.div>
        )}

        {showWhatsAppOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-emerald-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">¡Reporte Generado!</h3>
                <p className="text-slate-500 text-sm">El reporte ha sido guardado y exportado a Excel. Ahora puedes enviarlo por WhatsApp:</p>
              </div>

              <div className="space-y-3">
                {phoneNumbers.map((phone, index) => (
                  <button
                    key={index}
                    onClick={() => sendWhatsApp(phone)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-emerald-100">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="font-bold">{phone}</span>
                    </div>
                    <ChevronDown className="w-5 h-5 -rotate-90 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    if (!lastGeneratedReport) return;
                    const text = encodeURIComponent(lastGeneratedReport.whatsapp_summary);
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                  }}
                  className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all"
                >
                  OTRO CONTACTO
                </button>
              </div>

              <button
                onClick={() => setShowWhatsAppOptions(false)}
                className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-all"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Patient List Modal for History */}
        <AnimatePresence>
          {selectedReport && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">PACIENTES DEL DÍA</h2>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                      {selectedReport.header.date} • {selectedReport.header.day}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <PlusCircle className="w-6 h-6 rotate-45 text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                  {!selectedReport.patients || selectedReport.patients.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-medium">
                      No hay lista de pacientes detallada para este reporte.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">N°</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cédula</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Edad</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sexo</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso/Talla</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vitales</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo</th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnóstico</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedReport.patients.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors text-xs">
                              <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                              <td className="px-4 py-3 font-bold text-slate-700">{p.entryTime}</td>
                              <td className="px-4 py-3 font-bold text-slate-900">{p.name}</td>
                              <td className="px-4 py-3 font-medium text-slate-600">{p.idNumber || 'S/C'}</td>
                              <td className="px-4 py-3 font-medium text-slate-600">{p.age}</td>
                              <td className="px-4 py-3 font-bold text-slate-600">{p.gender}</td>
                              <td className="px-4 py-3 text-slate-500">
                                {p.weight}kg / {p.height}cm
                              </td>
                              <td className="px-4 py-3 text-slate-500">
                                <div className="flex flex-col gap-0.5">
                                  <span>FC: {p.heartRate}</span>
                                  <span>SpO2: {p.spo2}%</span>
                                  <span>T: {p.temperature}°C</span>
                                  <span>PA: {p.bloodPressure}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate" title={p.reason}>
                                {p.reason}
                              </td>
                              <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate font-bold italic" title={p.diagnosis}>
                                {p.diagnosis}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button 
                    onClick={() => exportToExcel(selectedReport.patients || [], selectedReport)}
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    DESCARGAR EXCEL
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AnimatePresence>
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
