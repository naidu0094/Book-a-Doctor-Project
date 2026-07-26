import { supabase } from '../lib/supabase';
import type { Doctor, Department } from '../types';

export interface DoctorFilters {
  search?: string;
  specialization?: string;
  city?: string;
  minRating?: number;
  minFee?: number;
  maxFee?: number;
  minExperience?: number;
  gender?: string;
  language?: string;
  hospital?: string;
  sort?: 'rating' | 'fee-low' | 'fee-high' | 'experience';
}

export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await supabase.from('departments').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getDoctors(filters: DoctorFilters = {}): Promise<Doctor[]> {
  let query = supabase.from('doctors').select('*, department:departments(*)');

  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(
      `full_name.ilike.%${term}%,hospital.ilike.%${term}%,specialization.ilike.%${term}%,city.ilike.%${term}%`
    );
  }
  if (filters.specialization && filters.specialization !== 'all') {
    query = query.eq('specialization', filters.specialization);
  }
  if (filters.city && filters.city !== 'all') {
    query = query.eq('city', filters.city);
  }
  if (filters.minRating) {
    query = query.gte('rating', filters.minRating);
  }
  if (filters.minFee != null) {
    query = query.gte('consultation_fee', filters.minFee);
  }
  if (filters.maxFee != null) {
    query = query.lte('consultation_fee', filters.maxFee);
  }
  if (filters.minExperience) {
    query = query.gte('experience', filters.minExperience);
  }
  if (filters.gender && filters.gender !== 'all') {
    query = query.eq('gender', filters.gender);
  }
  if (filters.language && filters.language !== 'all') {
    query = query.contains('languages', [filters.language]);
  }
  if (filters.hospital && filters.hospital !== 'all') {
    query = query.eq('hospital', filters.hospital);
  }

  switch (filters.sort) {
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'fee-low':
      query = query.order('consultation_fee', { ascending: true });
      break;
    case 'fee-high':
      query = query.order('consultation_fee', { ascending: false });
      break;
    case 'experience':
      query = query.order('experience', { ascending: false });
      break;
    default:
      query = query.order('rating', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*, department:departments(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPopularDoctors(limit = 4): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*, department:departments(*)')
    .eq('status', 'approved')
    .order('patients_treated', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getTopRatedDoctors(limit = 4): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*, department:departments(*)')
    .eq('status', 'approved')
    .order('rating', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getCities(): Promise<string[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('city')
    .not('city', 'is', null);
  if (error) throw error;
  const cities = [...new Set((data ?? []).map((d) => d.city).filter(Boolean))] as string[];
  return cities.sort();
}

export async function getHospitals(): Promise<string[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('hospital')
    .not('hospital', 'is', null);
  if (error) throw error;
  const hospitals = [...new Set((data ?? []).map((d) => d.hospital).filter(Boolean))] as string[];
  return hospitals.sort();
}
