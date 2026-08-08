import { useMemo, useState } from 'react';
import { FileImage, UploadCloud } from 'lucide-react';

interface ImagingUploadPageProps {
  patient: any;
  onRefresh: () => Promise<void>;
}

export function ImagingUploadPage({ patient, onRefresh }: ImagingUploadPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [scanType, setScanType] = useState('CT');
  const [status, setStatus] = useState('Ready');
  const [message, setMessage] = useState('Drop a DICOM study or mesh here');

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !patient) return;
    setStatus('Uploading');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scanType', scanType);
    formData.append('sliceThickness', '1.2 mm');
    formData.append('resolution', '512x512');
    formData.append('slices', '180');
    formData.append('source', 'PACS import');
    const response = await fetch(`/api/patients/${patient.id}/upload`, { method: 'POST', body: formData });
    const payload = await response.json();
    setStatus('Stored');
    setMessage(`Stored ${payload.imaging.fileName} for ${patient.caseId}`);
    await onRefresh();
  };

  const previewUrl = useMemo(() => (patient?.imaging?.path ? `http://localhost:4000${patient.imaging.path}` : ''), [patient]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><FileImage size={20} /></div>
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Upload Imaging</h1>
            <p className="text-sm text-slate-500">Associate a DICOM, CT, CBCT, MRI, STL, or OBJ study with the active case.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={handleUpload} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center sm:p-8">
            <UploadCloud className="mx-auto mb-3 text-blue-600" size={36} />
            <div className="text-lg font-semibold">Imaging source</div>
            <div className="mt-2 text-sm text-slate-500">{message}</div>
            <div className="mt-3 text-xs text-slate-400 sm:hidden">Tap to select files</div>
            <input type="file" className="mx-auto mt-4 block w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </div>
          <label className="mt-4 block text-sm font-medium text-slate-600">
            Scan type
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={scanType} onChange={(event) => setScanType(event.target.value)}>
              <option value="CT">CT</option>
              <option value="CBCT">CBCT</option>
              <option value="MRI">MRI</option>
              <option value="STL">STL</option>
            </select>
          </label>
          <button type="submit" className="mt-5 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white sm:w-auto">Upload and associate study</button>
        </form>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="text-sm font-semibold text-slate-700">Study metadata</div>
            {patient?.imaging ? (
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div><span className="font-semibold">File name:</span> {patient.imaging.fileName}</div>
                <div><span className="font-semibold">Scan type:</span> {patient.imaging.scanType}</div>
                <div><span className="font-semibold">Slice thickness:</span> {patient.imaging.sliceThickness}</div>
                <div><span className="font-semibold">Resolution:</span> {patient.imaging.resolution}</div>
                <div><span className="font-semibold">Slices:</span> {patient.imaging.slices}</div>
                <div><span className="font-semibold">Patient/case:</span> {patient.caseId}</div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-500">No imaging study associated yet.</div>
            )}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="text-sm font-semibold text-slate-700">Upload status</div>
            <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{status}</div>
            {previewUrl ? <img src={previewUrl} alt="Uploaded imaging" className="mt-4 h-48 w-full rounded-2xl object-cover" /> : <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">Preview will appear after upload.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
