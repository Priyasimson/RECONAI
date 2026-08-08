import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

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

const patients = [];
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

app.post('/api/patients/:id/upload', upload.single('file'), (req, res) => {
  const patient = patients.find((entry) => entry.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

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
  res.json({ patient, imaging });
});

app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.sendFile(filePath);
});

app.post('/api/patients/:id/analysis', (req, res) => {
  const patient = patients.find((entry) => entry.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

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
  const patient = patients.find((entry) => entry.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

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
    defectDimensions: `${analysis.defectLength} mm x ${analysis.defectWidth} mm x ${analysis.defectDepth} mm`
  };
  patient.classification = classification;
  patient.workflowProgress = 4;
  patient.status = 'Classified';
  res.json({ patient, classification });
});

app.post('/api/patients/:id/graft-plan', (req, res) => {
  const patient = patients.find((entry) => entry.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

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
  patient.workflowProgress = 5;
  patient.status = 'Graft Planned';
  res.json({ patient, graftPlan });
});

app.post('/api/patients/:id/fixation', (req, res) => {
  const patient = patients.find((entry) => entry.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

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
  patient.workflowProgress = 6;
  patient.status = 'Fixation Planned';
  res.json({ patient, fixation });
});

app.post('/api/patients/:id/simulation', (req, res) => {
  const patient = patients.find((entry) => entry.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const simulation = {
    predictedAlignment: 98.4,
    softTissueCoverage: 96.1,
    functionalRecovery: 91,
    notes: 'Demo reconstruction simulation based on shared workflow values.',
    qualityScore: 95,
    deviationMap: 'Low deviation across the reconstructed surface.'
  };
  patient.simulation = simulation;
  patient.workflowProgress = 7;
  patient.status = 'Simulation Complete';
  res.json({ patient, simulation });
});

app.post('/api/patients/:id/report', (req, res) => {
  const patient = patients.find((entry) => entry.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  const report = {
    content: `Patient ${patient.name}\nCase ID ${patient.caseId}\nAnatomy ${patient.anatomy}\nSeverity ${patient.classification?.severity || 'Moderate'}\nSelected graft ${patient.graftPlan?.selectedGraft || 'Autogenous'}\nHardware ${patient.fixation?.selectedHardware || 'Reconstruction Plate'}`
  };
  patient.report = report;
  res.json({ patient, report });
});

app.post('/api/patients/:id/outcome', (req, res) => {
  const patient = patients.find((entry) => entry.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  patient.outcome = req.body;
  res.json({ patient, outcome: patient.outcome });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
