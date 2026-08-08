import { Brain, ScanSearch } from 'lucide-react';

interface AnalysisPageProps {
  patient: any;
  onRefresh: () => Promise<void>;
}

export function AnalysisPage({ patient, onRefresh }: AnalysisPageProps) {
  const runAnalysis = async () => {
    if (!patient) return;
    const response = await fetch(`/api/patients/${patient.id}/analysis`, { method: 'POST' });
    await response.json();
    await onRefresh();
  };

  const data = patient?.analysis;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><Brain size={20} /></div>
          <div>
            <h1 className="text-2xl font-semibold">AI Volume Analysis</h1>
            <p className="text-sm text-slate-500">Demo/simulation analysis mode is clearly labeled and based on the uploaded scan metadata.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">3D segmentation viewer</div>
            <button onClick={runAnalysis} className="rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white">Run AI</button>
          </div>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-blue-100 px-3 py-1">Rotate</span>
              <span className="rounded-full bg-blue-100 px-3 py-1">Zoom</span>
              <span className="rounded-full bg-blue-100 px-3 py-1">Pan</span>
              <span className="rounded-full bg-blue-100 px-3 py-1">Reset view</span>
            </div>
            <div className="mt-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-10 text-center text-slate-100">
              <ScanSearch className="mx-auto mb-3" size={38} />
              <div className="text-lg font-semibold">Segmentation preview</div>
              <div className="mt-2 text-sm text-slate-300">Native bone / defect / soft tissue layers available in demo mode.</div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">Simulation metrics</div>
            {data ? (
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div>Bone volume missing: <span className="font-semibold text-slate-800">{data.boneVolumeMissing} cm³</span></div>
                <div>Soft tissue requirement: <span className="font-semibold text-slate-800">{data.softTissueRequirement} cm³</span></div>
                <div>Estimated graft size: <span className="font-semibold text-slate-800">{data.estimatedGraftSize} cm³</span></div>
                <div>Defect depth: <span className="font-semibold text-slate-800">{data.defectDepth} mm</span></div>
                <div>Defect width: <span className="font-semibold text-slate-800">{data.defectWidth} mm</span></div>
                <div>Defect length: <span className="font-semibold text-slate-800">{data.defectLength} mm</span></div>
                <div>Model confidence: <span className="font-semibold text-slate-800">{data.modelConfidence}%</span></div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-500">Run AI to create analysis outputs.</div>
            )}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">Processing pipeline</div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
              {['Image preprocessing', 'Noise reduction', 'Bone segmentation', 'Soft tissue segmentation', 'Defect detection', '3D reconstruction', 'Volume calculation', 'Confidence evaluation'].map((step) => (
                <span key={step} className="rounded-full bg-slate-100 px-3 py-1">{step}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
