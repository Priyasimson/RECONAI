import { useState } from 'react';
import { ActivitySquare } from 'lucide-react';
import { savePatientToSupabase } from '../lib/supabase';

interface OutcomePageProps {
  patient: any;
  onRefresh: () => Promise<void>;
}

export function OutcomePage({ patient, onRefresh }: OutcomePageProps) {
  const [form, setForm] = useState({
    followUpDate: '2026-12-01',
    boneHealing: 'Complete',
    graftIntegration: 'Full Integration',
    softTissueHealing: 'Good',
    alignment: 'Stable',
    complications: 'None',
    painScore: '0/10',
    functionalOutcome: 'Restored',
    notes: 'Case reconstruction completed successfully.',
    caseStatus: 'Completed'
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!patient) return;

    const updatedPatient = {
      ...patient,
      status: form.caseStatus,
      outcome: form
    };

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

    try {
      await fetch(`/api/patients/${patient.id}/outcome`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form)
      });
    } catch (e) {
      console.warn('Backend outcome endpoint warning:', e);
    }

    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><ActivitySquare size={20} /></div>
          <div>
            <h1 className="text-2xl font-semibold">Outcome Evaluation</h1>
            <p className="text-sm text-slate-500">Record follow-up outcomes and compare them with the predicted plan.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">Reconstruction Case Status
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold text-blue-600" value={form.caseStatus} onChange={(event) => setForm({ ...form, caseStatus: event.target.value })}>
              <option value="Completed">Completed (Mark Case Finished)</option>
              <option value="Active / In Progress">Active / In Progress</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">Follow-up date<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.followUpDate} onChange={(event) => setForm({ ...form, followUpDate: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-600">Bone healing<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.boneHealing} onChange={(event) => setForm({ ...form, boneHealing: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-600">Graft integration<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.graftIntegration} onChange={(event) => setForm({ ...form, graftIntegration: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-600">Soft tissue healing<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.softTissueHealing} onChange={(event) => setForm({ ...form, softTissueHealing: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-600">Alignment<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.alignment} onChange={(event) => setForm({ ...form, alignment: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-600">Complications<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.complications} onChange={(event) => setForm({ ...form, complications: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-600">Pain score<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.painScore} onChange={(event) => setForm({ ...form, painScore: event.target.value })} /></label>
          <label className="text-sm font-medium text-slate-600">Functional outcome<input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.functionalOutcome} onChange={(event) => setForm({ ...form, functionalOutcome: event.target.value })} /></label>
        </div>
        <label className="mt-4 block text-sm font-medium text-slate-600">Clinician notes<textarea className="mt-2 min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        <button type="submit" className="mt-6 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white">Save outcome</button>
      </form>
    </div>
  );
}
