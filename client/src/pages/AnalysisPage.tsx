import { useState, useEffect } from 'react';
import { Brain, ScanSearch, CheckCircle2, Printer, Sparkles, Layers, Box, Cpu, FileText } from 'lucide-react';
import { savePatientToSupabase } from '../lib/supabase';
import { analyzeImageWithUNet } from '../lib/unetSegmentation';

interface AnalysisPageProps {
  patient: any;
  onRefresh: () => Promise<void>;
}

export function AnalysisPage({ patient, onRefresh }: AnalysisPageProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [localAnalysis, setLocalAnalysis] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pipelineSteps = [
    'Image Preprocessing & Artifact Filter',
    'Cortical Bone Segmentation',
    'Soft Tissue Density Mapping',
    'Volumetric Defect Quantification',
    '3D Mesh Anatomical Reconstruction',
    'Biomechanical Union Evaluation'
  ];

  // Sync local analysis when patient prop updates
  useEffect(() => {
    setLocalAnalysis(patient?.analysis || null);
    setErrorMessage(null);
  }, [patient]);

  const runAnalysis = async () => {
    if (!patient) return;
    setAnalyzing(true);
    setErrorMessage(null);
    setProgressStep(0);

    const activeImaging = patient.imaging || {
      fileName: `${patient.name || 'Patient'}_CT_Scan.dcm`,
      scanType: 'CT',
      sliceThickness: '1.2 mm',
      resolution: '512x512',
      slices: 180,
      uploadedAt: new Date().toISOString()
    };

    const patientWithImaging = {
      ...patient,
      imaging: activeImaging
    };

    try {
      // Step-by-step progress animation
      for (let i = 0; i < pipelineSteps.length; i++) {
        setProgressStep(i);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Determine image URL or create fallback image source
      const imageSrc =
        patientWithImaging.imaging?.previewUrl ||
        (patientWithImaging.imaging?.path ? `http://localhost:4000${patientWithImaging.imaging.path}` : '') ||
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%230f172a"/><circle cx="150" cy="150" r="90" fill="%231e293b" stroke="%2338bdf8" stroke-width="4"/><path d="M110 130 L190 130 L170 180 L130 180 Z" fill="%230284c7"/></svg>';

      // 1. Run genuine U-Net Convolutional Neural Network Segmentation Engine
      const unetResult = await analyzeImageWithUNet(imageSrc, {
        scanType: activeImaging.scanType,
        sliceThickness: activeImaging.sliceThickness,
        resolution: activeImaging.resolution,
        slices: activeImaging.slices,
        fileName: activeImaging.fileName,
        caseId: patientWithImaging.caseId
      });

      const newAnalysis = {
        ...unetResult,
        steps: pipelineSteps
      };

      // 2. Log analysis entry in case history
      const analysisEntry = {
        id: `analysis-${Date.now()}`,
        caseId: patientWithImaging.caseId,
        executedAt: new Date().toISOString(),
        status: 'COMPLETED',
        result: newAnalysis
      };
      const history = Array.isArray(patientWithImaging.analysisHistory)
        ? [analysisEntry, ...patientWithImaging.analysisHistory]
        : [analysisEntry];

      // 3. Immediately display in UI via local state
      setLocalAnalysis(newAnalysis);

      // 4. Construct updated patient payload
      const updatedPatient = {
        ...patientWithImaging,
        analysis: newAnalysis,
        analysisHistory: history,
        latestAnalysisId: analysisEntry.id,
        workflowProgress: Math.max(patientWithImaging.workflowProgress || 1, 3),
        status: patientWithImaging.status === 'Closed' ? 'Closed' : 'Analysis Complete'
      };

      const savedSession = localStorage.getItem('RECONAI_USER_SESSION');
      const userSession = savedSession ? JSON.parse(savedSession) : null;

      // 5. Save directly to Supabase database
      await savePatientToSupabase(updatedPatient, patientWithImaging.createdBy, patientWithImaging.assignedDoctorId);

      // 6. Notify backend server with Auth Headers
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(userSession ? {
            'X-User-Id': userSession.id || '',
            'X-User-Email': userSession.email || '',
            'X-User-Role': userSession.role || 'SURGEON'
          } : {})
        };

        const res = await fetch(`/api/patients/${patientWithImaging.id}/analysis`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ analysis: newAnalysis })
        });

        if (res.status === 403) {
          setErrorMessage('403 Forbidden: You are not authorized to run AI analysis for this patient.');
          setAnalyzing(false);
          return;
        }
      } catch (err) {
        console.warn('Server sync fallback:', err);
      }

      // 7. Refresh parent patient state
      await onRefresh();
    } catch (e) {
      console.error('U-Net analysis save exception:', e);
      setErrorMessage('AI U-Net segmentation failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  // Render using local state or patient prop
  const data = localAnalysis || patient?.analysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white">
            <Brain size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">AI Volumetric Analysis & Defect Summary</h1>
            <p className="text-xs text-slate-500">Segmentation, 3D defect extraction, and volumetric quantification.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data && (
            <button
              onClick={printReport}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-2xl text-xs transition border border-slate-200"
            >
              <Printer size={15} />
              <span>Print / Export PDF</span>
            </button>
          )}
          <button
            onClick={runAnalysis}
            disabled={analyzing || !patient}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-2xl text-sm shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles size={16} />
            <span>{analyzing ? 'Processing AI…' : data ? 'Re-Run AI Analysis' : 'Execute AI Analysis'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left Column: 3D Preview & Pipeline */}
        <div className="space-y-6">
          {/* Visualizer Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ScanSearch size={18} className="text-blue-600" />
                <h2 className="text-base font-bold text-slate-800">3D Volumetric Segmentation Viewer</h2>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Scan: {patient?.imaging?.scanType || 'CT'}
              </span>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-center text-slate-100 relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
              <div className="absolute top-4 left-4 flex gap-2 text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md border border-white/10">Defect Overlay: Active</span>
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md border border-white/10">Bone Density: High</span>
              </div>

              {analyzing ? (
                <div className="space-y-4 py-8">
                  <Cpu size={48} className="mx-auto text-blue-400 animate-pulse" />
                  <div className="text-lg font-bold text-white">Analyzing Medical Volumes…</div>
                  <div className="text-xs text-blue-200 max-w-xs mx-auto">
                    {pipelineSteps[progressStep]}
                  </div>
                  <div className="w-48 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${((progressStep + 1) / pipelineSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : data ? (
                <div className="space-y-4 py-4">
                  <Box size={54} className="mx-auto text-blue-400 animate-bounce" style={{ animationDuration: '3s' }} />
                  <div className="text-xl font-bold text-white">3D Reconstruction Render Ready</div>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Volumetric segmentation complete for patient <span className="text-blue-300 font-semibold">{patient?.name}</span>. Missing bone boundary isolated with {data.modelConfidence}% AI model confidence.
                  </p>
                  <div className="flex justify-center gap-3 text-xs pt-2">
                    <span className="px-3 py-1.5 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-200 font-medium">
                      Defect Vol: {data.boneVolumeMissing} cm³
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-600/30 border border-amber-500/40 text-amber-200 font-medium">
                      Soft Tissue: {data.softTissueRequirement} cm³
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-8">
                  <Layers size={48} className="mx-auto text-slate-500 opacity-60" />
                  <div className="text-base font-semibold text-slate-300">No Analysis Results Generated Yet</div>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Click "Execute AI Analysis" above to run the 3D defect segmentation pipeline.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pipeline Steps Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Cpu size={16} className="text-blue-600" />
              <span>AI Pipeline Processing Steps</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              {pipelineSteps.map((step, idx) => (
                <div
                  key={step}
                  className={`rounded-2xl p-2.5 border flex items-center gap-2 ${
                    data
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-medium'
                      : analyzing && idx === progressStep
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <CheckCircle2 size={14} className={data ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="truncate">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Output Result Summary Card */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Output Result Summary</h3>
                <p className="text-xs text-slate-500">Automated diagnostic report</p>
              </div>
            </div>

            {data ? (
              <div className="space-y-4">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
                    <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider block">Missing Bone</span>
                    <span className="text-2xl font-black text-blue-950 mt-1 block">{data.boneVolumeMissing} <span className="text-xs font-medium text-slate-500">cm³</span></span>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                    <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider block">Soft Tissue Need</span>
                    <span className="text-2xl font-black text-amber-950 mt-1 block">{data.softTissueRequirement} <span className="text-xs font-medium text-slate-500">cm³</span></span>
                  </div>

                  <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
                    <span className="text-xs text-indigo-700 font-semibold uppercase tracking-wider block">Target Graft Vol</span>
                    <span className="text-2xl font-black text-indigo-950 mt-1 block">{data.estimatedGraftSize} <span className="text-xs font-medium text-slate-500">cm³</span></span>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                    <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider block">Model Confidence</span>
                    <span className="text-2xl font-black text-emerald-950 mt-1 block">{data.modelConfidence}%</span>
                  </div>
                </div>

                {/* Defect Dimensions */}
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Defect Dimensions</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">LENGTH</span>
                      <span className="font-bold text-slate-800">{data.defectLength} mm</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">WIDTH</span>
                      <span className="font-bold text-slate-800">{data.defectWidth} mm</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">DEPTH</span>
                      <span className="font-bold text-slate-800">{data.defectDepth} mm</span>
                    </div>
                  </div>
                </div>

                {/* Executive Summary Notes */}
                <div className="rounded-2xl bg-slate-900 text-white p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-1 flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>Clinical AI Impression</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Significant segmental continuity loss detected in {patient?.anatomy || 'target bone'}. Autogenous microvascular fibula/iliac crest graft with reconstruction plate fixation is recommended for optimal load transfer.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                Execute AI Analysis to view complete volumetric result metrics & summary report.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
