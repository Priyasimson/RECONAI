import { useState } from 'react';
import { Package2 } from 'lucide-react';

interface GraftPlanningPageProps {
  patient: any;
  onRefresh: () => Promise<void>;
}

export function GraftPlanningPage({ patient, onRefresh }: GraftPlanningPageProps) {
  const [selectedGraft, setSelectedGraft] = useState('Autogenous');

  const savePlan = async () => {
    const response = await fetch(`/api/patients/${patient.id}/graft-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedGraft })
    });
    await response.json();
    await onRefresh();
  };

  const data = patient?.graftPlan;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><Package2 size={20} /></div>
          <div>
            <h1 className="text-2xl font-semibold">Graft Planning</h1>
            <p className="text-sm text-slate-500">Compare graft options and save a plan that flows to fixation recommendation.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {['Autogenous', 'Allograft', 'Xenograft', 'Synthetic'].map((option) => (
            <button key={option} onClick={() => setSelectedGraft(option)} className={`w-full rounded-3xl border p-4 text-left shadow-sm ${selectedGraft === option ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="font-semibold">{option}</div>
                <div className="text-sm text-slate-500">{option === 'Autogenous' ? '94% / Low Risk' : 'AI option'}</div>
              </div>
              <div className="mt-2 text-sm text-slate-600">Predicted success/union score and clinical considerations are shown in demo mode.</div>
            </button>
          ))}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Selected graft plan</div>
          {data ? (
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div>Bone volume required: {data.boneVolumeRequired} cm³</div>
              <div>Soft tissue required: {data.softTissueRequired} cm³</div>
              <div>Estimated quantity: {data.estimatedQuantity} cm³</div>
              <div>Healing prediction: {data.healingPrediction}</div>
              <div>Selected graft: {data.selectedGraft}</div>
              <div>Severity: {data.classificationSeverity}</div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-500">Choose a graft option and save the plan.</div>
          )}
          <button onClick={savePlan} className="mt-6 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white">Save plan</button>
        </div>
      </div>
    </div>
  );
}
