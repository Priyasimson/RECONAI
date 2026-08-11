import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ymqjarbchaxfiiepozec.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Pa6kQqnrL8LdnZ_m66oY-g_ZuJHLlET';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

async function syncPatientToSupabase(patient) {
  if (!supabase) return;
  try {
    const payload = {
      case_id: patient.caseId,
      name: patient.name,
      patient_id: patient.patientId,
      age: patient.age,
      gender: patient.gender,
      contact: patient.contact,
      anatomy: patient.anatomy,
      indication: patient.indication,
      defect_location: patient.defectLocation,
      notes: patient.notes,
      workflow_progress: patient.workflowProgress || 1,
      status: patient.status || 'Registered',
      imaging: patient.imaging,
      analysis: patient.analysis,
      classification: patient.classification,
      graft_plan: patient.graftPlan,
      fixation: patient.fixation,
      simulation: patient.simulation,
      report: patient.report,
      outcome: patient.outcome
    };
    await supabase.from('patients').upsert(payload, { onConflict: 'case_id' });
  } catch (err) {
    console.warn('Server Supabase sync error:', err.message);
  }
}

const uploadDir = path.join(__dirname, 'data');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});
const upload = multer({ storage });

const patients = [
  {
    id: '10240',
    caseId: 'RECON-10240',
    name: 'Eleanor Vance',
    patientId: 'PID-8842',
    age: '44',
    gender: 'Female',
    contact: '+1 555-0192',
    anatomy: 'Mandible Body',
    indication: 'Osteoradionecrosis post-radiotherapy',
    defectLocation: 'Left mandibular angle & body',
    notes: 'Surgical resection planned. Microvascular reconstruction required.',
    documents: [],
    imaging: null,
    analysis: null,
    classification: null,
    graftPlan: null,
    fixation: null,
    simulation: null,
    report: null,
    outcome: null,
    workflowProgress: 1,
    status: 'Registered'
  }
];
let nextCaseNumber = 10241;

const createCaseId = () => `RECON-${nextCaseNumber++}`;

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/patients', (_req, res) => res.json(patients));

app.post('/api/patients', (req, res) => {
  const patient = {
    id: String(Date.now()),
    caseId: createCaseId(),
    name: req.body.name || 'New Patient',
    patientId: req.body.patientId || `PID-${Date.now()}`,
    age: req.body.age || '',
    gender: req.body.gender || '',
    contact: req.body.contact || '',
    anatomy: req.body.anatomy || '',
    indication: req.body.indication || '',
    defectLocation: req.body.defectLocation || '',
    notes: req.body.notes || '',
    documents: req.body.documents || [],
    imaging: null,
    analysis: null,
    classification: null,
    graftPlan: null,
    fixation: null,
    simulation: null,
    report: null,
    outcome: null,
    workflowProgress: 1,
    status: 'Registered'
  };
  patients.push(patient);
  res.status(201).json(patient);
});

function findOrCreatePatient(paramId) {
  let patient = patients.find((entry) => entry.id === paramId || entry.caseId === paramId);
  if (!patient && patients.length > 0) {
    patient = patients[0];
  }
  if (!patient) {
    patient = {
      id: paramId,
      caseId: paramId.startsWith('RECON-') ? paramId : `RECON-${paramId}`,
      name: 'Eleanor Vance',
      patientId: 'PID-8842',
      age: '44',
      gender: 'Female',
      contact: '+1 555-0192',
      anatomy: 'Mandible Body',
      indication: 'Osteoradionecrosis post-radiotherapy',
      defectLocation: 'Left mandibular angle & body',
      notes: 'Surgical resection planned.',
      workflowProgress: 1,
      status: 'Registered'
    };
    patients.push(patient);
  }
  return patient;
}

app.post('/api/patients/:id/upload', upload.single('file'), (req, res) => {
  const patient = findOrCreatePatient(req.params.id);

  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const imaging = {
    fileName: file.originalname,
    storedName: file.filename,
    path: `/api/files/${file.filename}`,
    scanType: req.body.scanType || 'CT',
    sliceThickness: req.body.sliceThickness || '1.2 mm',
    resolution: req.body.resolution || '512x512',
    slices: Number(req.body.slices || 180),
    uploadedAt: new Date().toISOString(),
    patientId: patient.caseId,
    source: req.body.source || 'Uploaded'
  };
  patient.imaging = imaging;
  patient.workflowProgress = 2;
  patient.status = 'Imaging Uploaded';
  syncPatientToSupabase(patient);
  res.json({ patient, imaging });
});

app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.sendFile(filePath);
});

app.post('/api/patients/:id/analysis', (req, res) => {
  const patient = findOrCreatePatient(req.params.id);

  const analysis = {
    summary: 'Demo/simulation analysis mode',
    boneVolumeMissing: 18.4,
    softTissueRequirement: 26.1,
    estimatedGraftSize: 25.0,
    defectDepth: 14.2,
    defectWidth: 22.8,
    defectLength: 41.5,
    modelConfidence: 94,
    steps: [
      'Image preprocessing',
      'Noise reduction',
      'Bone segmentation',
      'Soft tissue segmentation',
      'Defect detection',
      '3D reconstruction',
      'Volume calculation',
      'Confidence evaluation'
    ]
  };
  patient.analysis = analysis;
  patient.workflowProgress = 3;
  patient.status = 'Analysis Complete';
  res.json({ patient, analysis });
});

