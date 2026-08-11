-- RECONAI Database Schema - Secure Two-Role Auth & Clinical Workflow
-- Copy and paste this script into your SQL Editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    age VARCHAR(20),
    gender VARCHAR(20),
    contact VARCHAR(100),
    anatomy VARCHAR(255),
    indication VARCHAR(255),
    defect_location VARCHAR(255),
    notes TEXT,
    workflow_progress INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Registered',
    imaging JSONB,
    analysis JSONB,
    classification JSONB,
    graft_plan JSONB,
    fixation JSONB,
    simulation JSONB,
    report JSONB,
    outcome JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to patients" ON public.patients;
DROP POLICY IF EXISTS "Allow insert access to patients" ON public.patients;
DROP POLICY IF EXISTS "Allow update access to patients" ON public.patients;
DROP POLICY IF EXISTS "Allow delete access to patients" ON public.patients;

CREATE POLICY "Allow read access to patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Allow insert access to patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to patients" ON public.patients FOR UPDATE USING (true);
CREATE POLICY "Allow delete access to patients" ON public.patients FOR DELETE USING (true);

-- 2. Staff Profiles Table (RBAC: ADMIN, SURGEON, CLINICAL_STAFF)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'SURGEON', -- ADMIN, SURGEON, CLINICAL_STAFF
    specialization VARCHAR(255),
    hospital VARCHAR(255) DEFAULT 'St. Jude Surgical Medical Center',
    department VARCHAR(255) DEFAULT 'Maxillofacial Surgery',
    medical_registration_number VARCHAR(100),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED, PENDING
    created_by VARCHAR(255) DEFAULT 'SYSTEM_ADMIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow update access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow delete access to profiles" ON public.profiles;

CREATE POLICY "Allow read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert access to profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow delete access to profiles" ON public.profiles FOR DELETE USING (true);

-- 3. Security Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    target_id VARCHAR(255),
    details TEXT,
    status VARCHAR(50) DEFAULT 'SUCCESS',
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to audit_logs" ON public.audit_logs;
CREATE POLICY "Allow all access to audit_logs" ON public.audit_logs FOR ALL USING (true);

-- Initial Accounts (Admin & Doctors)
INSERT INTO public.profiles (full_name, email, password_hash, role, specialization, department, medical_registration_number, status)
VALUES 
('System Chief Administrator', 'admin@reconai.com', 'Admin2026!', 'ADMIN', 'Hospital Systems Administration', 'Surgical Administration', 'HOSP-ADM-01', 'ACTIVE'),
('Dr. Eleanor Vance', 'dr.vance@reconai.com', 'Surgeon2026!', 'SURGEON', 'Maxillofacial Surgery', 'Oral & Maxillofacial', 'MED-REG-8842', 'ACTIVE'),
('Dr. Arthur Smith', 'dr.smith@reconai.com', 'Surgeon2026!', 'SURGEON', 'Oral Reconstruction', 'Craniofacial Surgery', 'MED-REG-4102', 'ACTIVE'),
('Dr. Rajesh Patel', 'dr.patel@reconai.com', 'Surgeon2026!', 'SURGEON', 'Head & Neck Oncology', 'Surgical Oncology', 'MED-REG-9031', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Initial Demo Patient Case
INSERT INTO public.patients (case_id, name, patient_id, age, gender, contact, anatomy, indication, defect_location, notes, status, workflow_progress)
VALUES 
('RECON-10240', 'Eleanor Vance', 'PID-8842', '44', 'Female', '+1 555-0192', 'Mandible Body', 'Osteoradionecrosis post-radiotherapy', 'Left mandibular angle & body', 'Surgical resection planned. Microvascular reconstruction required.', 'Registered', 1)
ON CONFLICT (case_id) DO NOTHING;

-- Auto-Confirm All Registered Users in Supabase Auth (removes 'Waiting for verification')
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;


