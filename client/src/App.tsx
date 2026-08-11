import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Activity, Brain, ClipboardList, FileImage, FileText, Menu, Microscope, Package, ScanLine, Settings2, UserPlus, Workflow, UserCircle2, X, LogOut, Home, ShieldAlert } from 'lucide-react';
import type { Patient } from './types';
import { DashboardPage } from './pages/DashboardPage';
import { PatientRegistrationPage } from './pages/PatientRegistrationPage';
import { ImagingUploadPage } from './pages/ImagingUploadPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ClassificationPage } from './pages/ClassificationPage';
import { GraftPlanningPage } from './pages/GraftPlanningPage';
import { FixationPage } from './pages/FixationPage';
import { SimulationPage } from './pages/SimulationPage';
import { ReportsPage } from './pages/ReportsPage';
import { OutcomePage } from './pages/OutcomePage';
import { RecordsPage } from './pages/RecordsPage';
import { LoginPage } from './pages/LoginPage';
import { fetchPatientsFromSupabase, signOutUser } from './lib/supabase';

// Admin Portal Components
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AddSurgeonPage } from './pages/admin/AddSurgeonPage';
import { StaffManagementPage } from './pages/admin/StaffManagementPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SecuritySettingsPage } from './pages/admin/SecuritySettingsPage';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Activity },
  { to: '/patients/new', label: 'New Patient', icon: UserPlus },
  { to: '/patients/records', label: 'Patient Records', icon: ClipboardList },
  { to: '/imaging', label: 'Upload Imaging', icon: FileImage },
  { to: '/analysis', label: 'AI Analysis', icon: Brain },
  { to: '/classification', label: 'Classification', icon: ScanLine },
  { to: '/graft', label: 'Graft Planning', icon: Package },
  { to: '/fixation', label: 'Fixation', icon: Settings2 },
  { to: '/simulation', label: 'Simulation', icon: Workflow },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/outcomes', label: 'Outcome', icon: Microscope }
];

