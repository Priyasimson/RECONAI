import { Activity, Brain, FileText, Microscope, UserRound, Workflow } from 'lucide-react';

interface DashboardPageProps {
  patient: any;
}

export function DashboardPage({ patient }: DashboardPageProps) {
  const cards = [
    { label: 'Active patients', value: patient ? '1' : '0' },
    { label: 'Pending analyses', value: patient?.analysis ? '0' : '1' },
    { label: 'Completed plans', value: patient?.graftPlan ? '1' : '0' },
    { label: 'Reports generated', value: patient?.report ? '1' : '0' }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><Activity size={20} /></div>
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">RECONAI Dashboard</h1>
            <p className="text-sm text-slate-500">Clinical workflow overview for the active reconstruction case.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-800">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Workflow progress</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {['Patient Registration', 'Upload Imaging', 'AI Volume Analysis', 'Defect Classification', 'Graft Planning', 'Fixation Recommendation', 'Reconstruction Simulation'].map((step, index) => {
              const active = patient?.workflowProgress ? index + 1 <= patient.workflowProgress : index === 0;
              return <div key={step} className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${active ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-slate-50'}`}>{active ? '✓' : '•'} {step}</div>;
            })}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Current case</div>
          {patient ? (
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2"><UserRound size={16} /> {patient.name}</div>
              <div className="flex items-center gap-2"><Workflow size={16} /> {patient.caseId}</div>
              <div className="flex items-center gap-2"><Brain size={16} /> AI confidence {patient.analysis?.modelConfidence || '94'}%</div>
              <div className="flex items-center gap-2"><FileText size={16} /> Graft selected {patient.graftPlan?.selectedGraft || 'Autogenous'}</div>
              <div className="flex items-center gap-2"><Microscope size={16} /> Fixation selected {patient.fixation?.selectedHardware || 'Reconstruction Plate'}</div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-500">Create or select a patient to view this summary.</div>
          )}
        </div>
      </div>
    </div>
  );
}
