import React, { useState, useEffect } from 'react';
import { PatientEntry } from '../types';
import { User, Activity, ShieldAlert, Save, Plus, Trash2, CheckCircle2, Clock, MapPin, Phone, Stethoscope, ClipboardList, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientEntryFormProps {
  onAdd: (entry: PatientEntry) => void;
}

const AUTOSAVE_KEY = 'health_app_patient_form_autosave';

const InputField = React.memo(({ label, name, value, onChange, type = "text", placeholder = "", required = false }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={e => onChange(name, e.target.value)}
      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold"
      placeholder={placeholder}
    />
  </div>
));

const TextAreaField = React.memo(({ label, name, value, onChange, placeholder = "", height = "h-20" }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <textarea
      value={value}
      onChange={e => onChange(name, e.target.value)}
      className={`w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold ${height} resize-none`}
      placeholder={placeholder}
    />
  </div>
));

export const PatientEntryForm: React.FC<PatientEntryFormProps> = ({ onAdd }) => {
  const initialFormState: Omit<PatientEntry, 'id'> = {
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
  };

  const [formData, setFormData] = useState<Omit<PatientEntry, 'id'>>(initialFormState);
  const [showAutosaveAlert, setShowAutosaveAlert] = useState(false);

  // Load autosave on mount
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only show alert if there's actual data (e.g. name or reason)
        if (parsed.name || parsed.reason || parsed.idNumber) {
          setFormData(parsed);
          setShowAutosaveAlert(true);
          setTimeout(() => setShowAutosaveAlert(false), 5000);
        }
      } catch (e) {
        console.error("Error loading autosave", e);
      }
    }
  }, []);

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  // Save on exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  const handleInputChange = React.useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: PatientEntry = {
      ...formData,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)
    };
    onAdd(entry);
    // Reset form and clear autosave
    setFormData({
      ...initialFormState,
      date: new Date().toISOString().split('T')[0],
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    });
    localStorage.removeItem(AUTOSAVE_KEY);
  };

  const clearForm = () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar el formulario? Se perderán los datos no guardados.')) {
      setFormData({
        ...initialFormState,
        date: new Date().toISOString().split('T')[0],
        entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      });
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showAutosaveAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-12 left-0 right-0 z-10 flex justify-center"
          >
            <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" />
              DATOS RECUPERADOS AUTOMÁTICAMENTE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección 1: Información Básica */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <User className="text-blue-600 w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800">Información Básica</h3>
            </div>
            <button
              type="button"
              onClick={clearForm}
              className="p-2 text-slate-300 hover:text-amber-500 transition-colors"
              title="Limpiar Formulario"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputField label="Fecha" name="date" type="date" required value={formData.date} onChange={handleInputChange} />
            <InputField label="Hora Ingreso" name="entryTime" type="time" required value={formData.entryTime} onChange={handleInputChange} />
            <div className="col-span-2">
              <InputField label="Nombres y Apellidos" name="name" required placeholder="Nombre completo" value={formData.name} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputField label="Cédula" name="idNumber" placeholder="V-00000000" value={formData.idNumber} onChange={handleInputChange} />
            <InputField label="Fecha Nac." name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} />
            <InputField label="Edad" name="age" placeholder="Ej: 25" value={formData.age} onChange={handleInputChange} />
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sexo</label>
              <select
                value={formData.gender}
                onChange={e => handleInputChange('gender', e.target.value)}
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
            <InputField label="Peso (kg)" name="weight" value={formData.weight} onChange={handleInputChange} />
            <InputField label="Talla (cm)" name="height" value={formData.height} onChange={handleInputChange} />
            <InputField label="F.C" name="heartRate" value={formData.heartRate} onChange={handleInputChange} />
            <InputField label="% sPo2" name="spo2" value={formData.spo2} onChange={handleInputChange} />
            <InputField label="Temp ºC" name="temperature" value={formData.temperature} onChange={handleInputChange} />
            <InputField label="P.A" name="bloodPressure" value={formData.bloodPressure} onChange={handleInputChange} />
            <InputField label="Gl" name="glucose" value={formData.glucose} onChange={handleInputChange} />
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
            <InputField label="Dirección" name="address" placeholder="Calle, Sector..." value={formData.address} onChange={handleInputChange} />
            <InputField label="Parroquia" name="parish" placeholder="Ej: El Recreo" value={formData.parish} onChange={handleInputChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Nº Telefónico" name="phone" placeholder="0414-0000000" value={formData.phone} onChange={handleInputChange} />
            <InputField label="Telf. Acompañante" name="companionPhone" placeholder="0414-0000000" value={formData.companionPhone} onChange={handleInputChange} />
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
            <TextAreaField label="Motivo de Consulta" name="reason" value={formData.reason} onChange={handleInputChange} placeholder="Describa el motivo..." />
            <TextAreaField label="Diagnóstico Médico" name="diagnosis" value={formData.diagnosis} onChange={handleInputChange} placeholder="Diagnóstico..." />
          </div>
          <InputField label="Especialidad" name="specialty" placeholder="Ej: Medicina General" value={formData.specialty} onChange={handleInputChange} />
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
            <TextAreaField label="Tratamiento Colocado" name="treatmentGiven" value={formData.treatmentGiven} onChange={handleInputChange} placeholder="Tratamiento administrado..." />
            <TextAreaField label="Tratamiento Recetado" name="treatmentPrescribed" value={formData.treatmentPrescribed} onChange={handleInputChange} placeholder="Tratamiento para la casa..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <input
                type="checkbox"
                id="referredHvsr"
                checked={formData.referredHvsr}
                onChange={e => handleInputChange('referredHvsr', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="referredHvsr" className="text-xs font-bold text-slate-700">Referido al HVSR</label>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <input
                type="checkbox"
                id="referredSpecialist"
                checked={formData.referredSpecialist}
                onChange={e => handleInputChange('referredSpecialist', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="referredSpecialist" className="text-xs font-bold text-slate-700">Ref. Consulta Espec.</label>
            </div>
            <InputField label="Hora Salida" name="exitTime" type="time" value={formData.exitTime} onChange={handleInputChange} />
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
    </div>
  );
};
