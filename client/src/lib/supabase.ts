import { createClient } from '@supabase/supabase-js';

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function savePatientRecord(patient: Record<string, unknown>) {
  if (!supabase) return { ok: false, reason: 'Supabase not configured' };
  const { error } = await supabase.from('patients').insert({
    patient_id: patient.patientId,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    anatomy: patient.anatomy,
    indication: patient.indication,
    defect_location: patient.defectLocation,
    notes: patient.notes,
    case_id: patient.caseId,
    status: patient.status || 'Registered'
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
