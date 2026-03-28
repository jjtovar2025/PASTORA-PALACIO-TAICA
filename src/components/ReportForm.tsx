import React, { useState } from 'react';
import { HealthReport } from '../types';
import { processReport } from '../lib/gemini';
import { saveReport } from '../lib/supabase';
import { Loader2, Send, ClipboardPaste, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReportFormProps {
  onSuccess: (report: HealthReport) => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSuccess }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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
      } catch (err) {
        console.warn('Supabase not configured or error saving:', err);
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

      setStatus({ type: 'success', message: 'Reporte procesado y guardado correctamente.' });
      setText('');
      onSuccess(report);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Error al procesar el reporte. Verifique el formato.' });
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
        <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
          status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}
    </div>
  );
};
