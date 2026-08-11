import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Patient, UserProfile } from '../types';

let currentUrl = 'https://ymqjarbchaxfiiepozec.supabase.co';
let currentKey = 'sb_publishable_Pa6kQqnrL8LdnZ_m66oY-g_ZuJHLlET';

export function getSupabaseConfig() {
  return { url: currentUrl, key: currentKey };
}

export function updateSupabaseConfig(url: string, key: string) {
  if (url) currentUrl = url.trim();
  if (key) currentKey = key.trim();
  supabaseInstance = null; // reset instance so client picks up new config
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseInstance && currentUrl && currentKey) {
    try {
      supabaseInstance = createClient(currentUrl, currentKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      });
    } catch (e) {
      console.warn('Failed to init Supabase client on mobile:', e);
    }
  }
  return supabaseInstance;
}

// Default Pre-provisioned Profiles Registry
const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'p-admin-01',
    fullName: 'System Chief Overseer',
    email: 'admin@reconai.com',
    passwordHash: 'Admin2026!',
    role: 'ADMIN',
    specialization: 'Hospital Systems Administration',
    hospital: 'St. Jude Surgical Medical Center',
    department: 'Surgical Administration',
    medicalRegistrationNumber: 'HOSP-ADM-01',
    phone: '+1 555-0100',
    status: 'ACTIVE',
    createdBy: 'SYSTEM',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p-surg-01',
    fullName: 'Dr. Eleanor Vance',
    email: 'dr.vance@reconai.com',
    passwordHash: 'Surgeon2026!',
    role: 'SURGEON',
    specialization: 'Maxillofacial Surgery',
    hospital: 'St. Jude Surgical Medical Center',
    department: 'Oral & Maxillofacial',
    medicalRegistrationNumber: 'MED-REG-8842',
    phone: '+1 555-0192',
    status: 'ACTIVE',
    createdBy: 'admin@reconai.com',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p-surg-02',
    fullName: 'Dr. Arthur Smith',
    email: 'dr.smith@reconai.com',
    passwordHash: 'Surgeon2026!',
    role: 'SURGEON',
    specialization: 'Oral Reconstruction',
    hospital: 'St. Jude Surgical Medical Center',
    department: 'Craniofacial Surgery',
    medicalRegistrationNumber: 'MED-REG-4102',
    phone: '+1 555-0193',
    status: 'ACTIVE',
    createdBy: 'admin@reconai.com',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p-surg-03',
    fullName: 'Dr. Rajesh Patel',
    email: 'dr.patel@reconai.com',
    passwordHash: 'Surgeon2026!',
    role: 'SURGEON',
    specialization: 'Head & Neck Oncology',
    hospital: 'St. Jude Surgical Medical Center',
    department: 'Surgical Oncology',
    medicalRegistrationNumber: 'MED-REG-9031',
    phone: '+1 555-0194',
    status: 'ACTIVE',
    createdBy: 'admin@reconai.com',
    createdAt: new Date().toISOString()
  }
];

// Supabase Authentication Operations
export async function signUpUser(email: string, pass: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not initialized');
  const { data, error } = await client.auth.signUp({
    email: email.trim().toLowerCase(),
    password: pass
  });
  return { data, error };
}

export async function signInUser(email: string, pass: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not initialized');
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: pass
  });
  return { data, error };
}

export async function signOutUser() {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  }
}

// Profile Management Functions
export async function fetchProfilesFromSupabase(): Promise<UserProfile[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          fullName: row.full_name || row.fullname || row.name || row.email,
          email: row.email,
          passwordHash: row.password_hash || row.password,
          role: (row.role || 'SURGEON').toUpperCase(),
          specialization: row.specialization || 'Maxillofacial Surgery',
          hospital: row.hospital || 'St. Jude Surgical Medical Center',
          department: row.department || 'Oral & Maxillofacial',
          medicalRegistrationNumber: row.medical_registration_number || 'MED-REG-0000',
          phone: row.phone || '+1 555-0000',
          status: (row.status || 'ACTIVE').toUpperCase(),
          createdBy: row.created_by || 'SYSTEM',
          createdAt: row.created_at,
          lastLogin: row.last_login
        }));
      }
    } catch (e) {
      console.warn('Mobile Supabase profiles fetch exception:', e);
    }
  }

  return DEFAULT_PROFILES;
}

