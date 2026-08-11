import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Patient, UserProfile, AuditLog } from '../types';

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

export function getSupabaseConfig(): { url: string; key: string } {
  const storedUrl = localStorage.getItem('RECONAI_SUPABASE_URL');
  const storedKey = localStorage.getItem('RECONAI_SUPABASE_KEY');
  return {
    url: storedUrl || env.VITE_SUPABASE_URL || 'https://ymqjarbchaxfiiepozec.supabase.co',
    key: storedKey || env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Pa6kQqnrL8LdnZ_m66oY-g_ZuJHLlET'
  };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (url) localStorage.setItem('RECONAI_SUPABASE_URL', url.trim());
  else localStorage.removeItem('RECONAI_SUPABASE_URL');

  if (key) localStorage.setItem('RECONAI_SUPABASE_KEY', key.trim());
  else localStorage.removeItem('RECONAI_SUPABASE_KEY');
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    try {
      return createClient(url, key);
    } catch (e) {
      console.error('Supabase init error:', e);
      return null;
    }
  }
  return null;
}

export async function signUpUser(email: string, pass: string) {
  const client = getSupabaseClient();
  if (!client) return { user: null };
  const { data, error } = await client.auth.signUp({ email, password: pass });
  if (error) throw error;
  return data;
}

export async function signInUser(email: string, pass: string) {
  const client = getSupabaseClient();
  if (!client) return { user: null };
  const { data, error } = await client.auth.signInWithPassword({ email, password: pass });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
  }
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

// Profile & Auth Management
export async function fetchProfilesFromSupabase(): Promise<UserProfile[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          fullName: row.full_name,
          email: row.email,
          passwordHash: row.password_hash,
          role: row.role,
          specialization: row.specialization || 'Surgery',
          hospital: row.hospital || 'St. Jude Medical Center',
          department: row.department || 'Maxillofacial',
          medicalRegistrationNumber: row.medical_registration_number || 'MED-REG-0000',
          phone: row.phone || '+1 555-0000',
          status: row.status || 'ACTIVE',
          createdBy: row.created_by || 'SYSTEM',
          createdAt: row.created_at,
          lastLogin: row.last_login
        }));
      }
    } catch (e) {
      console.warn('Profiles Supabase fetch fallback to local registry:', e);
    }
  }

  // Local Storage Registry Fallback
  const saved = localStorage.getItem('RECONAI_PROFILES_REGISTRY');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_PROFILES;
    }
  }
  localStorage.setItem('RECONAI_PROFILES_REGISTRY', JSON.stringify(DEFAULT_PROFILES));
  return DEFAULT_PROFILES;
}

export async function saveProfileToSupabase(profile: Partial<UserProfile>): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      // 1. Register with Supabase Auth service (so user appears in Authentication -> Users tab)
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
          console.warn('Supabase Auth signUp notice (user may already exist):', authErr);
        }
      }

      // 2. Save detailed profile metadata to public.profiles table
      const payload = {
        full_name: profile.fullName,
        email: profile.email,
        password_hash: profile.passwordHash,
        role: profile.role || 'SURGEON',
        specialization: profile.specialization,
        hospital: profile.hospital,
        department: profile.department,
        medical_registration_number: profile.medicalRegistrationNumber,
        phone: profile.phone,
        status: profile.status || 'ACTIVE',
        created_by: profile.createdBy || 'ADMIN'
      };
      await client.from('profiles').upsert(payload, { onConflict: 'email' });
    } catch (e) {
      console.warn('Profile Supabase upsert error:', e);
    }
  }

  // Sync Local Storage
  const profiles = await fetchProfilesFromSupabase();
  const existingIdx = profiles.findIndex((p) => p.email.toLowerCase() === profile.email?.toLowerCase());
  const newProfile: UserProfile = {
    id: profile.id || `p-${Date.now()}`,
    fullName: profile.fullName || 'Doctor Profile',
    email: profile.email || '',
    passwordHash: profile.passwordHash || '',
    role: profile.role || 'SURGEON',
    specialization: profile.specialization || 'Surgery',
    hospital: profile.hospital || 'St. Jude Surgical Medical Center',
    department: profile.department || 'Maxillofacial Surgery',
    medicalRegistrationNumber: profile.medicalRegistrationNumber || 'MED-REG-0000',
    phone: profile.phone || '',
    status: profile.status || 'ACTIVE',
    createdBy: profile.createdBy || 'ADMIN',
    createdAt: profile.createdAt || new Date().toISOString()
  };

  let updatedList: UserProfile[];
  if (existingIdx >= 0) {
    updatedList = [...profiles];
    updatedList[existingIdx] = { ...updatedList[existingIdx], ...newProfile };
  } else {
    updatedList = [newProfile, ...profiles];
  }
  localStorage.setItem('RECONAI_PROFILES_REGISTRY', JSON.stringify(updatedList));
  return true;
}

export async function updateProfileStatus(id: string, email: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<boolean> {
  const profiles = await fetchProfilesFromSupabase();
  const target = profiles.find((p) => p.id === id || p.email.toLowerCase() === email.toLowerCase());
  if (target) {
    target.status = newStatus;
    await saveProfileToSupabase(target);
    return true;
  }
  return false;
}

// Security Audit Logs Helper
export async function logAuditEvent(userEmail: string, role: string, action: string, details: string, status: string = 'SUCCESS'): Promise<void> {
  const logObj: AuditLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userEmail,
    role,
    action,
    details,
    status,
    timestamp: new Date().toISOString()
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('audit_logs').insert({
        user_email: userEmail,
        role,
        action,
        details,
        status,
        timestamp: logObj.timestamp
      });
    } catch (e) {
      console.warn('Audit log Supabase save exception:', e);
    }
  }

  // Local storage fallback for audit logs
  const saved = localStorage.getItem('RECONAI_AUDIT_LOGS');
  const existing: AuditLog[] = saved ? JSON.parse(saved) : [];
  localStorage.setItem('RECONAI_AUDIT_LOGS', JSON.stringify([logObj, ...existing].slice(0, 100)));
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(50);
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          userEmail: row.user_email,
          role: row.role,
          action: row.action,
          targetId: row.target_id,
          details: row.details,
          status: row.status || 'SUCCESS',
          timestamp: row.timestamp,
          ipAddress: row.ip_address || '127.0.0.1'
        }));
      }
    } catch (e) {
      console.warn('Audit logs Supabase fetch exception:', e);
    }
  }

  const saved = localStorage.getItem('RECONAI_AUDIT_LOGS');
  return saved ? JSON.parse(saved) : [
    { id: 'audit-01', userEmail: 'admin@reconai.med', role: 'ADMIN', action: 'Admin Portal Access', details: 'System Overseer authenticated', status: 'SUCCESS', timestamp: new Date().toISOString() }
  ];
}

// Database Helpers for Patients
export async function fetchPatientsFromSupabase(): Promise<Patient[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetchPatients error:', error);
      return null;
    }

    return data.map((row) => ({
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
    console.error('Supabase query exception:', e);
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
      console.error('Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Supabase save exception:', e);
    return false;
  }
}
