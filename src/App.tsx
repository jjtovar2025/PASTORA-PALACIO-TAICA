import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  PlusCircle, 
  AlertTriangle,
  Users,
  Stethoscope,
  Calendar as CalendarIcon,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { HealthReport } from './types';
import { getReports } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { ReportForm } from './components/ReportForm';
import { cn } from './lib/utils';

export default function App() {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'new'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getReports();
      if (data && Array.isArray(data)) {
        const formattedReports = data.map((r: any) => r.data as HealthReport);
        setReports(formattedReports);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewReport = (report: HealthReport) => {
    setReports([report, ...reports]);
    setTimeout(() => setActiveTab('dashboard'), 1500);
  };

  const getSemaforoColor = (status: string) => {
    switch (status) {
      case 'ROJO': return 'bg-red-500 shadow-red-200';
      case 'NARANJA': return 'bg-orange-500 shadow-orange-200';
      case 'VERDE': return 'bg-green-500 shadow-green-200';
      default: return 'bg-gray-400';
    }
  };

  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  const hasAppsScript = !!import.meta.env.VITE_APPS_SCRIPT_URL;

  console.log("App state:", { loading, reportsCount: reports.length, isConfigured });

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Cargando datos del Centro + Salud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {!isConfigured && activeTab !== 'new' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
              <Settings className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Conexión Pendiente</h3>
            <p className="text-slate-600 mb-6">
              Detectamos que faltan las llaves de <b>Supabase</b>. Agrégalas en el panel de Secrets para activar el Dashboard.
            </p>
            <div className="space-y-2 mb-8">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Supabase</span>
                {isConfigured ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Google Sheets</span>
                {hasAppsScript ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('new')}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
            >
              Ir al Procesador de IA
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Centro + Salud</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Gestión Morbilidad</p>
            </div>
          </div>

          <nav className="space-y-1">
            <NavItem 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard"
            />
            <NavItem 
              active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')}
              icon={<FileText className="w-5 h-5" />}
              label="Historial"
            />
            <NavItem 
              active={activeTab === 'new'} 
              onClick={() => setActiveTab('new')}
              icon={<PlusCircle className="w-5 h-5" />}
              label="Nuevo Reporte"
            />
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-100">
          <NavItem 
            active={false}
            onClick={() => {}}
            icon={<Settings className="w-5 h-5" />}
            label="Configuración"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div id="app-header-content">
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Panel de Control'}
              {activeTab === 'reports' && 'Historial de Reportes'}
              {activeTab === 'new' && 'Procesar Nuevo Reporte'}
            </h2>
            <p className="text-slate-500">Pastora Palacios Taica — Sistema de Vigilancia</p>
          </div>

          {reports.length > 0 && (
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className={cn("w-3 h-3 rounded-full", getSemaforoColor(reports[0].registro.semaforo))} />
              <span className="text-sm font-bold text-slate-700">Estado: {reports[0].registro.semaforo}</span>
            </div>
          )}
        </header>

        <div className="tab-content">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  icon={<Users className="text-blue-600" />} 
                  label="Total Pacientes" 
                  value={reports[0]?.totales.pacientes || 0}
                  subValue="Último reporte"
                />
                <StatCard 
                  icon={<Stethoscope className="text-emerald-600" />} 
                  label="Med. General" 
                  value={reports[0]?.totales.med_general || 0}
                  subValue="Último reporte"
                />
                <StatCard 
                  icon={<AlertTriangle className="text-rose-600" />} 
                  label="Alertas Críticas" 
                  value={reports[0]?.alertas_epidemiologicas.casos_criticos || 0}
                  subValue="Casos detectados"
                />
                <StatCard 
                  icon={<CalendarIcon className="text-amber-600" />} 
                  label="Fecha Reporte" 
                  value={reports[0]?.registro.fecha || '--'}
                  subValue={reports[0]?.registro.dia || '--'}
                  isText
                />
              </div>

              <Dashboard reports={reports} />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-bottom border-slate-200">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Responsable</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pacientes</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Semáforo</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((report, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{report.registro.fecha}</div>
                        <div className="text-xs text-slate-500">{report.registro.dia}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">{report.registro.responsable}</td>
                      <td className="p-4 text-sm font-bold text-slate-900">{report.totales.pacientes}</td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          report.registro.semaforo === 'ROJO' ? 'bg-red-100 text-red-700' :
                          report.registro.semaforo === 'NARANJA' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        )}>
                          {report.registro.semaforo}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 italic">No hay reportes registrados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'new' && (
            <div className="max-w-2xl mx-auto">
              <ReportForm onSuccess={handleNewReport} />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 lg:hidden flex justify-around p-3 z-50">
        <button onClick={() => setActiveTab('dashboard')} className={cn("p-2 rounded-xl", activeTab === 'dashboard' ? "text-blue-600 bg-blue-50" : "text-slate-400")}>
          <LayoutDashboard className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('new')} className={cn("p-2 rounded-xl", activeTab === 'new' ? "text-blue-600 bg-blue-50" : "text-slate-400")}>
          <PlusCircle className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('reports')} className={cn("p-2 rounded-xl", activeTab === 'reports' ? "text-blue-600 bg-blue-50" : "text-slate-400")}>
          <FileText className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all",
        active 
          ? "bg-blue-50 text-blue-600 shadow-sm" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
    </button>
  );
}

function StatCard({ icon, label, value, subValue, isText = false }: { icon: React.ReactNode, label: string, value: string | number, subValue: string, isText?: boolean }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <h4 className={cn("font-bold text-slate-900", isText ? "text-lg" : "text-2xl")}>{value}</h4>
        <p className="text-[10px] text-slate-400 font-medium">{subValue}</p>
      </div>
    </div>
  );
}
