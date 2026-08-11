import { useState } from 'react';
import { Database, Key, Link2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, getSupabaseClient } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export function SupabaseConfigModal({ isOpen, onClose, onConfigSaved }: SupabaseConfigModalProps) {
  const current = getSupabaseConfig();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.key);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setStatusMsg({ type: 'info', text: 'Testing database connection…' });

    saveSupabaseConfig(url, key);
    const client = getSupabaseClient();

    if (!client) {
      setStatusMsg({ type: 'error', text: 'Invalid URL or Key format. Please check your credentials.' });
      setTesting(false);
      return;
    }

    try {
      const { error } = await client.from('patients').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        if (error.message.includes('relation "public.patients" does not exist')) {
          setStatusMsg({
            type: 'success',
            text: 'Connected to Cloud Database! Remember to initialize tables.'
          });
        } else {
          setStatusMsg({ type: 'error', text: `Database Error: ${error.message}` });
        }
      } else {
        setStatusMsg({ type: 'success', text: 'Successfully connected to Cloud Database!' });
      }
      onConfigSaved();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Connection failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    saveSupabaseConfig('', '');
    setUrl('');
    setKey('');
    setStatusMsg({ type: 'info', text: 'Cleared credentials. App will use Local Server mode.' });
    onConfigSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white">
            <Database size={22} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Cloud Database Settings</h2>
            <p className="text-xs text-slate-500">Sync patient cases and AI results directly to cloud server</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Project Endpoint URL
            </label>
            <div className="relative">
              <Link2 size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="https://your-project.cloud.db"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Anon / Publishable API Key
            </label>
            <div className="relative">
              <Key size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {statusMsg && (
            <div
              className={`rounded-2xl p-3.5 text-xs flex items-start gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={testing}
              className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 font-semibold text-white py-3 text-sm transition shadow-md disabled:opacity-50"
            >
              {testing ? 'Testing…' : 'Save & Connect'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-3 text-sm transition"
            >
              Disconnect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
