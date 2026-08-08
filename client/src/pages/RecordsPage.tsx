import { Search } from 'lucide-react';

interface RecordsPageProps {
  patients: any[];
}

export function RecordsPage({ patients }: RecordsPageProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><Search size={20} /></div>
          <div>
            <h1 className="text-2xl font-semibold">Patient Records</h1>
            <p className="text-sm text-slate-500">Search cases and review the full reconstruction timeline.</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {patients.map((patient) => (
            <div key={patient.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="font-semibold text-slate-800">{patient.name}</div>
              <div className="mt-1 text-sm text-slate-500">{patient.caseId}</div>
              <div className="mt-3 text-sm text-slate-600">Anatomy: {patient.anatomy || 'Not recorded'}</div>
              <div className="text-sm text-slate-600">Status: {patient.status}</div>
              <div className="mt-3 text-xs uppercase tracking-wide text-slate-400">Workflow progress {patient.workflowProgress}/7</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
