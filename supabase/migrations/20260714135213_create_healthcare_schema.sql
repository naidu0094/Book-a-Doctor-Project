/*
# Book A Doctor - Healthcare Platform Schema

## Overview
Creates the complete schema for a healthcare appointment booking platform with three user roles:
Patient, Doctor, and Admin. Uses Supabase auth.users for authentication, with profile tables
for role-specific data.

## New Tables
1. `departments` - Medical departments/specializations (Cardiology, Dermatology, etc.)
2. `doctors` - Doctor profiles linked to auth.users (verified status, availability, fees)
3. `patients` - Patient profiles linked to auth.users (medical history, blood group)
4. `appointments` - Booking records linking patient, doctor, date, slot, status
5. `payments` - Payment records for appointments
6. `prescriptions` - Doctor-prescribed medications for appointments
7. `reports` - Patient-uploaded medical reports (stored as file URLs)
8. `reviews` - Patient ratings and feedback for doctors
9. `notifications` - In-app notifications for users

## Security
- RLS enabled on all tables.
- Owner-scoped policies using auth.uid() for patient/doctor-owned data.
- Public read on doctors and departments (for search/browse without login).
- Patients can only access their own appointments, payments, reports, prescriptions, notifications.
- Doctors can access their appointments, prescriptions they write, and their reviews.
*/

-- Departments table (public read, admin write)
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  profile_image text,
  gender text DEFAULT 'male',
  dob date,
  qualification text,
  experience int DEFAULT 0,
  hospital text,
  clinic_address text,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  specialization text NOT NULL,
  consultation_fee numeric(10,2) DEFAULT 0,
  languages text[] DEFAULT '{}',
  rating numeric(2,1) DEFAULT 0,
  patients_treated int DEFAULT 0,
  availability jsonb DEFAULT '{}'::jsonb,
  time_slots jsonb DEFAULT '[]'::jsonb,
  biography text,
  certificates text[] DEFAULT '{}',
  license_number text,
  verified boolean DEFAULT false,
  status text DEFAULT 'pending',
  city text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  profile_image text,
  gender text DEFAULT 'male',
  dob date,
  blood_group text,
  address text,
  medical_history text,
  emergency_contact text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  time_slot text NOT NULL,
  status text DEFAULT 'pending',
  symptoms text,
  notes text,
  payment_status text DEFAULT 'unpaid',
  meeting_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  method text DEFAULT 'card',
  status text DEFAULT 'pending',
  transaction_id text,
  created_at timestamptz DEFAULT now()
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  medications jsonb NOT NULL DEFAULT '[]'::jsonb,
  diagnosis text,
  advice text,
  created_at timestamptz DEFAULT now()
);

-- Reports table (patient-uploaded medical reports)
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  uploaded_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'general',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctors_department ON doctors(department_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_payments_patient ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_doctor ON reviews(doctor_id);

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Departments: public read, authenticated write (admin managed)
DROP POLICY IF EXISTS "public_read_departments" ON departments;
CREATE POLICY "public_read_departments" ON departments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_departments" ON departments;
CREATE POLICY "auth_insert_departments" ON departments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_departments" ON departments;
CREATE POLICY "auth_update_departments" ON departments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_departments" ON departments;
CREATE POLICY "auth_delete_departments" ON departments FOR DELETE
  TO authenticated USING (true);

-- Doctors: public read (for search/browse), self update
DROP POLICY IF EXISTS "public_read_doctors" ON doctors;
CREATE POLICY "public_read_doctors" ON doctors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "self_insert_doctor" ON doctors;
CREATE POLICY "self_insert_doctor" ON doctors FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "self_update_doctor" ON doctors;
CREATE POLICY "self_update_doctor" ON doctors FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "auth_delete_doctor" ON doctors;
CREATE POLICY "auth_delete_doctor" ON doctors FOR DELETE
  TO authenticated USING (true);

-- Patients: self read/update/insert
DROP POLICY IF EXISTS "self_read_patient" ON patients;
CREATE POLICY "self_read_patient" ON patients FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "self_insert_patient" ON patients;
CREATE POLICY "self_insert_patient" ON patients FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "self_update_patient" ON patients;
CREATE POLICY "self_update_patient" ON patients FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Appointments: patient sees own, doctor sees own
DROP POLICY IF EXISTS "read_appointments" ON appointments;
CREATE POLICY "read_appointments" ON appointments FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_appointments" ON appointments;
CREATE POLICY "insert_appointments" ON appointments FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_appointments" ON appointments;
CREATE POLICY "update_appointments" ON appointments FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_appointments" ON appointments;
CREATE POLICY "delete_appointments" ON appointments FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid())
  );

-- Payments: patient sees own, doctor sees own
DROP POLICY IF EXISTS "read_payments" ON payments;
CREATE POLICY "read_payments" ON payments FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = payments.patient_id AND p.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = payments.doctor_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_payments" ON payments;
CREATE POLICY "insert_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = payments.patient_id AND p.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_payments" ON payments;
CREATE POLICY "update_payments" ON payments FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = payments.patient_id AND p.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = payments.patient_id AND p.user_id = auth.uid())
  );

-- Prescriptions: patient sees own, doctor sees own
DROP POLICY IF EXISTS "read_prescriptions" ON prescriptions;
CREATE POLICY "read_prescriptions" ON prescriptions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = prescriptions.patient_id AND p.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = prescriptions.doctor_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_prescriptions" ON prescriptions;
CREATE POLICY "insert_prescriptions" ON prescriptions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = prescriptions.doctor_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_prescriptions" ON prescriptions;
CREATE POLICY "update_prescriptions" ON prescriptions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = prescriptions.doctor_id AND d.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = prescriptions.doctor_id AND d.user_id = auth.uid())
  );

-- Reports: patient sees own
DROP POLICY IF EXISTS "read_reports" ON reports;
CREATE POLICY "read_reports" ON reports FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = reports.patient_id AND p.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_reports" ON reports;
CREATE POLICY "insert_reports" ON reports FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = reports.patient_id AND p.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_reports" ON reports;
CREATE POLICY "delete_reports" ON reports FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = reports.patient_id AND p.user_id = auth.uid())
  );

-- Reviews: public read, patient inserts own, patient updates/deletes own
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_reviews" ON reviews;
CREATE POLICY "insert_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = reviews.patient_id AND p.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_reviews" ON reviews;
CREATE POLICY "delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM patients p WHERE p.id = reviews.patient_id AND p.user_id = auth.uid())
  );

-- Notifications: self only
DROP POLICY IF EXISTS "read_notifications" ON notifications;
CREATE POLICY "read_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_notifications" ON notifications;
CREATE POLICY "insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_notifications" ON notifications;
CREATE POLICY "update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_notifications" ON notifications;
CREATE POLICY "delete_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
