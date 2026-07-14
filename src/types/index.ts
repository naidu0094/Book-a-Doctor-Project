export type UserRole = 'patient' | 'doctor' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

export interface Doctor {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  gender: string;
  dob: string | null;
  qualification: string | null;
  experience: number;
  hospital: string | null;
  clinic_address: string | null;
  department_id: string | null;
  specialization: string;
  consultation_fee: number;
  languages: string[];
  rating: number;
  patients_treated: number;
  availability: Record<string, boolean>;
  time_slots: string[];
  biography: string | null;
  certificates: string[];
  license_number: string | null;
  verified: boolean;
  status: string;
  city: string | null;
  created_at: string;
  department?: Department | null;
}

export interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  gender: string;
  dob: string | null;
  blood_group: string | null;
  address: string | null;
  medical_history: string | null;
  emergency_contact: string | null;
  created_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  time_slot: string;
  status: AppointmentStatus;
  symptoms: string | null;
  notes: string | null;
  payment_status: string;
  meeting_link: string | null;
  created_at: string;
  doctor?: Doctor | null;
  patient?: Patient | null;
}

export interface Payment {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  amount: number;
  method: string;
  status: string;
  transaction_id: string | null;
  created_at: string;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  medications: Medication[];
  diagnosis: string | null;
  advice: string | null;
  created_at: string;
}

export interface Medication {
  name: string;
  dosage: string;
  duration: string;
}

export interface Report {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  file_url: string;
  file_name: string;
  file_type: string | null;
  uploaded_at: string;
}

export interface Review {
  id: string;
  doctor_id: string;
  patient_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  patient?: Patient | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}
