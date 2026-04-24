import React, { useState, useEffect } from 'react';
import { UserRole, AuthContext, PersonalCentro } from '../types';
import { db } from '../db';
import { supabase, sincronizarPersonal } from '../services/syncService';
import { Stethoscope, User, ChevronRight, Activity, Lock, Phone, Mail, Building, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onLogin: (auth: AuthContext) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [step, setStep] = useState<'cedula' | 'pin' | 'registro'>('cedula');
  const [cedula, setCedula] = useState(localStorage.getItem('last_cedula') || '');
  const [pin, setPin] = useState('');
  const [personal, setPersonal] = useState<PersonalCentro | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [intentos, setIntentos] = useState(0);

  // Registration form
  const [formData, setFormData] = useState<Partial<PersonalCentro>>({
    cedula: '',
    nombres: '',
    apellidos: '',
    cargo: 'Médico/a',
    rol: 'medico',
    telefono: '',
    correo: '',
    id_centro: '',
    nombre_centro: '',
    asic: '',
    pin: '1234',
    activo: true
  });

  const [centros, setCentros] = useState<any[]>([]);

  useEffect(() => {
    db.configuracion.get(1).then(conf => {
      if (conf?.centros_disponibles) setCentros(conf.centros_disponibles);
    });

    if (navigator.onLine) {
      sincronizarPersonal().catch(console.error);
    }
  }, []);

  const handleCedulaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula) return;
    setLoading(true);
    setError('');

    try {
      // 1. Buscar local
      let p = await db.personal_centro.where('cedula').equals(cedula).first();

      // 2. Buscar remoto si no hay local o para refrescar
      if (!p && navigator.onLine && supabase) {
        const { data } = await supabase.from('personal_centro').select('*').eq('cedula', cedula).single();
        if (data) {
          p = data;
          await db.personal_centro.put(p as PersonalCentro);
        }
      }

      if (p) {
        setPersonal(p);
        setStep('pin');
        localStorage.setItem('last_cedula', cedula);
      } else {
        setFormData({ ...formData, cedula });
        setStep('registro');
      }
    } catch (err) {
      console.error(err);
      setError('Error al verificar cédula');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (personal && pin === personal.pin) {
      onLogin({
        role: personal.rol,
        userName: `${personal.nombres} ${personal.apellidos}`.toUpperCase(),
        cedula: personal.cedula,
        centro: personal.nombre_centro,
        personalId: personal.id
      });
    } else {
      setIntentos(prev => prev + 1);
      setError(`PIN incorrecto. Intentos: ${intentos + 1}/3`);
      if (intentos >= 2) {
        setError('Superado límite de intentos. Contacte a soporte.');
      }
    }
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedCentro = centros.find(c => c.id === formData.id_centro);
      const newPersonal = {
        ...formData,
        nombre_centro: selectedCentro?.nombre || '',
        asic: selectedCentro?.asic || '',
        id: undefined
      } as PersonalCentro;

      // Guardar local
      const id = await db.personal_centro.add(newPersonal);
      const saved = await db.personal_centro.get(id);

      // Intentar subir a Supabase
      if (navigator.onLine && supabase) {
        await supabase.from('personal_centro').upsert({ ...newPersonal, cedula: formData.cedula }, { onConflict: 'cedula' });
      }

      if (saved) {
        onLogin({
          role: saved.rol,
          userName: `${saved.nombres} ${saved.apellidos}`.toUpperCase(),
          cedula: saved.cedula,
          centro: saved.nombre_centro,
          personalId: saved.id
        });
      }
    } catch (err) {
      console.error(err);
      setError('Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-300 border border-slate-100 overflow-hidden"
      >
        <div className="bg-blue-600 p-12 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-32 h-32 rotate-12" />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-xl border border-white/30 shadow-2xl"
          >
            <Stethoscope className="w-14 h-14" />
          </motion.div>
          <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Morbilidad CPT</h2>
          <p className="text-blue-100 font-bold uppercase text-[11px] tracking-[0.3em] mt-4 opacity-80">Empadronamiento del Personal</p>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {step === 'cedula' && (
              <motion.form key="cedula" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleCedulaSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Ingresa tu Cédula</label>
                  <div className="relative">
                    <input
                      type="text" required value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="V-00000000"
                      className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-3xl text-slate-700 placeholder:text-slate-200 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                    />
                    <User className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-200" />
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-8 rounded-[2rem] font-black text-2xl shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-tight">
                  {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <>Continuar <ChevronRight /></>}
                </button>
              </motion.form>
            )}

            {step === 'pin' && personal && (
              <motion.form key="pin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handlePinSubmit} className="space-y-8">
                <div className="text-center">
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Bienvenido/a</p>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                    {personal.nombres} {personal.apellidos}
                  </h3>
                  <span className="inline-block mt-2 px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {personal.cargo}
                  </span>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Ingresa tu PIN</label>
                  <div className="relative">
                    <input
                      type="password" maxLength={4} required value={pin} onChange={(e) => setPin(e.target.value)} placeholder="****"
                      className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-5xl text-center tracking-[1em] text-blue-600 placeholder:text-slate-200 focus:border-blue-500 focus:bg-white outline-none transition-all"
                    />
                    <Lock className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-200" />
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
                <div className="flex gap-4">
                   <button type="button" onClick={() => setStep('cedula')} className="flex-1 bg-slate-100 text-slate-400 py-6 rounded-[2rem] font-black uppercase text-xs">Cédula</button>
                   <button type="submit" disabled={intentos >= 3} className="flex-[2] bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-blue-100 active:scale-95 transition-all">Acceder</button>
                </div>
              </motion.form>
            )}

            {step === 'registro' && (
              <motion.form key="registro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleRegistroSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-center">
                  <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <p className="text-blue-900 font-black uppercase text-xs tracking-tight">No estás registrado</p>
                  <p className="text-[10px] font-bold text-blue-700/60 uppercase">Completa tu empadronamiento</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputBase label="Nombres" value={formData.nombres} onChange={v => setFormData({...formData, nombres: v.toUpperCase()})} placeholder="Juan" icon={User} />
                  <InputBase label="Apellidos" value={formData.apellidos} onChange={v => setFormData({...formData, apellidos: v.toUpperCase()})} placeholder="Perez" icon={User} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputBase label="Teléfono" value={formData.telefono} onChange={v => setFormData({...formData, telefono: v})} placeholder="0412..." icon={Phone} />
                  <InputBase label="Correo" value={formData.correo} onChange={v => setFormData({...formData, correo: v})} placeholder="mail@pro.com" icon={Mail} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Cargo</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Enfermero/a', 'Médico/a', 'Ambos'].map(c => (
                      <button 
                        key={c} type="button" 
                        onClick={() => setFormData({...formData, cargo: c as any, rol: c.includes('Médico') || c === 'Ambos' ? 'medico' : 'enfermeria'})}
                        className={`p-3 rounded-2xl border-2 text-[9px] font-black uppercase transition-all ${formData.cargo === c ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Centro de Salud (Opcional)</label>
                  <select 
                    value={formData.id_centro} onChange={e => setFormData({...formData, id_centro: e.target.value})}
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold text-xs uppercase outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccione Centro...</option>
                    {centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <InputBase label="PIN Acceso (4 Dígitos)" value={formData.pin} onChange={v => setFormData({...formData, pin: v})} placeholder="1234" icon={Lock} maxLength={4} />

                <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-6 rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : <>Finalizar Registro <ShieldCheck /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const InputBase = ({ label, value, onChange, placeholder, icon: Icon, maxLength }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">{label}</label>
    <div className="relative">
      <input
        type="text" required value={value || ''} maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-sm text-slate-700 outline-none focus:border-blue-500 transition-all"
      />
      <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200" />
    </div>
  </div>
);
