import { PlayCircle, ScanLine } from 'lucide-react';

interface SimulationPageProps {
  patient: any;
  onRefresh: () => Promise<void>;
}

export function SimulationPage({ patient, onRefresh }: SimulationPageProps) {
  const runSimulation = async () => {
    const response = await fetch(`/api/patients/${patient.id}/simulation`, { method: 'POST' });
    await response.json();
    await onRefresh();
  };

  const data = patient?.simulation;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><ScanLine size={20} /></div>
          <div>
            <h1 className="text-2xl font-semibold">Reconstruction Simulation</h1>
            <p className="text-sm text-slate-500">Compare before and after anatomy using the shared defect, graft, and fixation plan.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Before / After comparison</div>
            <button onClick={runSimulation} className="rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white">Play Simulation</button>
          </div>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>BEFORE</span>
              <span>AFTER</span>
            </div>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-teal-700 p-10 text-center text-slate-100">
              <PlayCircle className="mx-auto mb-3" size={36} />
              <div className="text-lg font-semibold">Simulated reconstruction preview</div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Final metrics</div>
          {data ? (
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div>Predicted bone alignment: {data.predictedAlignment}%</div>
              <div>Soft tissue coverage: {data.softTissueCoverage}%</div>
              <div>Estimated functional recovery: {data.functionalRecovery}%</div>
              <div>Reconstruction quality score: {data.qualityScore}/100</div>
              <div>Notes: {data.notes}</div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-500">Run the simulation to view outputs.</div>
          )}
        </div>
      </div>
    </div>
  );
}
