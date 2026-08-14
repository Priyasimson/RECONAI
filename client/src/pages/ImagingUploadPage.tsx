import { useState, useRef, useEffect, useMemo } from 'react';
import { FileImage, UploadCloud, Sliders, Eye, Ruler, ShieldCheck } from 'lucide-react';
import { savePatientToSupabase } from '../lib/supabase';

interface ImagingUploadPageProps {
  patient: any;
  patients?: any[];
  onSelectPatient?: (patientId: string) => void;
  onRefresh: () => Promise<void>;
}

export function ImagingUploadPage({ patient, patients = [], onSelectPatient, onRefresh }: ImagingUploadPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [scanType, setScanType] = useState('CT');
  const [sliceThickness, setSliceThickness] = useState('1.2 mm');
  const [resolution, setResolution] = useState('512x512');
  const [slices, setSlices] = useState('180');
  const [status, setStatus] = useState('Ready for Upload');
  const [message, setMessage] = useState('Select or drop a medical DICOM/CT/MRI image scan below');
  const [isUploading, setIsUploading] = useState(false);

  // Canvas processing states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [threshold, setThreshold] = useState(128);
  const [edgeFilter, setEdgeFilter] = useState(false);
  const [heatmapFilter, setHeatmapFilter] = useState(false);
  const [measuredMm, setMeasuredMm] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMeasuringRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const endPosRef = useRef<{ x: number; y: number } | null>(null);

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (patient?.imaging?.path) return `http://localhost:4000${patient.imaging.path}`;
    return '';
  }, [file, patient]);

  // Redraw canvas with filter effects
  useEffect(() => {
    if (!previewUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = previewUrl;
    img.onload = () => {
      canvas.width = img.width || 600;
      canvas.height = img.height || 400;

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply threshold / edge detection / heatmap filters
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

        if (edgeFilter) {
          // Highlight high density bone borders
          const isEdge = avg > threshold && avg < threshold + 40;
          data[i] = isEdge ? 0 : data[i];
          data[i + 1] = isEdge ? 255 : data[i + 1];
          data[i + 2] = isEdge ? 255 : data[i + 2];
        } else if (heatmapFilter) {
          // Heatmap overlay for bone density / defect areas
          if (avg > 180) {
            // Dense cortical bone -> Red/Orange
            data[i] = 239;
            data[i + 1] = 68;
            data[i + 2] = 68;
          } else if (avg > 100) {
            // Cancellous bone -> Yellow/Green
            data[i] = 234;
            data[i + 1] = 179;
            data[i + 2] = 8;
          } else if (avg < 50) {
            // Defect / Air cavity -> Dark Blue
            data[i] = 30;
            data[i + 1] = 58;
            data[i + 2] = 138;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Draw ruler measurement line if user dragged
      if (startPosRef.current && endPosRef.current) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startPosRef.current.x, startPosRef.current.y);
        ctx.lineTo(endPosRef.current.x, endPosRef.current.y);
        ctx.stroke();

        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 14px sans-serif';
        const midX = (startPosRef.current.x + endPosRef.current.x) / 2;
        const midY = (startPosRef.current.y + endPosRef.current.y) / 2;
        const distPx = Math.hypot(endPosRef.current.x - startPosRef.current.x, endPosRef.current.y - startPosRef.current.y);
        const mm = Math.round(distPx * 0.15 * 10) / 10;
        ctx.fillText(`${mm} mm`, midX + 8, midY - 8);
      }
    };
  }, [previewUrl, brightness, contrast, threshold, edgeFilter, heatmapFilter]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    startPosRef.current = { x, y };
    endPosRef.current = { x, y };
    isMeasuringRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMeasuringRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    endPosRef.current = { x, y };

    if (startPosRef.current) {
      const distPx = Math.hypot(x - startPosRef.current.x, y - startPosRef.current.y);
      setMeasuredMm(Math.round(distPx * 0.15 * 10) / 10);
    }
  };

  const handleMouseUp = () => {
    isMeasuringRef.current = false;
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!patient) {
      setStatus('No patient selected. Please register or select a patient first.');
      setMessage('Please create or select a patient before uploading imaging.');
      return;
    }

    if (!file) {
      setStatus('No file selected.');
      setMessage('Please select a valid DICOM, CT, CBCT, MRI, or 3D mesh file.');
      return;
    }

    // File validation
    const validExtensions = ['.dcm', '.ct', '.cbct', '.mri', '.stl', '.obj', '.png', '.jpg', '.jpeg', '.webp'];
    const fileNameLower = file.name.toLowerCase();
    const isImageOrMedical = file.type.startsWith('image/') || validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!isImageOrMedical) {
      setStatus('Unsupported file type.');
      setMessage('Unsupported file type. Please select a supported medical imaging file (DICOM, CT, MRI, PNG, JPEG, STL).');
      return;
    }

    setIsUploading(true);
    setStatus('Uploading file and syncing to cloud database…');
    setMessage(`Uploading ${file.name} for Case ID ${patient.caseId}…`);

    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      const imagingData = {
        fileName: file.name,
        storedName: file.name,
        path: `/data/${file.name}`,
        previewUrl: dataUrl || previewUrl,
        scanType,
        sliceThickness,
        resolution,
        slices: Number(slices) || 180,
        uploadedAt: new Date().toISOString(),
        patientId: patient.id,
        source: 'PACS import'
      };

      const updatedPatient = {
        ...patient,
        createdBy: patient.createdBy || 'SURGEON',
        workflowProgress: Math.max(patient.workflowProgress || 1, 2),
        status: 'Imaging Uploaded',
        imaging: imagingData
      };

      const savedSession = localStorage.getItem('RECONAI_USER_SESSION');
      const userSession = savedSession ? JSON.parse(savedSession) : null;

      // 1. Sync directly to Supabase Database
      await savePatientToSupabase(updatedPatient, updatedPatient.createdBy, updatedPatient.assignedDoctorId);

      // 2. Upload to Express backend with Auth Headers
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('scanType', scanType);
        formData.append('sliceThickness', sliceThickness);
        formData.append('resolution', resolution);
        formData.append('slices', slices);
        formData.append('source', 'PACS import');

        const headers: Record<string, string> = userSession ? {
          'X-User-Id': userSession.id || '',
          'X-User-Email': userSession.email || '',
          'X-User-Role': userSession.role || 'SURGEON'
        } : {};

        const response = await fetch(`/api/patients/${patient.id}/upload`, {
          method: 'POST',
          headers,
          body: formData
        });

        if (response.status === 403) {
          setStatus('403 Forbidden: Access Denied');
          setMessage('You are not authorized to upload imaging for another doctor\'s patient.');
          setIsUploading(false);
          return;
        }
      } catch (backendErr) {
        console.warn('Backend upload notice:', backendErr);
      }

      setStatus('Study uploaded & registered successfully!');
      setMessage(`Stored study (${scanType}) for Patient ${patient.name} (${patient.caseId})`);
      await onRefresh();
    } catch (err: any) {
      console.error('Upload error:', err);
      setStatus('Upload failed. Please try again.');
      setMessage(err.message || 'Unable to upload the study. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasSelectedImage = Boolean(file || patient?.imaging);

  const handleRemoveImage = async () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (patient) {
      const resetPatient = {
        ...patient,
        imaging: null,
        analysis: null,
        classification: null,
        graftPlan: null,
        fixation: null,
        simulation: null,
        report: null
      };
      await savePatientToSupabase(resetPatient, patient.createdBy);
      await onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white">
            <FileImage size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Upload & Process Imaging Study</h1>
            <p className="text-xs text-slate-500">Associate DICOM, CT, CBCT, MRI, or STL scans with real-time interactive canvas filters.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasSelectedImage && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3.5 py-2 rounded-2xl text-xs transition border border-rose-200"
            >
              <span>Clear Current Image</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Upload Form */}
        <form onSubmit={handleUpload} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Patient Case
            </label>
            <select
              value={patient?.id || ''}
              onChange={(e) => onSelectPatient && onSelectPatient(e.target.value)}
              className="w-full rounded-2xl border border-blue-200 bg-blue-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="">-- Select a Patient Case --</option>
              {(patients || []).filter((p: any) => p.status !== 'Closed').map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.caseId}
                </option>
              ))}
            </select>
            {!patient && (
              <p className="mt-1 text-xs font-semibold text-amber-600">
                Please select a patient case before uploading the study.
              </p>
            )}
          </div>

          {/* Hidden File Input for File Selection & Replacement */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.dcm,.stl,.obj"
            className="hidden"
            onChange={(event) => {
              const selected = event.target.files?.[0] || null;
              if (selected) {
                setFile(selected);
                setStatus('Ready for Upload & Sync');
                setMessage(`Selected file: ${selected.name}`);
              }
            }}
          />

          {!hasSelectedImage ? (
            /* EMPTY UPLOAD DROPZONE STATE */
            <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50 p-6 text-center transition">
              <UploadCloud className="mx-auto mb-3 text-blue-600" size={40} />
              <div className="text-base font-semibold text-slate-800">Select DICOM or Image File</div>
              <div className="mt-1 text-xs text-slate-500">{message}</div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Choose File
              </button>
            </div>
          ) : (
            /* SELECTED MEDICAL IMAGE CARD STATE */
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                  <FileImage size={16} className="text-blue-600" />
                  <span>Selected Medical Image Study</span>
                </div>
                <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                  patient?.imaging ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {patient?.imaging ? 'Study Synced ✓' : 'Ready for Sync'}
                </span>
              </div>

              <div className="flex items-start gap-4">
                {previewUrl ? (
                  <img src={previewUrl} alt="Selected scan preview" className="w-20 h-20 rounded-xl object-contain bg-slate-900 border border-slate-700 shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <FileImage size={24} />
                  </div>
                )}

                <div className="space-y-1 text-xs text-slate-700 flex-1">
                  <div className="font-bold text-slate-900 text-sm truncate">{file?.name || patient?.imaging?.fileName || 'Scan Dataset'}</div>
                  <div className="text-slate-500 font-medium">{scanType} Scan • {resolution}</div>
                  <div className="text-slate-500">Thickness: {sliceThickness} • Slices: {slices}</div>
                  {file && <div className="text-slate-400 text-[11px]">File Size: {(file.size / 1024).toFixed(1)} KB</div>}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-blue-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 bg-white hover:bg-slate-50 text-blue-700 font-semibold px-3 py-1.5 rounded-xl text-xs border border-blue-200 shadow-2xs transition"
                >
                  <UploadCloud size={13} />
                  <span>Replace Image</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1 bg-white hover:bg-rose-50 text-rose-600 font-semibold px-3 py-1.5 rounded-xl text-xs border border-rose-200 transition"
                >
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Scan Modality
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
              >
                <option value="CT">CT Scan (Computed Tomography)</option>
                <option value="CBCT">CBCT (Cone Beam CT)</option>
                <option value="MRI">MRI (Magnetic Resonance)</option>
                <option value="STL">3D Mesh STL / OBJ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Slice Thickness
              </label>
              <input
                type="text"
                value={sliceThickness}
                onChange={(e) => setSliceThickness(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Matrix Resolution
              </label>
              <input
                type="text"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Total Slices
              </label>
              <input
                type="number"
                value={slices}
                onChange={(e) => setSlices(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading || !patient || !hasSelectedImage}
            className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Syncing Study…' : patient?.imaging ? 'Study Synced ✓' : 'Upload & Sync Study'}
          </button>

          <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-600 shrink-0" />
            <span>Status: {status}</span>
          </div>
        </form>

        {/* Interactive Canvas Processing & Measurement Viewer */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Interactive Canvas Processing & Measurement</h3>
              </div>
              {measuredMm !== null && (
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold text-blue-700">
                  <Ruler size={13} />
                  <span>Measured: {measuredMm} mm</span>
                </div>
              )}
            </div>

            {/* Canvas view */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 min-h-[260px] flex items-center justify-center">
              {previewUrl ? (
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="max-w-full h-auto cursor-crosshair object-contain"
                />
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <Eye size={36} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No scan uploaded yet. Upload a file to activate interactive processing.</p>
                </div>
              )}
            </div>

            {/* Filter controls */}
            {previewUrl && (
              <div className="mt-4 space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Brightness ({brightness}%)</span>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Contrast ({contrast}%)</span>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Bone Threshold ({threshold})</span>
                    <input
                      type="range"
                      min="50"
                      max="220"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEdgeFilter(!edgeFilter)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition ${edgeFilter ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    Cortical Edge Detection
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeatmapFilter(!heatmapFilter)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition ${heatmapFilter ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    Density Heatmap
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                      setThreshold(128);
                      setEdgeFilter(false);
                      setHeatmapFilter(false);
                      setMeasuredMm(null);
                      startPosRef.current = null;
                      endPosRef.current = null;
                    }}
                    className="px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 ml-auto"
                  >
                    Reset View
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
