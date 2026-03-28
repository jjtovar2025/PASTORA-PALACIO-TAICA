import React, { useState } from 'react';
import { PatientEntry } from '../types';
import { User, Activity, ShieldAlert, Save, Plus, Trash2, CheckCircle2, Clock, MapPin, Phone, Stethoscope, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

interface PatientEntryFormProps {
  onAdd: (entry: PatientEntry) => void;
}

export const PatientEntryForm: React.FC<PatientEntryFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState<Omit<PatientEntry, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    name: '',
    idNumber: '',
    birthDate: '',
    age: '',
    gender: 'F',
    weight: '',
    height: '',
    heartRate: '',
    spo2: '',
    temperature: '',
    bloodPressure: '',
    glucose: '',
    address: '',
    parish: '',
    phone: '',
    companionPhone: '',
    reason: '',
    specialty: '',
    diagnosis: '',
    treatmentGiven: '',
    treatmentPrescribed: '',
    referredHvsr: false,
    referredSpecialist: false,
    exitTime: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: PatientEntry = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9)
    };
    onAdd(entry);
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      name: '',
      idNumber: '',
      birthDate: '',
      age: '',
      gender: 'F',
      weight: '',
      height: '',
      heartRate: '',
      spo2: '',
      temperature: '',
      bloodPressure: '',
      glucose: '',
      address: '',
      parish: '',
      phone: '',
      companionPhone: '',
      reason: '',
      specialty: '',
      diagnosis: '',
      treatmentGiven: '',
      treatmentPrescribed: '',
      referredHvsr: false,
      referredSpecialist: false,
      exitTime: ''
    });
  };

  const InputField = ({ label, name, type = "text", placeholder = "", required = false }: any) => (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <input
        type={type}
        required={required}
        value={(formData as any)[name]}
        onChange={e => setFormData({ ...formData, [name]: e.target.value })}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección 1: Información Básica */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <User className="text-blue-600 w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800">Información Básica</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InputField label="Fecha" name="date" type="date" required />
          <InputField label="Hora Ingreso" name="entryTime" type="time" required />
          <div className="col-span-2">
            <InputField label="Nombres y Apellidos" name="name" required placeholder="Nombre completo" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InputField label="Cédula" name="idNumber" placeholder="V-00000000" />
          <InputField label="Fecha Nac." name="birthDate" type="date" />
          <InputField label="Edad" name="age" placeholder="Ej: 25" />
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sexo</label>
            <select
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold"
            >
              <option value="F">Femenino (F)</option>
              <option value="M">Masculino (M)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sección 2: Signos Vitales */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Activity className="text-emerald-600 w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800">Signos Vitales</h3>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          <InputField label="Peso (kg)" name="weight" />
          <InputField label="Talla (cm)" name="height" />
          <InputField label="F.C" name="heartRate" />
          <InputField label="% sPo2" name="spo2" />
          <InputField label="Temp ºC" name="temperature" />
          <InputField label="P.A" name="bloodPressure" />
          <InputField label="Gl" name="glucose" />
        </div>
      </div>

      {/* Sección 3: Ubicación y Contacto */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <MapPin className="text-purple-600 w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800">Ubicación y Contacto</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Dirección" name="address" placeholder="Calle, Sector..." />
          <InputField label="Parroquia" name="parish" placeholder="Ej: El Recreo" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Nº Telefónico" name="phone" placeholder="0414-0000000" />
          <InputField label="Telf. Acompañante" name="companionPhone" placeholder="0414-0000000" />
        </div>
      </div>

      {/* Sección 4: Consulta y Diagnóstico */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Stethoscope className="text-amber-600 w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800">Consulta y Diagnóstico</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Motivo de Consulta</label>
            <textarea
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold h-20 resize-none"
              placeholder="Describa el motivo..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Diagnóstico Médico</label>
            <textarea
              value={formData.diagnosis}
              onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold h-20 resize-none"
              placeholder="Diagnóstico..."
            />
          </div>
        </div>
        <InputField label="Especialidad" name="specialty" placeholder="Ej: Medicina General" />
      </div>

      {/* Sección 5: Tratamiento y Referencia */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
            <ClipboardList className="text-rose-600 w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800">Tratamiento y Referencia</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tratamiento Colocado</label>
            <textarea
              value={formData.treatmentGiven}
              onChange={e => setFormData({ ...formData, treatmentGiven: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold h-20 resize-none"
              placeholder="Tratamiento administrado..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tratamiento Recetado</label>
            <textarea
              value={formData.treatmentPrescribed}
              onChange={e => setFormData({ ...formData, treatmentPrescribed: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold h-20 resize-none"
              placeholder="Tratamiento para la casa..."
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
            <input
              type="checkbox"
              id="referredHvsr"
              checked={formData.referredHvsr}
              onChange={e => setFormData({ ...formData, referredHvsr: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="referredHvsr" className="text-xs font-bold text-slate-700">Referido al HVSR</label>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
            <input
              type="checkbox"
              id="referredSpecialist"
              checked={formData.referredSpecialist}
              onChange={e => setFormData({ ...formData, referredSpecialist: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="referredSpecialist" className="text-xs font-bold text-slate-700">Ref. Consulta Espec.</label>
          </div>
          <InputField label="Hora Salida" name="exitTime" type="time" />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
      >
        <Plus className="w-5 h-5" />
        REGISTRAR PACIENTE
      </button>
    </form>
  );
};
