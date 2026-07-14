import { supabase } from '../lib/supabase';
import type { Appointment, AppointmentStatus } from '../types';

export async function createAppointment(input: {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  time_slot: string;
  symptoms?: string;
  notes?: string;
}): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: input.patient_id,
      doctor_id: input.doctor_id,
      appointment_date: input.appointment_date,
      time_slot: input.time_slot,
      symptoms: input.symptoms ?? null,
      notes: input.notes ?? null,
      status: 'pending',
      payment_status: 'unpaid',
    })
    .select('*, doctor:doctors(*), patient:patients(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, doctor:doctors(*, department:departments(*)), patient:patients(*)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, doctor:doctors(*), patient:patients(*)')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  meetingLink?: string
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (meetingLink !== undefined) update.meeting_link = meetingLink;
  const { error } = await supabase.from('appointments').update(update).eq('id', id);
  if (error) throw error;
}

export async function cancelAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw error;
}

export async function rescheduleAppointment(
  id: string,
  newDate: string,
  newSlot: string
): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ appointment_date: newDate, time_slot: newSlot, status: 'pending' })
    .eq('id', id);
  if (error) throw error;
}
