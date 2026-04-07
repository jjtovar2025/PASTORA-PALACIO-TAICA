import React, { useState, useEffect } from 'react';
import { PatientEntry } from '../types';
import { User, Activity, ShieldAlert, Save, Plus, Trash2, CheckCircle2, Clock, MapPin, Phone, Stethoscope, ClipboardList, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientEntryFormProps {
  onAdd: (entry: PatientEntry) => void;
  editingPatient?: PatientEntry | null;
  onUpdate?: (entry: PatientEntry) => void;
  onCancelEdit?: () => void;
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

const CheckboxField = React.memo(({ label, name, checked, onChange }: any) => (
  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
    <input
      type="checkbox"
      id={name}
      checked={checked}
      onChange={e => onChange(name, e.target.checked)}
      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
    />
    <label htmlFor={name} className="text-[10px] font-bold text-slate-700 cursor-pointer select-none">{label}</label>
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

export const PatientEntryForm: React.FC<PatientEntryFormProps> = ({ onAdd, editingPatient, onUpdate, onCancelEdit }) => {
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
    exitTime: '',
    tto_ev: false,
    tto_im: false,
    tto_sl: false,
    tto_vo: false,
    tto_sc: false,
    tto_protocolo: false,
    nebulizaciones: false,
    curas: false,
    suturas: false,
    retiro_puntos: false,
    sondas: false,
    lavado_ocular: false,
    lavado_nasal: false,
    lavado_oidos: false,
    electros: false,
    visitas_domiciliares: false,
    jornadas_especiales: false,
    entregas_ayudas: false,
    vacunas_rutinas: false,
    referencia_ambulancia: false,
    referencia_propios_medios: false
  };

  const [formData, setFormData] = useState<Omit<PatientEntry, 'id'>>(initialFormState);
  const [showAutosaveAlert, setShowAutosaveAlert] = useState(false);

  // Load editing patient into form
  useEffect(() => {
    if (editingPatient) {
      const { id, ...rest } = editingPatient;
      setFormData(rest);
    } else {
      setFormData({
        ...initialFormState,
        date: new Date().toISOString().split('T')[0],
        entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      });
    }
  }, [editingPatient]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime())) return '';
      
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age >= 0 ? age.toString() : '0';
    } catch (e) {
      return '';
    }
  };

  // Update age when birthDate changes
  useEffect(() => {
    if (formData.birthDate) {
      const newAge = calculateAge(formData.birthDate);
      if (newAge !== formData.age) {
        setFormData(prev => ({ ...prev, age: newAge }));
      }
    }
  }, [formData.birthDate]);

  // Load autosave on mount
  useEffect(() => {
    if (editingPatient) return; // Don't load autosave when editing
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
  }, [editingPatient]);

  // Autosave every 30 seconds
  useEffect(() => {
    if (editingPatient) return; // Don't autosave when editing
    const interval = setInterval(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, editingPatient]);

  // Save on exit
  useEffect(() => {
    if (editingPatient) return;
    const handleBeforeUnload = () => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, editingPatient]);

  const handleInputChange = React.useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPatient && onUpdate) {
      onUpdate({
        ...formData,
        id: editingPatient.id
      });
    } else {
      const entry: PatientEntry = {
        ...formData,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)
      };
      onAdd(entry);
    }

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
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Edad</label>
              <input
                type="text"
                value={formData.age}
                onChange={e => handleInputChange('age', e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                placeholder="Ej: 25"
              />
              <p className="text-[9px] text-slate-400 italic mt-1">Se calcula automáticamente desde la fecha de nacimiento</p>
            </div>
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

        {/* Sección 5: Tratamiento y Actividades */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <ClipboardList className="text-rose-600 w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Tratamiento y Actividades</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextAreaField label="Tratamiento Colocado" name="treatmentGiven" value={formData.treatmentGiven} onChange={handleInputChange} placeholder="Tratamiento administrado..." />
            <TextAreaField label="Tratamiento Recetado" name="treatmentPrescribed" value={formData.treatmentPrescribed} onChange={handleInputChange} placeholder="Tratamiento para la casa..." />
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Vías de Administración (Tto)</h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <CheckboxField label="💉 Tto E/V" name="tto_ev" checked={formData.tto_ev} onChange={handleInputChange} />
              <CheckboxField label="💉 Tto I/M" name="tto_im" checked={formData.tto_im} onChange={handleInputChange} />
              <CheckboxField label="💉 Tto S/L" name="tto_sl" checked={formData.tto_sl} onChange={handleInputChange} />
              <CheckboxField label="💉 Tto V/O" name="tto_vo" checked={formData.tto_vo} onChange={handleInputChange} />
              <CheckboxField label="💉 Tto S/C" name="tto_sc" checked={formData.tto_sc} onChange={handleInputChange} />
              <CheckboxField label="Tto Protocolo" name="tto_protocolo" checked={formData.tto_protocolo} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Otras Actividades de Enfermería</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <CheckboxField label="Nebulizaciones" name="nebulizaciones" checked={formData.nebulizaciones} onChange={handleInputChange} />
              <CheckboxField label="Curas" name="curas" checked={formData.curas} onChange={handleInputChange} />
              <CheckboxField label="Suturas" name="suturas" checked={formData.suturas} onChange={handleInputChange} />
              <CheckboxField label="Retiro Puntos" name="retiro_puntos" checked={formData.retiro_puntos} onChange={handleInputChange} />
              <CheckboxField label="Sondas" name="sondas" checked={formData.sondas} onChange={handleInputChange} />
              <CheckboxField label="Lavado Ocular" name="lavado_ocular" checked={formData.lavado_ocular} onChange={handleInputChange} />
              <CheckboxField label="Lavado Nasal" name="lavado_nasal" checked={formData.lavado_nasal} onChange={handleInputChange} />
              <CheckboxField label="Lavado Oídos" name="lavado_oidos" checked={formData.lavado_oidos} onChange={handleInputChange} />
              <CheckboxField label="Electros" name="electros" checked={formData.electros} onChange={handleInputChange} />
              <CheckboxField label="Visitas Dom." name="visitas_domiciliares" checked={formData.visitas_domiciliares} onChange={handleInputChange} />
              <CheckboxField label="Jornadas Esp." name="jornadas_especiales" checked={formData.jornadas_especiales} onChange={handleInputChange} />
              <CheckboxField label="Entrega Ayudas" name="entregas_ayudas" checked={formData.entregas_ayudas} onChange={handleInputChange} />
              <CheckboxField label="💉 Vacunas Rut." name="vacunas_rutinas" checked={formData.vacunas_rutinas} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Referencias y Salida</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <CheckboxField label="Referido al HVSR" name="referredHvsr" checked={formData.referredHvsr} onChange={handleInputChange} />
                <CheckboxField label="Ref. Consulta Espec." name="referredSpecialist" checked={formData.referredSpecialist} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <CheckboxField label="Ref. Ambulancia" name="referencia_ambulancia" checked={formData.referencia_ambulancia} onChange={handleInputChange} />
                <CheckboxField label="Ref. Propios Medios" name="referencia_propios_medios" checked={formData.referencia_propios_medios} onChange={handleInputChange} />
              </div>
              <InputField label="Hora Salida" name="exitTime" type="time" value={formData.exitTime} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {editingPatient && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-3xl font-black text-sm hover:bg-slate-200 transition-all uppercase tracking-widest"
            >
              CANCELAR
            </button>
          )}
          <button
            type="submit"
            className="flex-[2] bg-blue-600 text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {editingPatient ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {editingPatient ? 'GUARDAR CAMBIOS' : 'REGISTRAR PACIENTE'}
          </button>
        </div>
      </form>
    </div>
  );
};
