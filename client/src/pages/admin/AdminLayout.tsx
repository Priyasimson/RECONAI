import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  Ban,
  ShieldCheck,
  Building2,
  FileCheck2,
  Lock,
  Activity,
  HeartPulse,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  Workflow,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  currentUser: { email: string; name: string; role: string } | null;
  onLogout: () => void;
}

export function AdminLayout({ currentUser, onLogout }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminNavItems = [
    { to: '/admin/dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { to: '/admin/staff', label: '2. Surgeon / Staff Management', icon: Users },
    { to: '/admin/add-surgeon', label: '3. Add Surgeon', icon: UserPlus },
    { to: '/admin/pending', label: '4. Pending Accounts', icon: Clock },
    { to: '/admin/active-staff', label: '5. Active Accounts', icon: CheckCircle2 },
    { to: '/admin/suspended-staff', label: '6. Suspended Accounts', icon: Ban },
    { to: '/admin/patient-access', label: '7. Patient Access Management', icon: ShieldCheck },
    { to: '/admin/departments', label: '8. Hospital / Department', icon: Building2 },
    { to: '/admin/audit-logs', label: '9. Audit Logs', icon: FileCheck2 },
    { to: '/admin/security', label: '10. Security & Authentication', icon: Lock },
    { to: '/admin/activity', label: '11. System Activity', icon: Activity },
    { to: '/admin/health', label: '12. Database / System Health', icon: HeartPulse },
    { to: '/admin/notifications', label: '13. Notifications', icon: Bell },
    { to: '/admin/profile', label: '14. Admin Profile', icon: UserCircle },
    { to: '/admin/settings', label: '15. Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col lg:flex-row">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden w-72 bg-slate-950 border-r border-slate-800 p-5 lg:flex lg:flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="mb-6 flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 p-2.5 text-white shadow-lg shadow-indigo-500/20">
              <Workflow size={22} />
            </div>
            <div>
              <div className="text-lg font-black tracking-wider text-white">RECONAI</div>
              <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Admin Portal</div>
            </div>
          </div>

          {/* Admin User Info Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 mb-3 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authenticated Admin</div>
            <div className="font-bold text-white mt-0.5 truncate">{currentUser?.name || 'Administrator'}</div>
            <div className="text-indigo-400 font-mono text-[11px] truncate">{currentUser?.email}</div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-semibold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 hover:border-rose-700/50 p-2.5 text-xs font-bold text-rose-400 border border-slate-800 transition"
          >
            <LogOut size={16} />
            <span>16. Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <header className="flex items-center justify-between bg-slate-950 border-b border-slate-800 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-indigo-600 p-1.5 text-white">
            <Workflow size={18} />
          </div>
          <span className="text-sm font-black tracking-wider text-white">RECONAI ADMIN</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="bg-slate-950 border-b border-slate-800 p-4 lg:hidden space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <button
            onClick={() => { setMobileMenuOpen(false); onLogout(); }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-950/60 text-rose-400 p-2.5 text-xs font-bold mt-2"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Main Admin Workspace Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