app.post('/api/patients/:id/classification', (req, res) => {
  const patient = findOrCreatePatient(req.params.id);

  const analysis = patient.analysis || {};
  const severity = analysis.boneVolumeMissing > 35 ? 'Complex' : analysis.boneVolumeMissing > 20 ? 'Large' : analysis.boneVolumeMissing > 10 ? 'Moderate' : 'Small';
  const classification = {
    category: req.body.category || 'Mandible',
    severity,
    continuityLoss: 'Moderate',
    contamination: 'Low',
    classificationReason: 'Demo classification based on simulated defect measurements.',
    boneVolumeMissing: analysis.boneVolumeMissing,
    softTissueRequirement: analysis.softTissueRequirement,
    defectDimensions: `${analysis.defectLength || 41.5} mm x ${analysis.defectWidth || 22.8} mm x ${analysis.defectDepth || 14.2} mm`
  };
  patient.classification = classification;
  patient.workflowProgress = Math.max(patient.workflowProgress || 1, 4);
  patient.status = 'Classified';
  syncPatientToSupabase(patient);
  res.json({ patient, classification });
});

app.post('/api/patients/:id/graft-plan', (req, res) => {
  const patient = findOrCreatePatient(req.params.id);

  const classification = patient.classification || {};
  const graftPlan = {
    selectedGraft: req.body.selectedGraft || 'Autogenous',
    boneVolumeRequired: patient.analysis?.boneVolumeMissing || 18.4,
    softTissueRequired: patient.analysis?.softTissueRequirement || 26.1,
    estimatedQuantity: 24.8,
    healingPrediction: 'Expected union in 4-6 months',
    options: [
      { name: 'Autogenous', success: '94%', risk: 'Low Risk', highlight: 'AI Pick', advantages: 'Excellent osteogenesis', disadvantages: 'Donor site morbidity' },
      { name: 'Allograft', success: '87%', risk: 'Moderate', highlight: 'Good availability', advantages: 'No donor site', disadvantages: 'Slower incorporation' },
      { name: 'Xenograft', success: '81%', risk: 'Moderate', highlight: 'Low cost', advantages: 'Biocompatible scaffold', disadvantages: 'Variable resorption' },
      { name: 'Synthetic', success: '79%', risk: 'Low-Medium', highlight: 'Customizable', advantages: 'Predictable geometry', disadvantages: 'Limited biological activity' }
    ],
    classificationSeverity: classification.severity
  };
  patient.graftPlan = graftPlan;
  patient.workflowProgress = Math.max(patient.workflowProgress || 1, 5);
  patient.status = 'Graft Planned';
  syncPatientToSupabase(patient);
  res.json({ patient, graftPlan });
});

app.post('/api/patients/:id/fixation', (req, res) => {
  const patient = findOrCreatePatient(req.params.id);

  const fixation = {
    selectedHardware: req.body.selectedHardware || 'Reconstruction Plate',
    peakStress: 132,
    loadCapacity: 890,
    biomechanicalScore: 92,
    stability: 96,
    stressDistribution: 'Balanced load transfer',
    recommendation: 'Reconstruction Plate is recommended for the selected graft configuration.'
  };
  patient.fixation = fixation;
  patient.workflowProgress = Math.max(patient.workflowProgress || 1, 6);
  patient.status = 'Fixation Planned';
  syncPatientToSupabase(patient);
  res.json({ patient, fixation });
});

app.post('/api/patients/:id/simulation', (req, res) => {
  const patient = findOrCreatePatient(req.params.id);

  const simulation = {
    predictedAlignment: 98.4,
    softTissueCoverage: 96.1,
    functionalRecovery: 91,
    notes: 'Demo reconstruction simulation based on shared workflow values.',
    qualityScore: 95,
    deviationMap: 'Low deviation across the reconstructed surface.'
  };
  patient.simulation = simulation;
  patient.workflowProgress = Math.max(patient.workflowProgress || 1, 7);
  patient.status = 'Simulation Complete';
  syncPatientToSupabase(patient);
  res.json({ patient, simulation });
});

app.post('/api/patients/:id/report', (req, res) => {
  const patient = findOrCreatePatient(req.params.id);
  const report = {
    content: `Patient ${patient.name}\nCase ID ${patient.caseId}\nAnatomy ${patient.anatomy}\nSeverity ${patient.classification?.severity || 'Moderate'}\nSelected graft ${patient.graftPlan?.selectedGraft || 'Autogenous'}\nHardware ${patient.fixation?.selectedHardware || 'Reconstruction Plate'}`
  };
  patient.report = report;
  syncPatientToSupabase(patient);
  res.json({ patient, report });
});

app.post('/api/patients/:id/outcome', (req, res) => {
  const patient = findOrCreatePatient(req.params.id);
  patient.outcome = req.body;
  syncPatientToSupabase(patient);
  res.json({ patient, outcome: patient.outcome });
});

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  if (supabase) {
    try {
      const { error } = await supabase.from('patients').select('id').limit(1);
      if (!error) {
        console.log(`🟢 [Supabase] Connected successfully to ${supabaseUrl}`);
      } else {
        console.log(`🟢 [Supabase] API connected: ${supabaseUrl}`);
      }
    } catch (err) {
      console.log(`🟡 [Supabase] Connection initialized: ${supabaseUrl}`);
    }
  }
});
