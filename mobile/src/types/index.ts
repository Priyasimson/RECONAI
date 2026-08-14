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
  documents?: string[];
  imaging?: {
    fileName: string;
    scanType: string;
    sliceThickness: string;
    resolution: string;
    slices: number;
    uploadedAt: string;
    source?: string;
  } | null;
  analysis?: {
    summary: string;
    boneVolumeMissing: number;
    softTissueRequirement: number;
    estimatedGraftSize: number;
    defectDepth: number;
    defectWidth: number;
    defectLength: number;
    modelConfidence: number;
    steps?: string[];
  } | null;
  classification?: {
    category: string;
    severity: string;
    continuityLoss: string;
    contamination: string;
    classificationReason: string;
    boneVolumeMissing?: number;
    softTissueRequirement?: number;
    defectDimensions?: string;
  } | null;
  graftPlan?: {
    selectedGraft: string;
    boneVolumeRequired: number;
    softTissueRequired: number;
    estimatedQuantity: number;
    healingPrediction: string;
    options?: Array<{
      name: string;
      success: string;
      risk: string;
      highlight: string;
      advantages: string;
      disadvantages: string;
    }>;
  } | null;
  fixation?: {
    selectedHardware: string;
    peakStress: number;
    loadCapacity: number;
    biomechanicalScore: number;
    stability: number;
    stressDistribution: string;
    recommendation: string;
  } | null;
  simulation?: {
    predictedAlignment: number;
    softTissueCoverage: number;
    functionalRecovery: number;
    notes: string;
    qualityScore: number;
    deviationMap: string;
  } | null;
  report?: {
    content: string;
    generatedAt?: string;
  } | null;
  outcome?: {
    healingRating: string;
    complications: string;
    followUpWeeks: string;
    functionalScore: number;
    aestheticScore: number;
    surgeonNotes: string;
  } | null;
  workflowProgress: number;
  status: string;
  assignedDoctorId?: string;
  assignedDoctorEmail?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  passwordHash?: string;
  role: 'SURGEON' | 'ADMIN' | 'CLINICAL_STAFF';
  specialization?: string;
  hospital?: string;
  department?: string;
  medicalRegistrationNumber?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdBy?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface UserSession {
  id?: string;
  email: string;
  role?: string;
  name?: string;
  isDemo?: boolean;
}
