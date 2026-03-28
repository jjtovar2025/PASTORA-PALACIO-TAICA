import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { HealthReport } from '../types';

interface DashboardProps {
  reports: HealthReport[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC<DashboardProps> = ({ reports }) => {
  if (reports.length === 0) return null;

  const latest = reports[0];
  
  const etarioData = [
    { name: '0-18', value: latest.etario["0_18"] },
    { name: '19-59', value: latest.etario["19_59"] },
    { name: '60+', value: latest.etario["60_mas"] },
  ];

  const enfermeriaData = Object.entries(latest.enfermeria).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value
  }));

  const alertasData = Object.entries(latest.alertas_epidemiologicas).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value
  }));

  const trendData = reports.slice(0, 7).reverse().map(r => ({
    fecha: r.registro.fecha.split('-').slice(2).join('/'),
    pacientes: r.totales.pacientes
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
      {/* Trend Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-1 md:col-span-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Tendencia de Pacientes (Últimos 7 días)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pacientes" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Etario Pie Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Distribución Etaria</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={etarioData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {etarioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enfermeria Bar Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-1 md:col-span-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Actividades de Enfermería</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enfermeriaData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} fontSize={10} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertas Bar Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Alertas Epidemiológicas</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={alertasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={10} tick={{ angle: -45, textAnchor: 'end' }} height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
