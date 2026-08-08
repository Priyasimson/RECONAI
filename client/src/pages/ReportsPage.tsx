import { FileText } from 'lucide-react';

interface ReportsPageProps {
  patient: any;
  onRefresh: () => Promise<void>;
}

export function ReportsPage({ patient, onRefresh }: ReportsPageProps) {
  const generate = async () => {
    const response = await fetch(`/api/patients/${patient.id}/report`, { method: 'POST' });
    await response.json();
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><FileText size={20} /></div>
          <div>
            <h1 className="text-2xl font-semibold">Reports</h1>
            <p className="text-sm text-slate-500">Compile the full workflow into a case report.</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Generated report</div>
          <button onClick={generate} className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white">Generate report</button>
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 whitespace-pre-line">
          {patient?.report?.content || 'Generate a report to combine patient, imaging, analysis, classification, graft planning, fixation, and simulation outputs.'}
        </div>
      </div>
    </div>
  );
}
