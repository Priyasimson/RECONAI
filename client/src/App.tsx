import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Activity, Brain, ClipboardList, FileImage, FileText, Menu, Microscope, Package, ScanLine, Settings2, UserPlus, Workflow, Bell, UserCircle2, X } from 'lucide-react';
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

const navItems = [
  { to: '/', label: 'Dashboard', icon: Activity },
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

function App() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const activePatient = useMemo(() => patients.find((patient) => patient.id === activePatientId) || null, [patients, activePatientId]);

  const refreshPatients = async () => {
    const response = await fetch('/api/patients');
    const data = await response.json();
    setPatients(data);
    if (!activePatientId && data[0]) {
      setActivePatientId(data[0].id);
    } else if (activePatientId) {
      const current = data.find((entry: Patient) => entry.id === activePatientId);
      if (!current && data[0]) setActivePatientId(data[0].id);
    }
  };

  useEffect(() => {
    refreshPatients().finally(() => setLoading(false));
  }, []);

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
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading clinical workflow…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden w-72 border-r bg-white p-5 lg:block">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 text-white">
              <Workflow size={20} />
            </div>
            <div>
              <div className="text-lg font-semibold">RECONAI</div>
              <div className="text-sm text-slate-500">AI Reconstruction Planning</div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="font-semibold text-slate-700">Active case</div>
            <div className="mt-1 font-medium">{activePatient?.name || 'No patient selected'}</div>
            <div className="text-slate-500">{activePatient?.caseId || 'Create a new case'}</div>
          </div>
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden={!menuOpen} style={{ display: menuOpen ? 'block' : 'none' }}>
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white p-5 shadow-xl transition-transform duration-300">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-600 p-2 text-white"><Workflow size={18} /></div>
                <div>
                  <div className="font-semibold">RECONAI</div>
                  <div className="text-xs text-slate-500">AI Reconstruction Planning</div>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close navigation">
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <main className="flex-1 p-3 sm:p-4 lg:p-8">
          <header className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
            <button onClick={() => setMenuOpen(true)} className="rounded-2xl p-2 hover:bg-slate-100" aria-label="Open navigation">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-blue-600 p-2 text-white"><Workflow size={16} /></div>
              <div>
                <div className="text-sm font-semibold">RECONAI</div>
                <div className="text-[10px] text-slate-500">AI Reconstruction Planning</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-2xl p-2 hover:bg-slate-100" aria-label="Notifications"><Bell size={18} /></button>
              <button className="rounded-2xl p-2 hover:bg-slate-100" aria-label="Profile"><UserCircle2 size={18} /></button>
            </div>
          </header>
          <Routes>
            <Route path="/" element={<DashboardPage patient={activePatient} />} />
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
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