export async function fetchProfileByUserId(userId: string): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (client && userId) {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name || data.fullname || data.name || data.email,
          email: data.email,
          passwordHash: data.password_hash || data.password,
          role: (data.role || 'SURGEON').toUpperCase() as any,
          specialization: data.specialization || 'Maxillofacial Surgery',
          hospital: data.hospital || 'St. Jude Surgical Medical Center',
          department: data.department || 'Oral & Maxillofacial',
          medicalRegistrationNumber: data.medical_registration_number || 'MED-REG-0000',
          phone: data.phone || '+1 555-0000',
          status: (data.status || 'ACTIVE').toUpperCase() as any,
          createdBy: data.created_by || 'SYSTEM',
          createdAt: data.created_at,
          lastLogin: data.last_login
        };
      }
    } catch (e) {
      console.warn('Fetch profile by userId exception:', e);
    }
  }

  const profiles = await fetchProfilesFromSupabase();
  return profiles.find((p) => p.id === userId) || null;
}

export async function fetchProfileByEmail(email: string): Promise<UserProfile | null> {
  const cleanEmail = email.trim().toLowerCase();
  const client = getSupabaseClient();
  if (client && cleanEmail) {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name || data.fullname || data.name || data.email,
          email: data.email,
          passwordHash: data.password_hash || data.password,
          role: (data.role || 'SURGEON').toUpperCase() as any,
          specialization: data.specialization || 'Maxillofacial Surgery',
          hospital: data.hospital || 'St. Jude Surgical Medical Center',
          department: data.department || 'Oral & Maxillofacial',
          medicalRegistrationNumber: data.medical_registration_number || 'MED-REG-0000',
          phone: data.phone || '+1 555-0000',
          status: (data.status || 'ACTIVE').toUpperCase() as any,
          createdBy: data.created_by || 'SYSTEM',
          createdAt: data.created_at,
          lastLogin: data.last_login
        };
      }
    } catch (e) {
      console.warn('Fetch profile by email exception:', e);
    }
  }

  const profiles = await fetchProfilesFromSupabase();
  return profiles.find((p) => p.email.toLowerCase() === cleanEmail) || null;
}

export async function saveProfileToSupabase(profile: Partial<UserProfile>): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      if (profile.email && profile.passwordHash) {
        try {
          await client.auth.signUp({
            email: profile.email.trim().toLowerCase(),
            password: profile.passwordHash,
            options: {
              data: {
                full_name: profile.fullName,
                role: profile.role || 'SURGEON'
              }
            }
          });
        } catch (authErr) {
          console.warn('Supabase Auth signUp notice:', authErr);
        }
      }

      const payload = {
        full_name: profile.fullName,
        email: profile.email?.trim().toLowerCase(),
        password_hash: profile.passwordHash,
        role: (profile.role || 'SURGEON').toUpperCase(),
        specialization: profile.specialization,
        hospital: profile.hospital,
        department: profile.department,
        medical_registration_number: profile.medicalRegistrationNumber,
        phone: profile.phone,
        status: (profile.status || 'ACTIVE').toUpperCase(),
        created_by: profile.createdBy || 'ADMIN'
      };
      await client.from('profiles').upsert(payload, { onConflict: 'email' });
      return true;
    } catch (e) {
      console.error('Profile Supabase upsert error:', e);
      return false;
    }
  }
  return false;
}

export async function logAuditEvent(
  userEmail: string,
  role: string,
  action: string,
  details: string,
  status: string = 'SUCCESS'
): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('audit_logs').insert({
        user_email: userEmail,
        role,
        action,
        details,
        status,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Audit log save error:', e);
    }
  }
}

// Patient Records Operations
export async function fetchPatientsFromSupabase(): Promise<Patient[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Mobile Supabase fetch error:', error);
      return null;
    }

    return data.map((row: any) => ({
      id: row.id,
      caseId: row.case_id,
      name: row.name,
      patientId: row.patient_id,
      age: row.age || '',
      gender: row.gender || '',
      contact: row.contact || '',
      anatomy: row.anatomy || '',
      indication: row.indication || '',
      defectLocation: row.defect_location || '',
      notes: row.notes || '',
      documents: row.documents || [],
      imaging: row.imaging,
      analysis: row.analysis,
      classification: row.classification,
      graftPlan: row.graft_plan,
      fixation: row.fixation,
      simulation: row.simulation,
      report: row.report,
      outcome: row.outcome,
      workflowProgress: row.workflow_progress || 1,
      status: row.status || 'Registered',
      createdAt: row.created_at
    }));
  } catch (e) {
    console.error('Mobile Supabase fetch exception:', e);
    return null;
  }
}

export async function savePatientToSupabase(patient: Partial<Patient>): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
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

    const { error } = await client.from('patients').upsert(payload, { onConflict: 'case_id' });
    if (error) {
      console.error('Mobile Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Mobile Supabase save exception:', e);
    return false;
  }
}
