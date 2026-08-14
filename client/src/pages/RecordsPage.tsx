import { useState } from 'react';
import { Search, Trash2, AlertTriangle } from 'lucide-react';

interface RecordsPageProps {
  patients: any[];
  onDeletePatient?: (patientId: string) => Promise<void>;
}

export function RecordsPage({ patients, onDeletePatient }: RecordsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientForDelete, setSelectedPatientForDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.caseId && p.caseId.toLowerCase().includes(q)) ||
      (p.patientId && p.patientId.toLowerCase().includes(q)) ||
      (p.anatomy && p.anatomy.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q))
    );
  });

  const handleConfirmDelete = async () => {
    if (!selectedPatientForDelete || !onDeletePatient) return;
    try {
      setDeleting(true);
      await onDeletePatient(selectedPatientForDelete.id);
    } catch (e) {
      console.error('Delete patient error:', e);
    } finally {
      setDeleting(false);
      setSelectedPatientForDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Analysis Complete':
      case 'Classified':
      case 'Graft Planned':
      case 'Fixation Planned':
      case 'Simulation & Report Complete':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Imaging Uploaded':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><Search size={20} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Patient Records</h1>
            <p className="text-xs text-slate-500">Search cases, manage reconstruction records, and review surgical timelines.</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name or case ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Search className="mx-auto mb-2 text-slate-300" size={32} />
            <p className="text-sm font-semibold">No patient records found.</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or register a new patient.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition ${
                  patient.status === 'Closed' ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200 bg-white shadow-xs hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-bold text-slate-900 text-base">{patient.name}</div>
                      <div className="text-xs font-semibold text-blue-600">{patient.patientId ? `${patient.patientId} • ` : ''}{patient.caseId}</div>
                    </div>
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBadge(patient.status)}`}>
                      {patient.status}
                    </span>
                  </div>

                  <div className="space-y-1 my-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div><span className="font-semibold text-slate-500">Anatomy:</span> {patient.anatomy || 'Mandible'}</div>
                    <div><span className="font-semibold text-slate-500">Indication:</span> {patient.indication || 'Surgical Reconstruction'}</div>
                    <div><span className="font-semibold text-slate-500">Demographics:</span> Age {patient.age || 'N/A'}, {patient.gender || 'N/A'}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Workflow {patient.workflowProgress || 1}/7
                  </div>

                  {onDeletePatient && (
                    <button
                      onClick={() => setSelectedPatientForDelete(patient)}
                      className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition border border-rose-200"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedPatientForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="rounded-2xl bg-rose-100 p-3"><AlertTriangle size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Patient Record</h3>
                <p className="text-xs text-slate-500">{selectedPatientForDelete.name} ({selectedPatientForDelete.caseId})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this patient record?
              <br /><br />
              <strong className="text-rose-600">Warning:</strong> This will permanently delete this patient record and all associated imaging/AI data from the system dataset.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedPatientForDelete(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-2xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition disabled:opacity-50"
              >
                {deleting ? 'Deleting Record…' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
