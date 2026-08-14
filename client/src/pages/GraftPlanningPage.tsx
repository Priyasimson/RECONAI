import { useState, useEffect } from 'react';
import { Package2, CheckCircle2 } from 'lucide-react';
import { savePatientToSupabase } from '../lib/supabase';

interface GraftPlanningPageProps {
  patient: any;
  onRefresh: () => Promise<void>;
}

export function GraftPlanningPage({ patient, onRefresh }: GraftPlanningPageProps) {
  const [selectedGraft, setSelectedGraft] = useState('Autogenous Fibula Flap');
  const [localPlan, setLocalPlan] = useState<any>(null);

  useEffect(() => {
    if (patient?.graftPlan) setLocalPlan(patient.graftPlan);
  }, [patient]);

  const savePlan = async () => {
    if (!patient) return;
    const classification = patient.classification || {};
    const analysis = patient.analysis || {};

    const graftPlanObj = {
      selectedGraft,
      boneVolumeRequired: analysis.boneVolumeMissing || 18.4,
      softTissueRequired: analysis.softTissueRequirement || 26.1,
      estimatedQuantity: 24.8,
      healingPrediction: 'Expected complete union in 4-6 months',
      classificationSeverity: classification.severity || 'Moderate',
      options: [
        { name: 'Autogenous Fibula Flap', success: '96%', risk: 'Low Risk', highlight: 'AI Preferred', advantages: 'Vascularized bicortical bone', disadvantages: 'Donor site morbidity' },
        { name: 'Iliac Crest Autograft', success: '91%', risk: 'Low-Medium', highlight: 'High Density', advantages: 'Large cancellous volume', disadvantages: 'Donor site pain' },
        { name: 'Allograft Scaffold', success: '87%', risk: 'Moderate', highlight: 'No Donor Site', advantages: 'Immediate availability', disadvantages: 'Slower incorporation' },
        { name: 'Synthetic CAD Scaffold', success: '82%', risk: 'Low-Medium', highlight: 'Custom Fit', advantages: 'Patient-matched geometry', disadvantages: 'Scaffold degradation' }
      ]
    };

    setLocalPlan(graftPlanObj);

    const updatedPatient = {
      ...patient,
      graftPlan: graftPlanObj,
      workflowProgress: Math.max(patient.workflowProgress || 1, 5),
      status: 'Graft Planned'
    };

    try {
      const savedSession = localStorage.getItem('RECONAI_USER_SESSION');
      const userSession = savedSession ? JSON.parse(savedSession) : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(userSession ? {
          'X-User-Id': userSession.id || '',
          'X-User-Email': userSession.email || '',
          'X-User-Role': userSession.role || 'SURGEON'
        } : {})
      };

      await savePatientToSupabase(updatedPatient, patient.createdBy, patient.assignedDoctorId);
      await fetch(`/api/patients/${patient.id}/graft-plan`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ selectedGraft })
      }).catch((e) => console.warn('Server fallback:', e));
      await onRefresh();
    } catch (e) {
      console.error('Graft save error:', e);
    }
  };

  const data = localPlan || patient?.graftPlan;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><Package2 size={20} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Graft Planning</h1>
            <p className="text-xs text-slate-500">Compare graft options and save a plan that flows to fixation recommendation.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          {[
            { name: 'Autogenous Fibula Flap', tag: '96% / Low Risk (AI Pick)', desc: 'Vascularized free bone flap ideal for long segmental mandible defect.' },
            { name: 'Iliac Crest Autograft', tag: '91% / High Bone Density', desc: 'Abundant corticocancellous bone volume for shorter defects.' },
            { name: 'Allograft Scaffold', tag: '87% / No Donor Morbidity', desc: 'Pre-processed human donor bone scaffold.' },
            { name: 'Synthetic CAD Scaffold', tag: '82% / Custom Patient-Matched', desc: '3D printed bioceramic / PEEK structural scaffold.' }
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setSelectedGraft(item.name)}
              className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${selectedGraft === item.name ? 'border-blue-600 bg-blue-50/70 shadow-md' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                <div className="text-xs font-semibold text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-full">{item.tag}</div>
              </div>
              <div className="mt-1.5 text-xs text-slate-600 leading-relaxed">{item.desc}</div>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="text-base font-bold text-slate-800">Selected Graft Plan</div>
            {data ? (
              <div className="mt-4 space-y-2.5 text-xs text-slate-700">
                <div className="rounded-2xl bg-blue-600 text-white p-3 font-bold text-sm flex items-center justify-between">
                  <span>{data.selectedGraft}</span>
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Bone Volume Required:</span><span className="font-bold">{data.boneVolumeRequired} cm³</span></div>
                <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Soft Tissue Need:</span><span className="font-bold">{data.softTissueRequired} cm³</span></div>
                <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Estimated Quantity:</span><span className="font-bold">{data.estimatedQuantity} cm³</span></div>
                <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400">Healing Outlook:</span><span className="font-semibold text-emerald-700">{data.healingPrediction}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Severity Rating:</span><span className="font-semibold">{data.classificationSeverity}</span></div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-slate-400 py-6">
                Choose a graft option on the left and click "Save Graft Plan".
              </div>
            )}
          </div>

          <button onClick={savePlan} className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 py-3 font-semibold text-white text-sm shadow-md transition">
            Save Graft Plan
          </button>
        </div>
      </div>
    </div>
  );
}
