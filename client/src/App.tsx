import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import {
  Activity,
  Brain,
  ClipboardList,
  FileImage,
  FileText,
  Menu,
  Microscope,
  Package,
  ScanLine,
  Settings2,
  UserPlus,
  Workflow,
  UserCircle2,
  X,
  LogOut,
  Home
} from 'lucide-react';
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
import { fetchPatientsFromSupabase, savePatientToSupabase, deletePatientFromSupabase, signOutUser } from './lib/supabase';

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

export function App() {
  const navigate = useNavigate();

  // Always start on Login Page first upon opening / running the app
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; role: 'ADMIN' | 'SURGEON' | 'CLINICAL_STAFF' } | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(() => {
    return localStorage.getItem('RECONAI_ACTIVE_PATIENT_ID');
  });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const activePatient = useMemo(
    () => (activePatientId ? patients.find((patient) => patient.id === activePatientId) || null : null),
    [patients, activePatientId]
  );

  const refreshPatients = async (userToUse?: { id?: string; email: string; role: string } | null) => {
    const user = userToUse !== undefined ? userToUse : currentUser;
    const supabaseData = await fetchPatientsFromSupabase(user?.email, user?.role, user?.id);
    if (supabaseData !== null) {
      setPatients(supabaseData);
      if (supabaseData.length > 0) {
        setActivePatientId((prev) => {
          const currentId = prev || localStorage.getItem('RECONAI_ACTIVE_PATIENT_ID');
          if (!currentId) return supabaseData[0].id;
          const existing = supabaseData.find(
            (p) => p.id === currentId || p.caseId === currentId
          );
          const valid = existing ? existing.id : supabaseData[0].id;
          if (valid) {
            localStorage.setItem('RECONAI_ACTIVE_PATIENT_ID', valid);
          }
          return valid;
        });
      } else {
        setActivePatientId(null);
        localStorage.removeItem('RECONAI_ACTIVE_PATIENT_ID');
      }
      return;
    }

    try {
      const authHeaders: Record<string, string> = user ? {
        'X-User-Id': user.id || '',
        'X-User-Email': user.email || '',
        'X-User-Role': user.role || 'SURGEON'
      } : {};

      const response = await fetch('/api/patients', { headers: authHeaders });
      const data = await response.json();
      const filtered = Array.isArray(data) ? data : [];
      setPatients(filtered);
      if (filtered.length > 0) {
        setActivePatientId((prev) => {
          const currentId = prev || localStorage.getItem('RECONAI_ACTIVE_PATIENT_ID');
          if (!currentId) return filtered[0].id;
          const existing = filtered.find((p: any) => p.id === currentId || p.caseId === currentId);
          const valid = existing ? existing.id : filtered[0].id;
          if (valid) {
            localStorage.setItem('RECONAI_ACTIVE_PATIENT_ID', valid);
          }
          return valid;
        });
      } else {
        setActivePatientId(null);
        localStorage.removeItem('RECONAI_ACTIVE_PATIENT_ID');
      }
    } catch (e) {
      console.warn('Backend fetch fallback:', e);
      setPatients([]);
      setActivePatientId(null);
      localStorage.removeItem('RECONAI_ACTIVE_PATIENT_ID');
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('RECONAI_USER_SESSION');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        refreshPatients(user).finally(() => setLoading(false));
        return;
      } catch {
        // invalid session
      }
    }
    refreshPatients(null).finally(() => setLoading(false));
  }, []);

  const handleLoginSuccess = (user: { id: string; email: string; name: string; role: 'ADMIN' | 'SURGEON' | 'CLINICAL_STAFF' }) => {
    setCurrentUser(user);
    localStorage.setItem('RECONAI_USER_SESSION', JSON.stringify(user));
    // Clear active patient from previous user session
    localStorage.removeItem('RECONAI_ACTIVE_PATIENT_ID');
    setActivePatientId(null);
    refreshPatients(user);
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('RECONAI_USER_SESSION');
    localStorage.removeItem('RECONAI_ACTIVE_PATIENT_ID');
    await signOutUser();
    navigate('/login', { replace: true });
  };

  const closeCase = async (patientToClose: Patient) => {
    if (!patientToClose) return;
    const updatedPatient = {
      ...patientToClose,
      status: 'Closed'
    };
    await savePatientToSupabase(updatedPatient, currentUser?.email, currentUser?.id);
    setActivePatientId(null);
    localStorage.removeItem('RECONAI_ACTIVE_PATIENT_ID');
    await refreshPatients(currentUser);
    navigate('/patients/records');
  };

  const deletePatient = async (patientId: string) => {
    if (!patientId) return;
    await deletePatientFromSupabase(patientId);
    if (activePatientId === patientId) {
      setActivePatientId(null);
      localStorage.removeItem('RECONAI_ACTIVE_PATIENT_ID');
    }
    await refreshPatients(currentUser);
  };

  const createPatient = async (payload: Partial<Patient>) => {
    const caseId = payload.caseId || `RECON-${Math.floor(10000 + Math.random() * 90000)}`;
    const patientData: Partial<Patient> = {
      ...payload,
      caseId,
      status: 'Registered',
      workflowProgress: 1,
      assignedDoctorId: currentUser?.id || 'p-surg-01',
      assignedDoctorEmail: currentUser?.email || 'dr.vance@reconai.com',
      createdBy: currentUser?.email || 'dr.vance@reconai.com'
    };

    // 1. Save to Supabase
    await savePatientToSupabase(patientData, currentUser?.email, currentUser?.id);

    // 2. Query Supabase to get real DB record with UUID
    const supabaseData = await fetchPatientsFromSupabase(currentUser?.email, currentUser?.role, currentUser?.id);
    let savedPatient = supabaseData?.find((p) => p.caseId === caseId);

    // 3. Fallback to Express backend if needed
    if (!savedPatient) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (currentUser) {
          headers['X-User-Id'] = currentUser.id || '';
          headers['X-User-Email'] = currentUser.email || '';
          headers['X-User-Role'] = currentUser.role || 'SURGEON';
        }

        const response = await fetch('/api/patients', {
          method: 'POST',
          headers,
          body: JSON.stringify(patientData)
        });
        if (response.ok) {
          savedPatient = await response.json();
        }
      } catch (e) {
        console.warn('Local API save fallback:', e);
      }
    }

    if (!savedPatient || !savedPatient.id) {
      savedPatient = {
        ...patientData,
        id: `p-${Date.now()}`
      } as Patient;
    }

    setPatients((current) => {
      const exists = current.some((p) => p.caseId === caseId || p.id === savedPatient!.id);
      return exists ? current.map((p) => (p.caseId === caseId || p.id === savedPatient!.id ? savedPatient! : p)) : [savedPatient!, ...current];
    });

    setActivePatientId(savedPatient.id);
    localStorage.setItem('RECONAI_ACTIVE_PATIENT_ID', savedPatient.id);
    navigate('/imaging');
    return savedPatient;
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

  // 1. Unauthenticated Login Route
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 2. Hospital / Admin Dashboard Layout
  if (currentUser.role === 'ADMIN') {
    return (
      <Routes>
        <Route element={<AdminLayout currentUser={currentUser} onLogout={handleLogout} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/staff" element={<StaffManagementPage />} />
          <Route path="/admin/add-surgeon" element={<AddSurgeonPage />} />
          <Route path="/admin/patients" element={<RecordsPage patients={patients} onDeletePatient={deletePatient} />} />
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
              <div className="mt-1 font-bold text-slate-800 truncate">
                {activePatient && activePatient.status !== 'Closed' ? activePatient.name : 'No active case selected'}
              </div>
              <div className="text-xs font-semibold text-blue-600">
                {activePatient && activePatient.status !== 'Closed'
                  ? (activePatient.caseId ? `${activePatient.caseId}` : 'Select an active patient')
                  : 'Select an active patient'}
              </div>
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
                  patients={patients}
                />
              }
            />
            <Route path="/patients/new" element={<PatientRegistrationPage onCreate={createPatient} />} />
            <Route path="/patients/records" element={<RecordsPage patients={patients} onDeletePatient={deletePatient} />} />
            <Route
              path="/imaging"
              element={
                <ImagingUploadPage
                  patient={activePatient}
                  patients={patients}
                  onSelectPatient={(id) => {
                    setActivePatientId(id);
                    localStorage.setItem('RECONAI_ACTIVE_PATIENT_ID', id);
                  }}
                  onRefresh={refreshPatients}
                />
              }
            />
            <Route path="/analysis" element={<AnalysisPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/classification" element={<ClassificationPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/graft" element={<GraftPlanningPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/fixation" element={<FixationPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/simulation" element={<SimulationPage patient={activePatient} onRefresh={refreshPatients} />} />
            <Route path="/reports" element={<ReportsPage patient={activePatient} onRefresh={refreshPatients} onCloseCase={closeCase} />} />
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
