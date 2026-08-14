export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'ADMIN' | 'SURGEON' | 'CLINICAL_STAFF';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  passwordHash?: string;
  role: 'ADMIN' | 'SURGEON' | 'CLINICAL_STAFF';
  specialization: string;
  hospital: string;
  department: string;
  medicalRegistrationNumber: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  createdBy: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  role: string;
  action: string;
  targetId?: string;
  details: string;
  status: string;
  timestamp: string;
  ipAddress?: string;
}

export interface ImagingStudy {
  fileName: string;
  storedName: string;
  path: string;
  scanType: string;
  sliceThickness: string;
  resolution: string;
  slices: number;
  uploadedAt: string;
  patientId: string;
  source: string;
}

export interface AnalysisData {
  summary: string;
  boneVolumeMissing: number; // in cm3
  softTissueRequirement: number; // in cm3
  estimatedGraftSize: number; // in cm3
  defectDepth: number; // in mm
  defectWidth: number; // in mm
  defectLength: number; // in mm
  modelConfidence: number; // in %
  steps: string[];
  processedAt?: string;
}

export interface ClassificationData {
  category: string;
  severity: 'Small' | 'Moderate' | 'Large' | 'Complex';
  continuityLoss: string;
  contamination: string;
  classificationReason: string;
  boneVolumeMissing: number;
  softTissueRequirement: number;
  defectDimensions: string;
}

export interface GraftOption {
  name: string;
  success: string;
  risk: string;
  highlight: string;
  advantages: string;
  disadvantages: string;
}

export interface GraftPlanData {
  selectedGraft: string;
  boneVolumeRequired: number;
  softTissueRequired: number;
  estimatedQuantity: number;
  healingPrediction: string;
  options: GraftOption[];
  classificationSeverity?: string;
}

export interface FixationData {
  selectedHardware: string;
  peakStress: number;
  loadCapacity: number;
  biomechanicalScore: number;
  stability: number;
  stressDistribution: string;
  recommendation: string;
}

export interface SimulationData {
  predictedAlignment: number;
  softTissueCoverage: number;
  functionalRecovery: number;
  notes: string;
  qualityScore: number;
  deviationMap: string;
}

export interface Patient {
  id: string;
  caseId: string;
  name: string;
  patientId: string;
  age: string;
  gender: string;
  contact: string;
  anatomy: string;
  indication: string;
  defectLocation: string;
  notes: string;
  documents: string[];
  imaging?: ImagingStudy | null;
  analysis?: AnalysisData | null;
  classification?: ClassificationData | null;
  graftPlan?: GraftPlanData | null;
  fixation?: FixationData | null;
  simulation?: SimulationData | null;
  report?: { content: string; createdAt?: string } | null;
  outcome?: Record<string, unknown> | null;
  workflowProgress: number;
  status: string;
  assignedDoctorId?: string;
  assignedDoctorEmail?: string;
  createdBy?: string;
  createdAt?: string;
}
