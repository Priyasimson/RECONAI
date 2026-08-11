import { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertTriangle, CheckCircle2, Save } from 'lucide-react';

export function SecuritySettingsPage() {
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(60);
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(5);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white">
            <Lock size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Security & Authentication Policy</h1>
            <p className="text-xs text-slate-400">Configure password policies, session timeouts, and role permission matrices.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSecurity} className="space-y-6">
        {/* Password Policy Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound size={18} className="text-indigo-400" />
            <span>Password Policy Rules</span>
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Minimum Password Length (Characters)
              </label>
              <input
                type="number"
                min={8}
                max={32}
                value={minPasswordLength}
                onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Max Failed Login Attempts Lockout
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={maxFailedAttempts}
                onChange={(e) => setMaxFailedAttempts(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-3 text-xs text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={requireSpecialChar}
                onChange={(e) => setRequireSpecialChar(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-800"
              />
              <span>Require Uppercase, Lowercase, Number, and Special Character (!@#$)</span>
            </label>
          </div>
        </div>

        {/* Session Management Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-400" />
            <span>Session Control & Inactivity Expiry</span>
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Inactivity Session Timeout (Minutes)
            </label>
            <input
              type="number"
              min={15}
              max={480}
              value={sessionTimeoutMinutes}
              onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none font-bold"
            />
          </div>
        </div>

        {/* Role Permission Matrix Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-indigo-400" />
            <span>Role Permissions Matrix</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Permission / Resource</th>
                  <th className="px-4 py-3 text-indigo-400">ADMIN</th>
                  <th className="px-4 py-3 text-emerald-400">SURGEON</th>
                  <th className="px-4 py-3 text-amber-400">CLINICAL STAFF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { name: 'Access Clinical Workspace & Patients', admin: true, surgeon: true, staff: true },
                  { name: 'Upload DICOM / CT Imaging', admin: true, surgeon: true, staff: true },
                  { name: 'Run 3D AI Volumetric Defect Analysis', admin: true, surgeon: true, staff: false },
                  { name: 'Formulate Autogenous Graft Plans', admin: true, surgeon: true, staff: false },
                  { name: 'Design Biomechanical Fixation Hardware', admin: true, surgeon: true, staff: false },
                  { name: 'Provision / Suspend Doctor Accounts', admin: true, surgeon: false, staff: false },
                  { name: 'View Security Audit Logs', admin: true, surgeon: false, staff: false }
                ].map((row) => (
                  <tr key={row.name}>
                    <td className="px-4 py-3 font-semibold text-slate-200">{row.name}</td>
                    <td className="px-4 py-3 font-bold text-indigo-400">{row.admin ? '✓ Granted' : '—'}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{row.surgeon ? '✓ Granted' : '—'}</td>
                    <td className="px-4 py-3 font-bold text-amber-400">{row.staff ? '✓ Granted' : '— Denied'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {savedMsg && (
          <div className="rounded-2xl bg-emerald-950 text-emerald-300 border border-emerald-800 p-4 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>Security policy updated successfully.</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          <Save size={18} />
          <span>Save Security Policy Settings</span>
        </button>
      </form>
    </div>
  );
}
