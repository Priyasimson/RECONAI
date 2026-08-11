import { useState, useEffect } from 'react';
import { ClipboardCheck, Sparkles } from 'lucide-react';
import { savePatientToSupabase } from '../lib/supabase';

interface ClassificationPageProps {
  patient: any;
  onRefresh: () => Promise<void>;
}

export function ClassificationPage({ patient, onRefresh }: ClassificationPageProps) {
  const [category, setCategory] = useState('Mandible');
  const [localData, setLocalData] = useState<any>(null);

  useEffect(() => {
    if (patient?.classification) setLocalData(patient.classification);
  }, [patient]);

  const confirm = async () => {
    if (!patient) return;
    const analysis = patient.analysis || { boneVolumeMissing: 18.4, softTissueRequirement: 26.1, defectLength: 41.5, defectWidth: 22.8, defectDepth: 14.2 };
    const severity = analysis.boneVolumeMissing > 35 ? 'Complex' : analysis.boneVolumeMissing > 20 ? 'Large' : analysis.boneVolumeMissing > 10 ? 'Moderate' : 'Small';

    const classificationObj = {
      category,
      severity,
      continuityLoss: 'Full Segmental Continuity Loss',
      contamination: 'Low Contamination',
      classificationReason: `Classified as ${category} ${severity} defect based on ${analysis.boneVolumeMissing} cm³ volumetric bone deficit.`,
      boneVolumeMissing: analysis.boneVolumeMissing,
      softTissueRequirement: analysis.softTissueRequirement,
      defectDimensions: `${analysis.defectLength} mm x ${analysis.defectWidth} mm x ${analysis.defectDepth} mm`
    };

    setLocalData(classificationObj);

    const updatedPatient = {
      ...patient,
      classification: classificationObj,
      workflowProgress: Math.max(patient.workflowProgress || 1, 4),
      status: 'Classified'
    };

    try {
      await savePatientToSupabase(updatedPatient);
      await fetch(`/api/patients/${patient.id}/classification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      }).catch((e) => console.warn('Server fallback:', e));
      await onRefresh();
    } catch (err) {
      console.error('Classification save error:', err);
    }
  };

  const data = localData || patient?.classification;
  const severity = data?.severity || 'Moderate';

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><ClipboardCheck size={20} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Defect Classification</h1>
            <p className="text-xs text-slate-500">Use the AI volume metrics to classify the defect and enable graft planning.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="text-base font-bold text-slate-800">Select Anatomical Category</div>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="Mandible">Mandible</option>
            <option value="Maxilla">Maxilla</option>
            <option value="Orbital">Orbital</option>
            <option value="Orthopedic">Orthopedic</option>
            <option value="Trauma">Trauma</option>
            <option value="Maxillofacial">Maxillofacial</option>
          </select>

          <button
            onClick={confirm}
            className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 font-semibold py-3 text-white shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
          >
            <Sparkles size={16} />
            <span>Confirm Classification</span>
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-base font-bold text-slate-800">Classification Output</div>
          {data ? (
            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 text-base font-black text-teal-800">
                {severity.toUpperCase()} DEFECT
              </div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Category:</span><span className="font-bold">{data.category}</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Bone Volume Missing:</span><span className="font-bold">{data.boneVolumeMissing} cm³</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Soft Tissue Need:</span><span className="font-bold">{data.softTissueRequirement} cm³</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Continuity Loss:</span><span className="font-semibold">{data.continuityLoss}</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Contamination:</span><span className="font-semibold">{data.contamination}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Dimensions:</span><span className="font-semibold">{data.defectDimensions}</span></div>
            </div>
          ) : (
            <div className="mt-6 text-center text-xs text-slate-400 py-6">
              Classification output will appear after confirmation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