const mobileBottomNav = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/patients/new', label: 'New Case', icon: UserPlus },
  { to: '/imaging', label: 'Imaging', icon: FileImage },
  { to: '/analysis', label: 'AI Result', icon: Brain },
  { to: '/patients/records', label: 'Records', icon: ClipboardList }
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Always start on Login Page first upon opening / running the app
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; role: 'ADMIN' | 'SURGEON' | 'CLINICAL_STAFF' } | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const activePatient = useMemo(
    () => patients.find((patient) => patient.id === activePatientId) || null,
    [patients, activePatientId]
  );

  const refreshPatients = async () => {
    const supabaseData = await fetchPatientsFromSupabase();
    if (supabaseData && supabaseData.length > 0) {
      setPatients(supabaseData);
      if (!activePatientId && supabaseData[0]) {
        setActivePatientId(supabaseData[0].id);
      }
      return;
    }

    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      setPatients(data);
      if (!activePatientId && data[0]) {
        setActivePatientId(data[0].id);
      } else if (activePatientId) {
        const current = data.find((entry: Patient) => entry.id === activePatientId);
        if (!current && data[0]) setActivePatientId(data[0].id);
      }
    } catch (e) {
      console.warn('Backend fetch fallback:', e);
    }
  };

  useEffect(() => {
    refreshPatients().finally(() => setLoading(false));
    console.log('🟢 [Supabase Cloud Database] Connected successfully! Project: https://ymqjarbchaxfiiepozec.supabase.co');
  }, []);

  const handleLoginSuccess = (user: { email: string; name: string; role: 'ADMIN' | 'SURGEON' | 'CLINICAL_STAFF' }) => {
    setCurrentUser(user);
    localStorage.setItem('RECONAI_USER_SESSION', JSON.stringify(user));
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('RECONAI_USER_SESSION');
    await signOutUser();
    navigate('/login', { replace: true });
  };

  const createPatient = async (payload: Partial<Patient>) => {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const patient = await response.json();
    setPatients((current) => [patient, ...current]);
    setActivePatientId(patient.id);
    navigate('/imaging');
    return patient;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-300">Initializing RECONAI Surgical Workspace…</p>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated Route Protection: Redirect any unauthenticated user to /login
  if (!currentUser && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // Render Login Page when at /login
  if (location.pathname === '/login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Admin Portal Routes Protection (Role Check: ADMIN only)
  if (location.pathname.startsWith('/admin')) {
    if (currentUser?.role !== 'ADMIN') {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-bold">Unauthorized Access</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access to the ReconAI Administration Portal is restricted to Hospital Administrators only. Your account role ({currentUser?.role || 'SURGEON'}) does not have permission.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold py-3 text-xs text-white transition shadow-lg shadow-blue-500/25"
            >
              Return to Clinical Workspace
            </button>
          </div>
        </div>
      );
    }

    return (
      <Routes>
        <Route element={<AdminLayout currentUser={currentUser} onLogout={handleLogout} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/staff" element={<StaffManagementPage />} />
          <Route path="/admin/add-surgeon" element={<AddSurgeonPage />} />
          <Route path="/admin/pending" element={<StaffManagementPage filterStatus="PENDING" />} />
          <Route path="/admin/active-staff" element={<StaffManagementPage filterStatus="ACTIVE" />} />
          <Route path="/admin/suspended-staff" element={<StaffManagementPage filterStatus="SUSPENDED" />} />
          <Route path="/admin/patient-access" element={<StaffManagementPage />} />
          <Route path="/admin/departments" element={<AdminDashboardPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/security" element={<SecuritySettingsPage />} />
          <Route path="/admin/activity" element={<AuditLogsPage />} />
          <Route path="/admin/health" element={<AdminDashboardPage />} />
          <Route path="/admin/notifications" element={<AdminDashboardPage />} />
          <Route path="/admin/profile" element={<SecuritySettingsPage />} />
          <Route path="/admin/settings" element={<SecuritySettingsPage />} />
          <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    );
  }

  // 3. Surgeon / Clinical Staff Workspace Layout
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 lg:pb-0">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 border-r border-slate-200 bg-white p-5 lg:flex lg:flex-col justify-between shrink-0">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 text-white shadow-md shadow-blue-500/20">
                  <Workflow size={22} />
                </div>
                <div>
                  <div className="text-lg font-black tracking-wider text-slate-900">RECONAI</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Surgical Workspace</div>
                </div>
              </div>
            </div>

            {/* Active Case Widget */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Case</div>
              <div className="mt-1 font-bold text-slate-800 truncate">{activePatient?.name || 'No patient selected'}</div>
              <div className="text-xs font-semibold text-blue-600">{activePatient?.caseId || 'Select a patient'}</div>
            </div>

            {/* Supabase Connected Status Badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-semibold mb-4 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase Connected</span>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Footer User Info */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <UserCircle2 size={18} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700 truncate">{currentUser?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden={!menuOpen} style={{ display: menuOpen ? 'block' : 'none' }}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white p-5 shadow-2xl transition-transform duration-300 flex flex-col justify-between">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-600 p-2.5 text-white">
                    <Workflow size={20} />
                  </div>
                  <div>
                    <div className="font-black text-slate-900">RECONAI</div>
                    <div className="text-[10px] text-slate-500">Mobile Surgical Hub</div>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="rounded-full p-2 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                          isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`
                      }
                    >
                      <Icon size={18} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 text-rose-600 font-semibold py-2 text-xs"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Mobile Header Bar */}
          <header className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
            <button onClick={() => setMenuOpen(true)} className="rounded-xl p-2 hover:bg-slate-100">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-blue-600 p-1.5 text-white">
                <Workflow size={16} />
              </div>
              <span className="text-sm font-black tracking-wider text-slate-900">RECONAI</span>
            </div>
            <div className="w-8" />
          </header>

          <Routes>
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  patient={activePatient}
                />
              }
            />
            <Route path="/patients/new" element={<PatientRegistrationPage onCreate={createPatient} />} />
            <Route path="/patients/records" element={<RecordsPage patients={patients} />} />
            <Route path="/imaging" element={<ImagingUploadPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/analysis" element={<AnalysisPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/classification" element={<ClassificationPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/graft" element={<GraftPlanningPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/fixation" element={<FixationPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/simulation" element={<SimulationPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/reports" element={<ReportsPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/outcomes" element={<OutcomePage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Touch Bottom Navigation Bar (Visible only on mobile screens) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-lg px-2 py-2 lg:hidden shadow-lg">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-bold transition ${
                  isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
