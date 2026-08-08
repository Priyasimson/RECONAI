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
  imaging: any;
  analysis: any;
  classification: any;
  graftPlan: any;
  fixation: any;
  simulation: any;
  report: any;
  outcome: any;
  workflowProgress: number;
  status: string;
}
