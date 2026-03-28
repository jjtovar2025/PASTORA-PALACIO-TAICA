import React, { useState } from 'react';
import { HealthReport } from '../types';
import { processReport } from '../lib/gemini';
import { saveReport } from '../lib/supabase';
import { Loader2, Send, ClipboardPaste, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

interface ReportFormProps {
  onSuccess: (report: HealthReport) => void;
  phoneNumbers: string[];
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSuccess, phoneNumbers }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [lastReport, setLastReport] = useState<HealthReport | null>(null);
  const [showWhatsAppOptions, setShowWhatsAppOptions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      // 1. Process with Gemini
      const report = await processReport(text);
      
      // 2. Save to Supabase
      try {
        await saveReport(report);
      } catch (err: any) {
        console.error('Supabase error:', err);
        setStatus({ type: 'error', message: `AVISO: No se pudo guardar en Supabase: ${err.message}. El proceso continuará para WhatsApp.` });
      }

      // 3. Send to Apps Script (Google Sheets)
      const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
      if (appsScriptUrl) {
        try {
          await fetch(appsScriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Apps Script requires no-cors for simple POST
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
          });
        } catch (err) {
          console.error('Error sending to Apps Script:', err);
        }
      }

      // 4. Prepare for WhatsApp
      setLastReport(report);
      setShowWhatsAppOptions(true);
      setText('');
      onSuccess(report);
    } catch (err: any) {
      console.error('Error general:', err);
      setStatus({ type: 'error', message: `Error crítico: ${err.message || 'Error desconocido'}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardPaste className="text-blue-600 w-5 h-5" />
        <h2 className="text-lg font-bold text-gray-800">Nuevo Reporte de WhatsApp</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pegue aquí el texto del reporte de WhatsApp..."
          className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono text-sm"
          disabled={loading}
        />
        
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Procesando con IA...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Procesar Reporte
            </>
          )}
        </button>
      </form>

      {status && (
        <div className={`mt-4 p-4 rounded-xl flex flex-col gap-3 ${
          status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          <div className="flex items-center gap-3">
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{status.message}</span>
          </div>

          {status.type === 'success' && showWhatsAppOptions && lastReport && (
            <div className="mt-2 pt-4 border-t border-green-200">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-green-800">Enviar reporte a:</p>
              <div className="flex flex-wrap gap-2">
                {phoneNumbers.map((phone, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const encodedText = encodeURIComponent(lastReport.whatsapp_summary);
                      const cleanPhone = phone.replace(/\D/g, '');
                      window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
                    }}
                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-xl font-bold text-[10px] hover:bg-green-700 transition-all shadow-sm"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {phone}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const encodedText = encodeURIComponent(lastReport.whatsapp_summary);
                    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
                  }}
                  className="flex items-center gap-2 bg-slate-600 text-white px-3 py-2 rounded-xl font-bold text-[10px] hover:bg-slate-700 transition-all shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  OTRO
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
