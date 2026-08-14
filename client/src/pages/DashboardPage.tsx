import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Brain, FileImage, UserPlus, CheckCircle2, ChevronRight, X, FileText, CheckCircle } from 'lucide-react';

interface DashboardPageProps {
  patient: any;
  patients?: any[];
}

export function DashboardPage({ patient, patients = [] }: DashboardPageProps) {
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [selectedClosedCase, setSelectedClosedCase] = useState<any | null>(null);

  const activeCasesCount = patients.filter((p) => p.status !== 'Closed' && p.status !== 'CLOSED' && p.status !== 'Completed').length;
  const totalPatientsCount = patients.length;
  const closedPatients = patients.filter((p) => p.status === 'Closed' || p.status === 'CLOSED' || p.status === 'Completed');
  const closedCasesCount = closedPatients.length;
  const graftPlansCount = patients.filter((p) => p.graftPlan).length;

  const stats = [
    { id: 'active', label: 'Active Reconstructions', value: activeCasesCount.toString(), change: `${activeCasesCount} active case${activeCasesCount === 1 ? '' : 's'}`, color: 'bg-blue-500', clickable: false },
    { id: 'total', label: 'Total Patients', value: totalPatientsCount.toString(), change: `${totalPatientsCount} registered patient${totalPatientsCount === 1 ? '' : 's'}`, color: 'bg-indigo-500', clickable: false },
    { id: 'closed', label: 'Closed Cases', value: closedCasesCount.toString(), change: `${closedCasesCount} completed reconstruction case${closedCasesCount === 1 ? '' : 's'} (click to view)`, color: 'bg-slate-500', clickable: true },
    { id: 'graft', label: 'Graft Plans Formulated', value: graftPlansCount.toString(), change: `${graftPlansCount} formulated plan${graftPlansCount === 1 ? '' : 's'}`, color: 'bg-emerald-500', clickable: false }
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            onClick={() => stat.clickable && setShowClosedModal(true)}
            className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 transition ${
              stat.clickable ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' : ''
            }`}
          >
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

      {/* Closed Cases Historical View Modal */}
      {showClosedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-slate-800 p-2 text-white">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Closed Reconstruction Cases</h3>
                  <p className="text-xs text-slate-500">{closedPatients.length} completed cases archived in database</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowClosedModal(false);
                  setSelectedClosedCase(null);
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {closedPatients.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No closed cases yet. Cases mark as closed will be listed here.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {closedPatients.map((c: any) => (
                  <div key={c.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-slate-900">{c.name}</span>
                        <span className="text-xs font-semibold text-blue-600 block">{c.patientId ? `${c.patientId} • ` : ''}{c.caseId}</span>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                        Status: CLOSED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div><span className="text-slate-400">Anatomy:</span> {c.anatomy || 'Mandible'}</div>
                      <div><span className="text-slate-400">Indication:</span> {c.indication || 'Resection Defect'}</div>
                    </div>

                    <button
                      onClick={() => setSelectedClosedCase(selectedClosedCase?.id === c.id ? null : c)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                    >
                      <FileText size={14} className="text-blue-600" />
                      <span>{selectedClosedCase?.id === c.id ? 'Hide Case Details' : 'View Archived Analysis & Report'}</span>
                    </button>

                    {selectedClosedCase?.id === c.id && (
                      <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-3 animate-in fade-in duration-150 text-xs">
                        <div>
                          <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px] mb-1">Archived AI Volumetric Result</span>
                          {c.analysis ? (
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div><span className="text-slate-400">Missing Bone:</span> <strong className="text-blue-900">{c.analysis.boneVolumeMissing} cm³</strong></div>
                              <div><span className="text-slate-400">Soft Tissue:</span> <strong className="text-amber-900">{c.analysis.softTissueRequirement} cm³</strong></div>
                              <div><span className="text-slate-400">Defect Specs:</span> <strong>{c.analysis.defectLength}x{c.analysis.defectWidth}x{c.analysis.defectDepth} mm</strong></div>
                              <div><span className="text-slate-400">Confidence:</span> <strong className="text-emerald-700">{c.analysis.modelConfidence}%</strong></div>
                            </div>
                          ) : (
                            <div className="text-slate-400 italic">No AI volumetric analysis saved for this case.</div>
                          )}
                        </div>

                        {c.report?.content && (
                          <div>
                            <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px] mb-1">Archived Surgical Report</span>
                            <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[10px] leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto">
                              {c.report.content}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setShowClosedModal(false);
                  setSelectedClosedCase(null);
                }}
                className="px-5 py-2 rounded-2xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
