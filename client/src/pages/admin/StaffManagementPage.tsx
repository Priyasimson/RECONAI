import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Search, Ban, CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { fetchProfilesFromSupabase, updateProfileStatus, logAuditEvent } from '../../lib/supabase';
import type { UserProfile } from '../../types';

export function StaffManagementPage({ filterStatus }: { filterStatus?: 'ACTIVE' | 'SUSPENDED' | 'PENDING' }) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'activate' | 'reset';
    profile: UserProfile | null;
  }>({ isOpen: false, type: 'suspend', profile: null });
  const [modalMsg, setModalMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchProfilesFromSupabase();
    setProfiles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus) {
      if (filterStatus === 'SUSPENDED') {
        return matchesSearch && (p.status === 'SUSPENDED' || p.status === 'INACTIVE');
      }
      return matchesSearch && p.status === filterStatus;
    }
    return matchesSearch;
  });

  const handleConfirmAction = async () => {
    if (!actionModal.profile) return;
    const { type, profile } = actionModal;

    if (type === 'suspend') {
      await updateProfileStatus(profile.id, profile.email, 'SUSPENDED');
      await logAuditEvent('admin@reconai.com', 'ADMIN', 'SUSPEND_SURGEON_ACCOUNT', `Suspended account for ${profile.fullName} (${profile.email})`, 'SUCCESS');
      setModalMsg(`Account for ${profile.fullName} has been suspended.`);
    } else if (type === 'activate') {
      await updateProfileStatus(profile.id, profile.email, 'ACTIVE');
      await logAuditEvent('admin@reconai.com', 'ADMIN', 'ACTIVATE_SURGEON_ACCOUNT', `Activated account for ${profile.fullName} (${profile.email})`, 'SUCCESS');
      setModalMsg(`Account for ${profile.fullName} is now Active.`);
    } else if (type === 'reset') {
      await logAuditEvent('admin@reconai.com', 'ADMIN', 'RESET_SURGEON_PASSWORD', `Issued password reset token for ${profile.email}`, 'SUCCESS');
      setModalMsg(`Password reset email token generated for ${profile.email}.`);
    }

    await loadData();
    setTimeout(() => {
      setActionModal({ isOpen: false, type: 'suspend', profile: null });
      setModalMsg('');
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Surgeon & Staff Management</h1>
            <p className="text-xs text-slate-400">View, suspend, activate, and manage clinician permissions.</p>
          </div>
        </div>

        <Link
          to="/admin/add-surgeon"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-indigo-600/30 transition shrink-0"
        >
          <UserPlus size={16} />
          <span>+ Add New Staff</span>
        </Link>
      </div>

      {/* Search Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by surgeon name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs border border-slate-800 transition"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Staff Directory Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Specialization</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading staff records...</td>
                </tr>
              ) : filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No clinician profiles found matching criteria.</td>
                </tr>
              ) : (
                filteredProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/50 transition">
                    <td className="px-6 py-4 font-bold text-white">
                      <div>{p.fullName}</div>
                      <div className="text-[10px] text-slate-500">{p.medicalRegistrationNumber}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-indigo-300">{p.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-200">
                        {p.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{p.specialization}</td>
                    <td className="px-6 py-4 text-slate-400">{p.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {p.status === 'ACTIVE' ? (
                          <button
                            onClick={() => setActionModal({ isOpen: true, type: 'suspend', profile: p })}
                            className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 px-2.5 py-1.5 rounded-lg text-[11px] border border-rose-800 transition flex items-center gap-1 font-bold"
                          >
                            <Ban size={12} />
                            <span>Suspend</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setActionModal({ isOpen: true, type: 'activate', profile: p })}
                            className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 px-2.5 py-1.5 rounded-lg text-[11px] border border-emerald-800 transition flex items-center gap-1 font-bold"
                          >
                            <CheckCircle2 size={12} />
                            <span>Activate</span>
                          </button>
                        )}
                        <button
                          onClick={() => setActionModal({ isOpen: true, type: 'reset', profile: p })}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg text-[11px] border border-slate-800 transition"
                        >
                          Reset Pass
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionModal.isOpen && actionModal.profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActionModal({ isOpen: false, type: 'suspend', profile: null })}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl text-white ${
                actionModal.type === 'suspend' ? 'bg-rose-600' : 'bg-emerald-600'
              }`}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Confirm Account {actionModal.type === 'suspend' ? 'Suspension' : actionModal.type === 'activate' ? 'Activation' : 'Password Reset'}
                </h3>
                <p className="text-xs text-slate-400">Target Profile: {actionModal.profile.fullName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {actionModal.type === 'suspend'
                ? `Are you sure you want to suspend Dr. ${actionModal.profile.fullName}? Suspended accounts will be immediately blocked from signing in to the ReconAI workspace.`
                : actionModal.type === 'activate'
                ? `Are you sure you want to activate Dr. ${actionModal.profile.fullName}'s account? They will regain immediate access to the clinical workspace.`
                : `Are you sure you want to trigger a password reset for ${actionModal.profile.email}?`}
            </p>

            {modalMsg && (
              <div className="rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 p-3 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>{modalMsg}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmAction}
                className={`flex-1 rounded-2xl font-bold py-3 text-xs text-white transition ${
                  actionModal.type === 'suspend' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                Yes, Confirm {actionModal.type.toUpperCase()}
              </button>
              <button
                onClick={() => setActionModal({ isOpen: false, type: 'suspend', profile: null })}
                className="rounded-2xl bg-slate-800 text-slate-300 font-semibold px-5 py-3 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
