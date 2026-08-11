import { Link } from 'react-router-dom';
import { Activity, Brain, FileImage, UserPlus, CheckCircle2, ChevronRight } from 'lucide-react';

interface DashboardPageProps {
  patient: any;
}

export function DashboardPage({ patient }: DashboardPageProps) {
  const stats = [
    { label: 'Active Reconstructions', value: patient ? '1' : '0', change: '+1 case active', color: 'bg-blue-500' },
    { label: 'AI Volumetric Scans', value: patient?.analysis ? '1' : '0', change: patient?.analysis ? `${patient.analysis.modelConfidence}% confidence` : 'Pending execution', color: 'bg-indigo-500' },
    { label: 'Graft Plans Formulated', value: patient?.graftPlan ? '1' : '0', change: patient?.graftPlan?.selectedGraft || 'Awaiting plan', color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3.5 text-white shadow-md shadow-blue-500/20">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">RECONAI Clinical Dashboard</h1>
            <p className="text-xs text-slate-500">AI-driven 3D reconstruction & surgical planning workflow platform.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${stat.color}`} />
            </div>
            <div className="text-2xl font-black text-slate-800">{stat.value}</div>
            <div className="text-xs text-slate-400 font-medium">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Workflow Progress & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Active Workflow Progress */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Surgical Workflow Tracker</h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Case: {patient?.caseId || 'No active patient'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { label: 'Patient Registration', path: '/patients/new', step: 1 },
              { label: 'Upload Imaging & DICOM', path: '/imaging', step: 2 },
              { label: 'AI Volume Analysis & Result Summary', path: '/analysis', step: 3 },
              { label: 'Anatomical Classification', path: '/classification', step: 4 },
              { label: 'Autogenous / Custom Graft Planning', path: '/graft', step: 5 },
              { label: 'Fixation & Biomechanical Plate Design', path: '/fixation', step: 6 },
              { label: 'Reconstruction Simulation & Report', path: '/simulation', step: 7 }
            ].map((item) => {
              const completed = patient?.workflowProgress ? item.step <= patient.workflowProgress : item.step === 1;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center justify-between rounded-2xl border p-3 transition ${
                    completed
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900 hover:bg-emerald-100/50'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className={completed ? 'text-emerald-600' : 'text-slate-400'} />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Quick Actions</h3>

            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/patients/new"
                className="rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 p-4 transition flex items-center gap-3.5 group"
              >
                <div className="rounded-xl bg-blue-600 p-2.5 text-white group-hover:scale-105 transition">
                  <UserPlus size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Register New Patient</div>
                  <div className="text-xs text-slate-500">Add clinical history & defect location</div>
                </div>
              </Link>

              <Link
                to="/imaging"
                className="rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 p-4 transition flex items-center gap-3.5 group"
              >
                <div className="rounded-xl bg-indigo-600 p-2.5 text-white group-hover:scale-105 transition">
                  <FileImage size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Upload Medical Imaging</div>
                  <div className="text-xs text-slate-500">DICOM, CT, CBCT & interactive filters</div>
                </div>
              </Link>

              <Link
                to="/analysis"
                className="rounded-2xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 p-4 transition flex items-center gap-3.5 group"
              >
                <div className="rounded-xl bg-emerald-600 p-2.5 text-white group-hover:scale-105 transition">
                  <Brain size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">AI Volumetric Analysis</div>
                  <div className="text-xs text-slate-500">Quantify missing volume & result summary</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Active Case Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Patient Summary</h3>
            {patient ? (
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Patient Name:</span>
                  <span className="font-bold">{patient.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Case ID:</span>
                  <span className="font-bold text-blue-600">{patient.caseId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Defect Site:</span>
                  <span className="font-semibold">{patient.defectLocation || patient.anatomy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold text-emerald-600">{patient.status}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-4">No active case selected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
