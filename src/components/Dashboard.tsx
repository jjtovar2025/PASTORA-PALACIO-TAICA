import React from 'react';
import { HealthReport } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Activity, Users, ShieldAlert, ClipboardCheck } from 'lucide-react';

interface DashboardProps {
  reports: HealthReport[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Dashboard: React.FC<DashboardProps> = ({ reports }) => {
  if (reports.length === 0) return null;

  const latestReport = reports[0];

  // Data for Specializations
  const specData = [
    { name: 'Med. General', value: latestReport.stats.med_general },
    { name: 'Emergencia', value: latestReport.stats.emergencia },
    { name: 'Pediatría', value: latestReport.stats.pediatria },
    { name: 'Geriatría', value: latestReport.stats.geriatria },
    { name: 'Med. Interna', value: latestReport.stats.med_interna },
    { name: 'Ginecología', value: latestReport.stats.ginecologia },
    { name: 'Prenatal', value: latestReport.stats.prenatal },
  ].filter(d => d.value > 0);

  // Data for Nursing Activities
  const activityData = [
    { name: 'T/A', value: latestReport.activities.ta_control },
    { name: 'Glicemia', value: latestReport.activities.glicemia },
    { name: 'Peso', value: latestReport.activities.peso },
    { name: 'Tto E/V', value: latestReport.activities.tto_ev },
    { name: 'Tto I/M', value: latestReport.activities.tto_im },
    { name: 'Curas', value: latestReport.activities.curas },
    { name: 'Suturas', value: latestReport.activities.suturas },
    { name: 'Nebuliz.', value: latestReport.activities.nebulizaciones },
  ];

  // Data for Age Groups
  const ageData = [
    { name: '0-2', value: latestReport.age_groups.lactante_0_2 },
    { name: '3-5', value: latestReport.age_groups.preescolar_3_5 },
    { name: '6-11', value: latestReport.age_groups.escolar_6_11 },
    { name: '12-17', value: latestReport.age_groups.adolescente_12_17 },
    { name: '18-29', value: latestReport.age_groups.adulto_joven_18_29 },
    { name: '30-59', value: latestReport.age_groups.adulto_30_59 },
    { name: '60+', value: latestReport.age_groups.adulto_mayor_60 },
  ];

  // Data for Epidemiology
  const epiData = [
    { name: 'Cardio', value: latestReport.epidemiology.cardiovascular },
    { name: 'Diabetes', value: latestReport.epidemiology.diabetes },
    { name: 'IRA/Asma', value: latestReport.epidemiology.ira + latestReport.epidemiology.asma },
    { name: 'Fiebre/Dengue', value: latestReport.epidemiology.fiebre + latestReport.epidemiology.dengue },
    { name: 'COVID', value: latestReport.epidemiology.covid_19 },
    { name: 'Diarreas', value: latestReport.epidemiology.diarreas },
    { name: 'Hipertensión', value: latestReport.epidemiology.hipertension },
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Atendidos Hoy" value={latestReport.stats.total_patients} icon={Users} color="bg-blue-600" />
        <StatCard title="Actividades" value={Object.values(latestReport.activities).reduce((a, b) => a + b, 0)} icon={Activity} color="bg-emerald-600" />
        <StatCard title="Vigilancia" value={Object.values(latestReport.epidemiology).filter(v => typeof v === 'number').reduce((a, b) => (a as number) + (b as number), 0)} icon={ShieldAlert} color="bg-amber-600" />
        <StatCard title="Estado" value={latestReport.epidemiology.status_level} icon={ClipboardCheck} color={latestReport.epidemiology.status_level === 'CRITICAL' ? 'bg-red-600' : latestReport.epidemiology.status_level === 'WARNING' ? 'bg-amber-500' : 'bg-green-600'} />
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

        {/* Activities Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Actividades de Enfermería
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Epidemiology Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            Vigilancia Epidemiológica
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={epiData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
