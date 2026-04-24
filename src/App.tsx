import React, { useState, useEffect } from 'react';
import { db, initDB } from './db';
import { Paciente, Consulta, AuthContext } from './types';
import { Paso1Paciente } from './components/Paso1Paciente';
import { Paso2Signos } from './components/Paso2Signos';
import { Paso3Diagnostico } from './components/Paso3Diagnostico';
import { Paso3Confirmacion } from './components/Paso3Confirmacion';
import { FichaPaciente } from './components/FichaPaciente';
import { ConfiguracionCentro } from './components/ConfiguracionCentro';
import { Dashboard } from './components/Dashboard';
import { ReporteDiario } from './components/ReporteDiario';
import { Login } from './components/Login';
import { useLiveQuery } from 'dexie-react-hooks';
import { sincronizarPendientes } from './services/syncService';
import { 
  Stethoscope, 
  History, 
  Settings, 
  CloudUpload, 
  Wifi, 
  WifiOff, 
  Loader2,
  LayoutDashboard,
  FileText,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [auth, setAuth] = useState<AuthContext | null>(null);
  const [activeTab, setActiveTab] = useState<'dash' | 'nueva' | 'historial' | 'reporte' | 'ajustes'>('dash');
  const [step, setStep] = useState(1);
  const [pacienteActual, setPacienteActual] = useState<Paciente | null>(null);
  const [consultaActual, setConsultaActual] = useState<Partial<Consulta>>({});
  
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const pendientesCount = useLiveQuery(
    () => db.consultas.where('estado_sincronizacion').equals('pendiente').count()
  );

  useEffect(() => {
    initDB().then(() => setIsReady(true));

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    const storedAuth = localStorage.getItem('morbilidad_auth');
    if (storedAuth) setAuth(JSON.parse(storedAuth));

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleLogin = (authData: AuthContext) => {
    setAuth(authData);
    localStorage.setItem('morbilidad_auth', JSON.stringify(authData));
  };

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      setAuth(null);
      localStorage.removeItem('morbilidad_auth');
    }
  };

  const handleSync = async () => {
    if (!online || syncing) return;
    setSyncing(true);
    await sincronizarPendientes();
    setSyncing(false);
  };

  const handlePacienteSelected = (p: Paciente) => {
    setPacienteActual(p);
    setStep(2);
  };

  const handleSignosCompletados = (datos: Partial<Consulta>) => {
    setConsultaActual({ ...consultaActual, ...datos });
    setStep(3);
  };

  const handleDiagnosticoCompletado = (datos: Partial<Consulta>) => {
    setConsultaActual({ ...consultaActual, ...datos });
    setStep(4);
  };

  const final_finish = () => {
    setStep(1);
    setPacienteActual(null);
    setConsultaActual({});
    setActiveTab('dash');
    if (online) handleSync();
  };

  if (!isReady) return <div className="h-screen flex items-center justify-center p-12"><Loader2 className="animate-spin w-12 h-12 text-blue-600" /></div>;

  if (!auth) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      <header className="bg-white border-b border-slate-100 p-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-slate-900 font-black text-xl tracking-tight leading-none uppercase">Morbilidad CPT</h1>
              <div className={`flex items-center gap-1.5 mt-1 font-black text-[10px] uppercase tracking-widest ${online ? 'text-emerald-500' : 'text-slate-400'}`}>
                {online ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                {online ? 'En Línea' : 'Offline'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{auth.role}</p>
              <p className="text-sm font-black text-slate-700">{auth.userName}</p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleSync}
              disabled={syncing}
              className={`relative p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl transition-all border border-slate-200 ${syncing ? 'animate-pulse' : ''}`}
            >
              {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudUpload className="w-5 h-5" />}
              {pendientesCount !== undefined && pendientesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">
                  {pendientesCount}
                </span>
              )}
            </motion.button>
            <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dash' && (
            <motion.div key="dash" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <Dashboard />
            </motion.div>
          )}

          {activeTab === 'nueva' && (
            <motion.div 
              key="nueva" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center bg-blue-50 px-6 py-4 rounded-3xl border border-blue-100">
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">Nueva Consulta</h2>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${step === i ? 'bg-blue-600 scale-125' : 'bg-blue-200'}`} />
                  ))}
                </div>
              </div>
              
              {step === 1 && <Paso1Paciente onNext={handlePacienteSelected} />}
              {step === 2 && <Paso2Signos onBack={() => setStep(1)} onNext={handleSignosCompletados} />}
              {step === 3 && <Paso3Diagnostico onBack={() => setStep(2)} onNext={handleDiagnosticoCompletado} />}
              {step === 4 && (
                <Step4Wrapper 
                  paciente={pacienteActual!} 
                  consulta={consultaActual} 
                  auth={auth}
                  onBack={() => setStep(3)} 
                  onFinish={final_finish} 
                />
              )}
            </motion.div>
          )}

          {activeTab === 'historial' && (
            <motion.div key="hist" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <FichaPaciente />
            </motion.div>
          )}

          {activeTab === 'reporte' && (
            <motion.div key="rep" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ReporteDiario auth={auth} />
            </motion.div>
          )}

          {activeTab === 'ajustes' && (
            <motion.div key="adj" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ConfiguracionCentro />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-15px_50px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-2xl mx-auto grid grid-cols-5 gap-2">
          <NavButton active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon={LayoutDashboard} label="Dash" />
          <NavButton active={activeTab === 'nueva'} onClick={() => setActiveTab('nueva')} icon={Stethoscope} label="Consulta" />
          <NavButton active={activeTab === 'historial'} onClick={() => setActiveTab('historial')} icon={History} label="Historial" />
          <NavButton active={activeTab === 'reporte'} onClick={() => setActiveTab('reporte')} icon={FileText} label="Reporte" />
          <NavButton active={activeTab === 'ajustes'} onClick={() => setActiveTab('ajustes')} icon={Settings} label="Ajustes" />
        </div>
      </nav>
    </div>
  );
}

const Step4Wrapper = ({ paciente, consulta, auth, onBack, onFinish }: any) => {
  const [config, setConfig] = useState<any>(null);
  useEffect(() => {
    db.configuracion.get(1).then(setConfig);
  }, []);

  if (!config) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>;

  return (
    <Paso3Confirmacion 
      paciente={paciente} 
      consulta={consulta} 
      config={config}
      auth={auth}
      onBack={onBack} 
      onFinish={onFinish} 
    />
  );
};

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group transition-all">
    <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 group-hover:bg-slate-50'}`}>
      <Icon className={`w-6 h-6 ${active ? 'stroke-[3px]' : 'stroke-[2px]'}`} />
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-blue-700' : 'text-slate-400'}`}>{label}</span>
  </button>
);
