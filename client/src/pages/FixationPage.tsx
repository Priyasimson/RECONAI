import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface FixationPageProps {
  patient: any;
  onRefresh: () => Promise<void>;
}

export function FixationPage({ patient, onRefresh }: FixationPageProps) {
  const [hardware, setHardware] = useState('Reconstruction Plate');

  const saveFixation = async () => {
    const response = await fetch(`/api/patients/${patient.id}/fixation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedHardware: hardware })
    });
    await response.json();
    await onRefresh();
  };

  const data = patient?.fixation;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><ShieldCheck size={20} /></div>
          <div>
            <h1 className="text-2xl font-semibold">Fixation Recommendation</h1>
            <p className="text-sm text-slate-500">Rank hardware options using the selected graft and defect metrics.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Hardware options</div>
          <select className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2" value={hardware} onChange={(event) => setHardware(event.target.value)}>
            <option value="Reconstruction Plate">Reconstruction Plate</option>
            <option value="Locking Plate">Locking Plate</option>
            <option value="Mini Plate">Mini Plate</option>
            <option value="Microvascular Fixation">Microvascular Fixation</option>
            <option value="Dynamic Compression Plate">Dynamic Compression Plate</option>
            <option value="External Fixator">External Fixator</option>
          </select>
          <button onClick={saveFixation} className="mt-6 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white">Accept Recommendation</button>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">AI evaluation</div>
          {data ? (
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div>Peak stress: {data.peakStress} MPa</div>
              <div>Load capacity: {data.loadCapacity} N</div>
              <div>Biomechanical score: {data.biomechanicalScore}/100</div>
              <div>Stability: {data.stability}%</div>
              <div>Stress distribution: {data.stressDistribution}</div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-500">Recommendation output will appear after selection.</div>
          )}
        </div>
      </div>
    </div>
  );
}
