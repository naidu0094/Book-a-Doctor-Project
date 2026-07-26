import { useEffect, useState } from 'react';
import { Calendar, Clock, Video, CheckCircle, XCircle, Search } from 'lucide-react';
import { getAppointmentsByDoctor, updateAppointmentStatus } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Appointment, Doctor } from '../../types';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Alert';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

type FilterTab = 'all' | 'pending' | 'confirmed' | 'completed';

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const [_doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
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

  const handleAccept = async (id: string) => {
    const link = `https://meet.jit.si/bookadoctor-${id}`;
    await updateAppointmentStatus(id, 'confirmed', link);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'confirmed', meeting_link: link } : a)));
  };

  const handleReject = async (id: string) => {
    await updateAppointmentStatus(id, 'rejected');
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a)));
  };

  const handleComplete = async (id: string) => {
    await updateAppointmentStatus(id, 'completed');
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'completed' } : a)));
  };

  if (loading) return <DashboardSkeleton />;

  const filtered = appointments.filter((a) => {
    const matchesSearch = !search || a.patient?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: appointments.length },
    { key: 'pending', label: 'Pending', count: appointments.filter((a) => a.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: appointments.filter((a) => a.status === 'confirmed').length },
    { key: 'completed', label: 'Completed', count: appointments.filter((a) => a.status === 'completed').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your patient appointments</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by patient name..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              filter === tab.key ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Calendar className="w-7 h-7" />} title="No appointments" message="Appointment requests from patients will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => (
            <div key={apt.id} className="card p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg font-semibold text-primary-700 dark:text-primary-300">
                  {apt.patient?.full_name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{apt.patient?.full_name}</h3>
                      <p className="text-xs text-slate-500">{apt.patient?.email}</p>
                    </div>
                    <Badge variant={apt.status === 'confirmed' ? 'success' : apt.status === 'pending' ? 'warning' : apt.status === 'completed' ? 'primary' : 'error'}>
                      {apt.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {apt.appointment_date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {apt.time_slot}</span>
                    <Badge variant={apt.payment_status === 'paid' ? 'success' : 'warning'}>{apt.payment_status}</Badge>
                  </div>
                  {apt.symptoms && <p className="mt-2 text-sm text-slate-500"><span className="font-medium">Symptoms:</span> {apt.symptoms}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {apt.status === 'pending' && (
                      <>
                        <Button size="sm" variant="success" onClick={() => handleAccept(apt.id)}><CheckCircle className="w-4 h-4" /> Accept</Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(apt.id)}><XCircle className="w-4 h-4" /> Reject</Button>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                      <>
                        {apt.meeting_link && (
                          <a href={apt.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="secondary"><Video className="w-4 h-4" /> Join Call</Button>
                          </a>
                        )}
                        <Button size="sm" onClick={() => handleComplete(apt.id)}>Mark Completed</Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
