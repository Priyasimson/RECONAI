import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { saveProfileToSupabase, logAuditEvent, fetchProfilesFromSupabase } from '../../lib/supabase';

export function AddSurgeonPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [medicalRegistrationNumber, setMedicalRegistrationNumber] = useState('');
  const [specialization, setSpecialization] = useState('Maxillofacial Surgery');
  const [hospital, setHospital] = useState('St. Jude Surgical Medical Center');
  const [department, setDepartment] = useState('Oral & Maxillofacial');
  const [role, setRole] = useState<'SURGEON' | 'CLINICAL_STAFF'>('SURGEON');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ACTIVE');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName || !email || !temporaryPassword) {
      setErrorMsg('Please fill in all required fields (Full Name, Professional Email, Password).');
      return;
    }

    if (temporaryPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify the temporary password.');
      return;
    }

    if (temporaryPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const existingProfiles = await fetchProfilesFromSupabase();
      if (existingProfiles.some((p) => p.email.toLowerCase() === cleanEmail)) {
        setErrorMsg(`An account with email [${cleanEmail}] already exists in the hospital directory.`);
        setLoading(false);
        return;
      }

      const newProfile = {
        id: `p-${Date.now()}`,
        fullName: fullName.trim(),
        email: cleanEmail,
        passwordHash: temporaryPassword,
        role,
        specialization,
        hospital,
        department,
        medicalRegistrationNumber: medicalRegistrationNumber.trim() || `MED-REG-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: phone.trim() || '+1 555-0000',
        status,
        createdBy: 'admin@reconai.com',
        createdAt: new Date().toISOString()
      };

      await saveProfileToSupabase(newProfile);
      await logAuditEvent('admin@reconai.com', 'ADMIN', 'CREATE_SURGEON_ACCOUNT', `Provisioned surgeon account for ${fullName} (${cleanEmail})`, 'SUCCESS');

      setSuccessMsg(`Surgeon account created successfully. Account for ${fullName} is now ${status}.`);

      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setMedicalRegistrationNumber('');
      setTemporaryPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create surgeon account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Add New Surgeon / Clinical Staff</h1>
            <p className="text-xs text-slate-400">Provision authorized clinician credentials for ReconAI workspace access.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Johnathan Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Professional Email *
            </label>
            <input
              type="email"
              required
              placeholder="dr.smith@hospital.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+1 555-0192"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Medical Registration Number
            </label>
            <input
              type="text"
              placeholder="MED-REG-9941"
              value={medicalRegistrationNumber}
              onChange={(e) => setMedicalRegistrationNumber(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Specialization
            </label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="Maxillofacial Surgery">Maxillofacial Surgery</option>
              <option value="Oral & Craniofacial">Oral & Craniofacial</option>
              <option value="Head & Neck Oncology">Head & Neck Oncology</option>
              <option value="Plastic & Reconstructive">Plastic & Reconstructive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Hospital
            </label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Role Dropdown *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="SURGEON">Surgeon</option>
              <option value="CLINICAL_STAFF">Clinical Staff</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Temporary Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 pl-4 pr-11 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Confirm Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Account Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none font-bold"
            >
              <option value="ACTIVE" className="text-emerald-400">Active</option>
              <option value="INACTIVE" className="text-amber-400">Inactive</option>
              <option value="SUSPENDED" className="text-rose-400">Suspended</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-2xl bg-rose-950/80 border border-rose-800 p-4 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-2xl bg-emerald-950/80 border border-emerald-800 p-4 text-xs text-emerald-300 flex items-center gap-2 font-semibold">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck size={18} />
            <span>Create Surgeon Account</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/staff')}
            className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-6 py-3.5 text-xs sm:text-sm transition border border-slate-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
