import React, { useState, useMemo } from 'react';
import { HealthReport } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Activity, Users, ShieldAlert, ClipboardCheck, Calendar, ChevronDown } from 'lucide-react';

interface DashboardProps {
  reports: HealthReport[];
}

type Timeframe = 'daily' | 'monthly' | 'quarterly' | 'all';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Dashboard: React.FC<DashboardProps> = ({ reports }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(reports.length > 0 ? reports[0].header.date : '');

  const filteredReports = useMemo(() => {
    if (reports.length === 0) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(currentMonth / 3);

    return reports.filter(report => {
      const reportDate = new Date(report.header.date);
      const reportMonth = reportDate.getMonth();
      const reportYear = reportDate.getFullYear();
      const reportQuarter = Math.floor(reportMonth / 3);

      if (timeframe === 'daily') {
        return report.header.date === selectedDate;
      }
      if (timeframe === 'monthly') {
        return reportMonth === currentMonth && reportYear === currentYear;
      }
      if (timeframe === 'quarterly') {
        return reportQuarter === currentQuarter && reportYear === currentYear;
      }
      return true; // 'all'
    });
  }, [reports, timeframe, selectedDate]);

  const aggregatedData = useMemo(() => {
    if (filteredReports.length === 0) return null;

    const initial: HealthReport = JSON.parse(JSON.stringify(filteredReports[0]));
    
    // If more than one report, aggregate numeric values
    if (filteredReports.length > 1) {
      // Reset numeric values to 0 before summing
      const resetNumeric = (obj: any) => {
        for (const key in obj) {
          if (typeof obj[key] === 'number') obj[key] = 0;
          else if (typeof obj[key] === 'object' && obj[key] !== null) resetNumeric(obj[key]);
        }
      };
      resetNumeric(initial.stats);
      resetNumeric(initial.activities);
      resetNumeric(initial.age_groups);
      resetNumeric(initial.epidemiology);

      filteredReports.forEach(report => {
        const sumNumeric = (target: any, source: any) => {
          for (const key in source) {
            if (typeof source[key] === 'number') {
              target[key] = (target[key] || 0) + source[key];
            } else if (typeof source[key] === 'object' && source[key] !== null) {
              if (!target[key]) target[key] = {};
              sumNumeric(target[key], source[key]);
            }
          }
        };
        sumNumeric(initial.stats, report.stats);
        sumNumeric(initial.activities, report.activities);
        sumNumeric(initial.age_groups, report.age_groups);
        sumNumeric(initial.epidemiology, report.epidemiology);
      });

      // For aggregated reports, status level should be the most critical one found
      const levels = ['NORMAL', 'WARNING', 'CRITICAL'];
      let maxLevel = 0;
      filteredReports.forEach(r => {
        const idx = levels.indexOf(r.epidemiology.status_level);
        if (idx > maxLevel) maxLevel = idx;
      });
      initial.epidemiology.status_level = levels[maxLevel] as any;
    }

    return initial;
  }, [filteredReports]);

  if (reports.length === 0) return (
    <div className="bg-white p-12 rounded-3xl border border-slate-200 border-dashed text-center space-y-4">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
        <LayoutDashboard className="text-slate-300 w-8 h-8" />
      </div>
      <p className="text-slate-500 font-bold text-sm">No hay reportes para analizar aún.</p>
    </div>
  );

  if (!aggregatedData) return (
    <div className="space-y-6">
      <TimeframeSelector 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        selectedDate={selectedDate} 
        setSelectedDate={setSelectedDate} 
        availableDates={reports.map(r => r.header.date)}
        filteredCount={filteredReports.length}
      />
      <div className="bg-white p-12 rounded-3xl border border-slate-200 border-dashed text-center">
        <p className="text-slate-500 font-bold text-sm">No se encontraron datos para el periodo seleccionado.</p>
      </div>
    </div>
  );

  // Data for Specializations
  const specData = useMemo(() => {
    const specs: { [key: string]: number } = {};
    filteredReports.forEach(r => {
      if (r.patients) {
        r.patients.forEach(p => {
          const s = p.specialty || 'General';
          specs[s] = (specs[s] || 0) + 1;
        });
      }
    });
    return Object.entries(specs).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [filteredReports]);

  // Data for Age Groups
  const ageData = [
    { name: '0-2', value: aggregatedData.age_groups.lactante_0_2 },
    { name: '3-5', value: aggregatedData.age_groups.preescolar_3_5 },
    { name: '6-11', value: aggregatedData.age_groups.escolar_6_11 },
    { name: '12-17', value: aggregatedData.age_groups.adolescente_12_17 },
    { name: '18-29', value: aggregatedData.age_groups.adulto_joven_18_29 },
    { name: '30-59', value: aggregatedData.age_groups.adulto_30_59 },
    { name: '60+', value: aggregatedData.age_groups.adulto_mayor_60 },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <TimeframeSelector 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        selectedDate={selectedDate} 
        setSelectedDate={setSelectedDate} 
        availableDates={reports.map(r => r.header.date)}
        filteredCount={filteredReports.length}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Atendidos" value={aggregatedData.stats.total_patients} icon={Users} color="bg-blue-600" />
        <StatCard title="Femenino" value={aggregatedData.stats.female} icon={Users} color="bg-pink-500" />
        <StatCard title="Masculino" value={aggregatedData.stats.male} icon={Users} color="bg-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Specializations Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Distribución por Especialidad
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={specData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {specData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {specData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Age Groups Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Distribución por Edad
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeframeSelector = ({ timeframe, setTimeframe, selectedDate, setSelectedDate, availableDates, filteredCount }: any) => {
  const uniqueDates = Array.from(new Set(availableDates)).sort().reverse();

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 text-slate-400">
        <Calendar className="w-5 h-5" />
        <span className="text-xs font-black uppercase tracking-widest">Periodo:</span>
      </div>
      
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button 
          onClick={() => setTimeframe('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeframe === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          DIARIO
        </button>
        <button 
          onClick={() => setTimeframe('monthly')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeframe === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          MES
        </button>
        <button 
          onClick={() => setTimeframe('quarterly')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeframe === 'quarterly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          TRIMESTRE
        </button>
        <button 
          onClick={() => setTimeframe('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeframe === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          TODO
        </button>
      </div>

      {timeframe === 'daily' && (
        <div className="relative">
          <select 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 px-4 py-2 pr-10 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {uniqueDates.map((date: any) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      )}

      <div className="ml-auto flex flex-col items-end">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {timeframe === 'daily' ? 'Análisis de un solo día' : 
           timeframe === 'monthly' ? 'Acumulado del mes actual' : 
           timeframe === 'quarterly' ? 'Acumulado del trimestre' : 
           'Histórico completo'}
        </span>
        <span className="text-[9px] font-bold text-blue-500">
          {filteredCount} {filteredCount === 1 ? 'reporte incluido' : 'reportes incluidos'}
        </span>
      </div>
    </div>
  );
};

const LayoutDashboard = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);
