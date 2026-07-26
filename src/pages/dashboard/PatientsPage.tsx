import { useEffect, useState } from 'react';
import { Users, Phone, Droplet, Search } from 'lucide-react';
import { getAppointmentsByDoctor } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Appointment, Doctor, Patient } from '../../types';
import Badge from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/Alert';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

export default function PatientsPage() {
  const { user } = useAuth();
  const [_doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: d } = await supabase.from('doctors').select('*').eq('user_id', user.id).maybeSingle();
        if (d) {
          setDoctor(d);
          const appts = await getAppointmentsByDoctor(d.id);
          setAppointments(appts);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <DashboardSkeleton />;

  // Unique patients from appointments
  const patientMap = new Map<string, Patient & { lastVisit: string; apptCount: number }>();
  appointments.forEach((apt) => {
    if (apt.patient) {
      const existing = patientMap.get(apt.patient.id);
      if (existing) {
        existing.apptCount++;
        if (apt.appointment_date > existing.lastVisit) existing.lastVisit = apt.appointment_date;
      } else {
        patientMap.set(apt.patient.id, { ...apt.patient, lastVisit: apt.appointment_date, apptCount: 1 });
      }
    }
  });

  const patients = Array.from(patientMap.values()).filter((p) =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Patients</h1>
        <p className="text-slate-600 dark:text-slate-400">{patients.length} patients treated</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      {patients.length === 0 ? (
        <EmptyState icon={<Users className="w-7 h-7" />} title="No patients yet" message="Patients who book appointments with you will appear here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => (
            <div key={p.id} className="card card-hover p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg font-semibold text-primary-700 dark:text-primary-300">
                  {p.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{p.full_name}</p>
                  <p className="text-xs text-slate-500">{p.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {p.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {p.phone}</p>}
                {p.blood_group && <p className="flex items-center gap-2"><Droplet className="w-3.5 h-3.5 text-red-400" /> Blood: {p.blood_group}</p>}
                {p.medical_history && <p className="text-xs text-slate-500 line-clamp-2">{p.medical_history}</p>}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Badge variant="primary">{p.apptCount} visits</Badge>
                <span className="text-xs text-slate-500">Last: {p.lastVisit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
