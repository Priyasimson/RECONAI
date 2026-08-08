import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';

interface ClassificationPageProps {
  patient: any;
  onRefresh: () => Promise<void>;
}

export function ClassificationPage({ patient, onRefresh }: ClassificationPageProps) {
  const [category, setCategory] = useState('Mandible');

  const confirm = async () => {
    const response = await fetch(`/api/patients/${patient.id}/classification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    });
    await response.json();
    await onRefresh();
  };

  const data = patient?.classification;
  const severity = data?.severity || 'Moderate';

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><ClipboardCheck size={20} /></div>
          <div>
            <h1 className="text-2xl font-semibold">Defect Classification</h1>
            <p className="text-sm text-slate-500">Use the AI volume metrics to classify the defect and enable graft planning.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Anatomical category</div>
          <select className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="Mandible">Mandible</option>
            <option value="Maxilla">Maxilla</option>
            <option value="Orbital">Orbital</option>
            <option value="Orthopedic">Orthopedic</option>
            <option value="Trauma">Trauma</option>
            <option value="Maxillofacial">Maxillofacial</option>
          </select>
          <button onClick={confirm} className="mt-6 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white">Confirm Classification</button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Classification output</div>
          {data ? (
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-teal-50 p-4 text-lg font-semibold text-teal-700">{severity.toUpperCase()} DEFECT</div>
              <div>Category: {data.category}</div>
              <div>Bone volume missing: {data.boneVolumeMissing} cm³</div>
              <div>Soft tissue requirement: {data.softTissueRequirement} cm³</div>
              <div>Continuity loss: {data.continuityLoss}</div>
              <div>Contamination: {data.contamination}</div>
              <div>Dimensions: {data.defectDimensions}</div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-500">Classification will appear after confirmation.</div>
          )}
        </div>
      </div>
    </div>
  );
}
