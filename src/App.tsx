import React, { useState, useEffect } from 'react';
import { db, initDB } from './db';
import { Paciente, Consulta } from './types';
import { sincronizarPendientes } from './services/syncService';
import { Paso1Paciente } from './components/Paso1Paciente';
import { Paso2SignosVitales } from './components/Paso2SignosVitales';
import { Paso3Confirmacion } from './components/Paso3Confirmacion';
import { FichaPaciente } from './components/FichaPaciente';
import { ConfiguracionCentro } from './components/ConfiguracionCentro';
import { 
  Stethoscope, 
  History, 
  Settings, 
  CloudUpload, 
  Wifi, 
  WifiOff, 
  Loader2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function App() {
  const [activeTab, setActiveTab] = useState<'nueva' | 'historial' | 'ajustes'>('nueva');
  const [step, setStep] = useState(1);
  const [pacienteActual, setPacienteActual] = useState<Paciente | null>(null);
  const [consultaActual, setConsultaActual] = useState<Partial<Consulta>>({});
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setIsReady(true));

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    const res = await sincronizarPendientes();
    setSyncing(false);
    if (!res.success) alert(res.message);
  };

  const startConsulta = (paciente: Paciente) => {
    setPacienteActual(paciente);
    setConsultaActual({
      paciente_id: paciente.id,
      fecha: new Date().toISOString().split('T')[0],
      hora_ingreso: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }),
      especialidad: 'MEDICINA GENERAL',
      estado_sincronizacion: 'pendiente'
    });
    setStep(2);
  };

  const finalizeConsulta = async () => {
    if (!pacienteActual || !consultaActual.motivo_consulta) return;

    const config = await db.configuracion.get(1);
    const finalizedConsulta: Consulta = {
      ...(consultaActual as Consulta),
      medico_guardia: config?.medico_guardia_default || 'NO ASIGNADO',
      enfermera_guardia: config?.enfermera_guardia_default || 'NO ASIGNADO',
      centro_nombre: config?.nombre_centro || 'CENTRO',
      centro_asic: config?.asic || 'ASIC',
      centro_parroquia: config?.parroquia || 'PARROQUIA',
      hora_salida: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
    };

    await db.consultas.add(finalizedConsulta);
    alert('Consulta guardada exitosamente');
    
    // Reset wizard
    setStep(1);
    setPacienteActual(null);
    setConsultaActual({});
    
    // Auto sync if online
    if (online) handleSync();
  };

  if (!isReady) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />
        <p className="text-blue-200 font-bold uppercase tracking-widest animate-pulse">Iniciando Base de Datos...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-28">
      {/* Header */}
      <header className="bg-blue-900 p-6 shadow-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Stethoscope className="text-blue-900 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl tracking-tight leading-none">MORBILIDAD DIARIA</h1>
              <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Salud Pública • Venezuela</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${online ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {online ? 'En Línea' : 'Offline'}
            </div>
            <button 
              onClick={handleSync}
              disabled={syncing}
              className={`p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all active:scale-95 ${syncing ? 'animate-pulse' : ''}`}
            >
              {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudUpload className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'nueva' && (
            <motion.div 
              key="nueva" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-slate-800">Nueva Consulta</h2>
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-3 h-3 rounded-full transition-all ${step === i ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`} />
                  ))}
                </div>
              </div>

              {step === 1 && <Paso1Paciente onNext={startConsulta} />}
              {step === 2 && pacienteActual && (
                <Paso2SignosVitales 
                  paciente={pacienteActual} 
                  consulta={consultaActual} 
                  onUpdate={(data) => setConsultaActual(prev => ({ ...prev, ...data }))}
                  onNext={() => {
                    if (!consultaActual.motivo_consulta) {
                      alert('El motivo de consulta es obligatorio.');
                      return;
                    }
                    setStep(3);
                  }}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && pacienteActual && (
                <AsyncStep3Wrapper 
                  paciente={pacienteActual} 
                  consulta={consultaActual} 
                  onBack={() => setStep(2)} 
                  onSave={finalizeConsulta} 
                />
              )}
            </motion.div>
          )}

          {activeTab === 'historial' && (
            <motion.div key="historial" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <FichaPaciente />
            </motion.div>
          )}

          {activeTab === 'ajustes' && (
            <motion.div key="ajustes" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <ConfiguracionCentro />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Nav Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-2xl mx-auto flex justify-around items-center">
          <NavButton 
            active={activeTab === 'nueva'} 
            onClick={() => setActiveTab('nueva')} 
            icon={Stethoscope} 
            label="Consulta" 
          />
          <NavButton 
            active={activeTab === 'historial'} 
            onClick={() => setActiveTab('historial')} 
            icon={History} 
            label="Historial" 
          />
          <NavButton 
            active={activeTab === 'ajustes'} 
            onClick={() => setActiveTab('ajustes')} 
            icon={Settings} 
            label="Ajustes" 
          />
        </div>
      </nav>
    </div>
  );
}

// Wrapper for Step 3 to handle async fetching of config
function AsyncStep3Wrapper({ paciente, consulta, onBack, onSave }: any) {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    db.configuracion.get(1).then(setConfig);
  }, []);

  if (!config) return <Loader2 className="animate-spin mx-auto w-10 h-10 text-blue-600" />;

  return (
    <Paso3Confirmacion 
      paciente={paciente} 
      consulta={consulta} 
      config={config} 
      onBack={onBack} 
      onSave={onSave} 
    />
  );
}

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-700 scale-110' : 'text-slate-400'}`}
  >
    <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-blue-100 shadow-sm' : 'hover:bg-slate-50'}`}>
      <Icon className={`w-7 h-7 ${active ? 'stroke-[3px]' : 'stroke-[2px]'}`} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
