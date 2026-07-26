import { supabase } from '../lib/supabase';
import type { Payment, Prescription, Report, Review, Notification } from '../types';

export async function createPayment(input: {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  amount: number;
  method: string;
  transaction_id: string;
}): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert({ ...input, status: 'completed' })
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from('appointments')
    .update({ payment_status: 'paid' })
    .eq('id', input.appointment_id);

  return data;
}

export async function getPaymentsByPatient(patientId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPaymentsByDoctor(doctorId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPrescription(input: {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  medications: { name: string; dosage: string; duration: string }[];
  diagnosis: string;
  advice: string;
}): Promise<Prescription> {
  const { data, error } = await supabase
    .from('prescriptions')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPrescriptionByAppointment(appointmentId: string): Promise<Prescription | null> {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('appointment_id', appointmentId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*, doctor:doctors(full_name), appointment:appointments(appointment_date, time_slot)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadReport(
  file: File,
  patientId: string,
  appointmentId?: string
): Promise<Report> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `reports/${patientId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('medical-reports')
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('medical-reports')
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from('reports')
    .insert({
      patient_id: patientId,
      appointment_id: appointmentId ?? null,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: file.type,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getReportsByPatient(patientId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('patient_id', patientId)
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase.from('reports').delete().eq('id', id);
  if (error) throw error;
}

export async function getReviewsByDoctor(doctorId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, patient:patients(full_name, profile_image)')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createReview(input: {
  doctor_id: string;
  patient_id: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const { error } = await supabase.from('reviews').insert(input);
  if (error) throw error;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function createNotification(input: {
  user_id: string;
  title: string;
  message: string;
  type?: string;
}): Promise<void> {
  const { error } = await supabase.from('notifications').insert({
    ...input,
    type: input.type ?? 'general',
  });
  if (error) throw error;
}
