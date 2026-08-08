import { useState } from 'react';
import { ArrowRight, FilePlus2, UserPlus } from 'lucide-react';

interface PatientRegistrationPageProps {
  onCreate: (payload: Record<string, string>) => Promise<any>;
}

export function PatientRegistrationPage({ onCreate }: PatientRegistrationPageProps) {
  const [form, setForm] = useState({
    name: 'Amina Rahman',
    patientId: 'PID-1001',
    age: '34',
    gender: 'Female',
    contact: 'amina@example.com',
    anatomy: 'Mandible',
    indication: 'Segmental defect reconstruction',
    defectLocation: 'Left body/angle',
    notes: 'Post-trauma defect with moderate bone loss.'
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onCreate(form);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><UserPlus size={20} /></div>
          <div>
            <h1 className="text-2xl font-semibold">New Patient Registration</h1>
            <p className="text-sm text-slate-500">Create a new case and start the reconstruction workflow.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-600">
              Patient name
              <input required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Patient ID / Case ID
              <input required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Age
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Gender
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Contact information
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Anatomical region
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.anatomy} onChange={(event) => setForm({ ...form, anatomy: event.target.value })} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Surgical indication
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.indication} onChange={(event) => setForm({ ...form, indication: event.target.value })} />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Defect location
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.defectLocation} onChange={(event) => setForm({ ...form, defectLocation: event.target.value })} />
            </label>
          </div>
          <label className="mt-4 block text-sm font-medium text-slate-600">
            Clinical notes
            <textarea className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-3 py-2" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><FilePlus2 size={16} /> Supporting documents</div>
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              Upload consent forms or prior records. These are stored with the case.
            </div>
          </div>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
            Create Patient <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
