import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Workflow, Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, Building2, AlertTriangle, KeyRound } from 'lucide-react';
import { signInUser, signUpUser, getSupabaseConfig, fetchProfilesFromSupabase, logAuditEvent } from '../lib/supabase';

interface LoginPageProps {
  onLoginSuccess: (user: { email: string; name: string; role: 'ADMIN' | 'SURGEON' | 'CLINICAL_STAFF' }) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const navigate = useNavigate();

  // Selected Login Role Tab: 'surgeon' or 'admin'
  const [roleTab, setRoleTab] = useState<'surgeon' | 'admin'>('surgeon');

  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const supabaseConfig = getSupabaseConfig();
  const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.key);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password;

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      // Fetch staff profiles from database
      const profiles = await fetchProfilesFromSupabase();
      const profile = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

      // Rule 1: Check if account exists
      if (!profile) {
        await logAuditEvent(cleanEmail, roleTab.toUpperCase(), 'FAILED_LOGIN', 'Email not in hospital directory', 'DENIED');
        setErrorMsg('Access denied. Your account is not authorized for ReconAI. Please contact your hospital administrator.');
        setLoading(false);
        return;
      }

      // Rule 2: Check active status
      if (profile.status === 'SUSPENDED' || profile.status === 'INACTIVE') {
        await logAuditEvent(cleanEmail, profile.role, 'BLOCKED_LOGIN', `Account status is ${profile.status}`, 'BLOCKED');
        setErrorMsg('Your account is currently inactive. Please contact the administrator.');
        setLoading(false);
        return;
      }

      // Rule 3: Check Role requirement for tab
      if (roleTab === 'admin' && profile.role !== 'ADMIN') {
        await logAuditEvent(cleanEmail, profile.role, 'UNAUTHORIZED_ADMIN_LOGIN', 'Surgeon attempted admin login tab', 'DENIED');
        setErrorMsg('Access denied. Administrator credentials required to access the Admin Portal.');
        setLoading(false);
        return;
      }

      // Rule 4: Verify Password (via Supabase Auth or database hash)
      let authSuccess = false;
      if (isSupabaseConfigured) {
        try {
          await signInUser(cleanEmail, cleanPass);
          authSuccess = true;
        } catch {
          if (profile.passwordHash?.toLowerCase() === cleanPass.toLowerCase()) {
            authSuccess = true;
            // Auto-sync account into Supabase Auth service (so user appears in Authentication -> Users tab)
            try {
              await signUpUser(cleanEmail, cleanPass);
            } catch (autoRegErr) {
              console.warn('Auto Supabase Auth registration notice:', autoRegErr);
            }
          }
        }
      } else {
        authSuccess = profile.passwordHash?.toLowerCase() === cleanPass.toLowerCase();
      }

      if (!authSuccess) {
        await logAuditEvent(cleanEmail, profile.role, 'FAILED_LOGIN', 'Incorrect password entered', 'FAILED');
        setErrorMsg('Invalid email or password.');
        setLoading(false);
        return;
      }

      // Log successful login security audit event
      await logAuditEvent(cleanEmail, profile.role, 'USER_LOGIN', `Successful login to ${roleTab === 'admin' ? 'Admin Portal' : 'Clinical Workspace'}`, 'SUCCESS');

      onLoginSuccess({
        email: profile.email,
        name: profile.fullName,
        role: profile.role
      });

      // Redirect based on role
      if (profile.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Left Side: Branding & Security Badge */}
        <div className="p-8 lg:p-10 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-2xl bg-white/15 backdrop-blur-md p-3 text-white border border-white/20">
                <Workflow size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-wider">RECONAI</h1>
                <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold">Hospital Clinical Portal</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
              AI-Powered Dental & Maxillofacial Reconstruction
            </h2>
            <p className="text-sm text-blue-100/90 leading-relaxed mb-6">
              Precision 3D volume analysis, automated defect classification, graft planning, and biomechanical simulation for head & neck surgical teams.
            </p>

            <div className="space-y-3.5 text-xs text-blue-100">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-emerald-300 shrink-0" />
                <span>Restricted Staff Authentication & Role Control</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-cyan-300 shrink-0" />
                <span>Encrypted Patient Data Access</span>
              </div>
              <div className="flex items-center gap-3">
                <KeyRound size={18} className="text-amber-300 shrink-0" />
                <span>Administrator Staff Provisioning Protocol</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/15 text-xs text-blue-200 flex justify-between">
            <span>Hospital Security Protocol</span>
            <span className="font-semibold text-white">RECONAI v1.0</span>
          </div>
        </div>

        {/* Right Side: Two-Role Login Form */}
        <div className="p-8 lg:p-10 flex flex-col justify-center bg-white">
          
          {/* Segmented Switch Tabs */}
          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => { setRoleTab('surgeon'); setErrorMsg(''); }}
              className={`flex-1 py-3 rounded-xl transition ${
                roleTab === 'surgeon'
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Surgeon / Clinician Login
            </button>

            <button
              onClick={() => { setRoleTab('admin'); setErrorMsg(''); }}
              className={`flex-1 py-3 rounded-xl transition ${
                roleTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-md font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin Login
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {roleTab === 'admin' ? 'ADMINISTRATOR EMAIL' : 'SURGEON / CLINICIAN EMAIL'}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder={roleTab === 'admin' ? 'Enter administrator email' : 'Enter hospital-approved email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 text-sm focus:border-blue-600 focus:outline-none text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {roleTab === 'admin' ? 'ADMIN PASSWORD' : 'PASSWORD'}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={roleTab === 'admin' ? 'Enter administrator password' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 pl-11 pr-11 py-3 text-sm focus:border-blue-600 focus:outline-none text-slate-900 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition"
                  title={showPassword ? 'Hide password' : 'View password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl text-white font-bold py-3.5 shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm mt-2 ${
                roleTab === 'admin'
                  ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
              }`}
            >
              {loading ? (
                'Authenticating Credentials…'
              ) : (
                <>
                  <span>
                    {roleTab === 'admin' ? 'Sign In to Admin Portal' : 'Sign In to Clinical Workspace'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
