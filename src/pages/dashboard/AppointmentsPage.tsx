import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, CalendarX, Search, CheckCircle, XCircle } from 'lucide-react';
import { getAppointmentsByPatient, cancelAppointment, rescheduleAppointment } from '../../services/appointmentService';
import { getPrescriptionsByPatient } from '../../services/medicalService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Appointment, Patient, Prescription } from '../../types';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/Alert';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [_patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: p } = await supabase.from('patients').select('*').eq('user_id', user.id).maybeSingle();
        if (p) {
          setPatient(p);
          const [appts, prescs] = await Promise.all([
            getAppointmentsByPatient(p.id),
            getPrescriptionsByPatient(p.id),
          ]);
          setAppointments(appts);
          setPrescriptions(prescs);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a)));
    } catch {
      alert('Failed to cancel');
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleId || !newDate || !newSlot) return;
    try {
      await rescheduleAppointment(rescheduleId, newDate, newSlot);
      setAppointments((prev) =>
        prev.map((a) => (a.id === rescheduleId ? { ...a, appointment_date: newDate, time_slot: newSlot, status: 'pending' } : a))
      );
      setRescheduleId(null);
      setNewDate('');
      setNewSlot('');
    } catch {
      alert('Failed to reschedule');
    }
  };

  const filtered = appointments.filter((a) => {
    const matchesSearch = !search || a.doctor?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'upcoming' && (a.status === 'pending' || a.status === 'confirmed')) ||
      (filter === 'completed' && a.status === 'completed') ||
      (filter === 'cancelled' && (a.status === 'cancelled' || a.status === 'rejected'));
    return matchesSearch && matchesFilter;
  });

  if (loading) return <DashboardSkeleton />;

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: appointments.length },
    { key: 'upcoming', label: 'Upcoming', count: appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed').length },
    { key: 'completed', label: 'Completed', count: appointments.filter((a) => a.status === 'completed').length },
    { key: 'cancelled', label: 'Cancelled', count: appointments.filter((a) => a.status === 'cancelled' || a.status === 'rejected').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Appointments</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your bookings</p>
        </div>
        <Link to="/doctors"><Button>Book New Appointment</Button></Link>
      </div>

      {/* Search & tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label} <span className="text-xs">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Appointments list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarX className="w-7 h-7" />}
          title="No appointments found"
          message="Book your first appointment with one of our expert doctors."
          action={<Link to="/doctors"><Button>Find Doctors</Button></Link>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => {
            const prescription = prescriptions.find((p) => p.appointment_id === apt.id);
            return (
              <div key={apt.id} className="card p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={apt.doctor?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.full_name || 'D')}&background=2563EB&color=fff`}
                    alt={apt.doctor?.full_name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{apt.doctor?.full_name}</h3>
                        <p className="text-sm text-primary-600 dark:text-primary-400">{apt.doctor?.specialization}</p>
                        <p className="text-xs text-slate-500">{apt.doctor?.hospital}</p>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {apt.appointment_date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {apt.time_slot}</span>
                      <Badge variant={apt.payment_status === 'paid' ? 'success' : 'warning'}>
                        {apt.payment_status}
                      </Badge>
                    </div>
                    {apt.symptoms && (
                      <p className="mt-2 text-sm text-slate-500"><span className="font-medium">Symptoms:</span> {apt.symptoms}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {apt.meeting_link && apt.status === 'confirmed' && (
                        <a href={apt.meeting_link} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="secondary"><Video className="w-4 h-4" /> Join Call</Button>
                        </a>
                      )}
                      {prescription && (
                        <a href={`/dashboard/prescriptions/${prescription.id}`}>
                          <Button size="sm" variant="outline"><CheckCircle className="w-4 h-4" /> View Prescription</Button>
                        </a>
                      )}
                      {(apt.status === 'pending' || apt.status === 'confirmed') && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setRescheduleId(apt.id)}>Reschedule</Button>
                          <Button size="sm" variant="danger" onClick={() => handleCancel(apt.id)}><XCircle className="w-4 h-4" /> Cancel</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal open={!!rescheduleId} onClose={() => setRescheduleId(null)} title="Reschedule Appointment">
        <div className="space-y-4">
          <Input
            label="New Date"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <Input
            label="New Time Slot"
            type="time"
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
          />
          <Button fullWidth onClick={handleReschedule} disabled={!newDate || !newSlot}>
            Confirm Reschedule
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, 'warning' | 'success' | 'primary' | 'error'> = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'primary',
    cancelled: 'error',
    rejected: 'error',
  };
  return <Badge variant={map[status] || 'neutral'}>{status}</Badge>;
}
