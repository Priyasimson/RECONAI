import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckCircle2, Clock, Ban, UserPlus, ShieldCheck, FileCheck2, ArrowUpRight } from 'lucide-react';
import { fetchProfilesFromSupabase, fetchAuditLogs } from '../../lib/supabase';
import type { UserProfile, AuditLog } from '../../types';

export function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      const [profs, logs] = await Promise.all([
        fetchProfilesFromSupabase(),
        fetchAuditLogs()
      ]);
      setProfiles(profs);
      setAuditLogs(logs);
      setLoading(false);
    }
    loadAdminData();
  }, []);

  const totalSurgeons = profiles.filter((p) => p.role === 'SURGEON').length;
  const activeAccounts = profiles.filter((p) => p.status === 'ACTIVE').length;
  const pendingAccounts = profiles.filter((p) => p.status === 'PENDING').length;
  const suspendedAccounts = profiles.filter((p) => p.status === 'SUSPENDED' || p.status === 'INACTIVE').length;
  const totalStaff = profiles.length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 mb-2">
            <ShieldCheck size={14} />
            <span>ReconAI Administration Control Center</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Administrative Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Manage clinician profiles, security RBAC policies, and hospital audit logs.</p>
        </div>

        <Link
          to="/admin/add-surgeon"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-lg shadow-indigo-600/30 transition shrink-0"
        >
          <UserPlus size={16} />
          <span>+ Add New Surgeon</span>
        </Link>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Surgeons</span>
            <Users size={18} className="text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{loading ? '…' : totalSurgeons}</div>
          <div className="text-[11px] text-slate-400">Registered Surgical Specialists</div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Accounts</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{loading ? '…' : activeAccounts}</div>
          <div className="text-[11px] text-slate-400">Authenticated Active Clinicians</div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Approval</span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{loading ? '…' : pendingAccounts}</div>
          <div className="text-[11px] text-slate-400">Awaiting Admin Verification</div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Suspended Accounts</span>
            <Ban size={18} className="text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{loading ? '…' : suspendedAccounts}</div>
          <div className="text-[11px] text-slate-400">Blocked / Inactive Profiles</div>
        </div>
      </div>

      {/* Main Grid: Registered Staff & Audit Stream */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Clinician Staff List Preview */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-indigo-400" />
              <span>Surgeon & Staff Directory ({totalStaff})</span>
            </h3>
            <Link to="/admin/staff" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {profiles.slice(0, 5).map((profile) => (
              <div key={profile.id} className="flex items-center justify-between rounded-2xl bg-slate-900 border border-slate-800 p-3 text-xs">
                <div>
                  <div className="font-bold text-white text-sm">{profile.fullName}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{profile.email}</div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    profile.status === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {profile.status}
                  </span>
                  <div className="text-slate-500 text-[10px] mt-1">{profile.department}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Activity Stream */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 size={18} className="text-indigo-400" />
              <span>Recent Security Audit Stream</span>
            </h3>
            <Link to="/admin/audit-logs" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <span>Logs</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-3 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-mono text-indigo-400 font-bold">{log.userEmail}</span>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="font-bold text-slate-200">{log.action}</div>
                <div className="text-slate-400 text-[11px]">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
