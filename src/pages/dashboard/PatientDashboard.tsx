import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, CheckCircle, Video, CalendarX,
  TrendingUp, Activity, Stethoscope, ArrowRight,
} from 'lucide-react';
import { getAppointmentsByPatient, cancelAppointment } from '../../services/appointmentService';
import { getPaymentsByPatient } from '../../services/medicalService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Appointment, Payment, Patient } from '../../types';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Alert';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [_patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: p } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (p) {
          setPatient(p);
          const [appts, pays] = await Promise.all([
            getAppointmentsByPatient(p.id),
            getPaymentsByPatient(p.id),
          ]);
          setAppointments(appts);
          setPayments(pays);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const upcoming = appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'pending'
  );
  const completed = appointments.filter((a) => a.status === 'completed');
  const cancelled = appointments.filter((a) => a.status === 'cancelled' || a.status === 'rejected');
  const totalSpent = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a)));
    } catch {
      alert('Failed to cancel appointment');
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.fullName?.split(' ')[0]}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Here's your health overview</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Upcoming" value={upcoming.length} color="primary" />
        <StatCard icon={CheckCircle} label="Completed" value={completed.length} color="success" />
        <StatCard icon={CalendarX} label="Cancelled" value={cancelled.length} color="error" />
        <StatCard icon={TrendingUp} label="Total Spent" value={`₹${totalSpent}`} color="secondary" />
      </div>

      {/* Upcoming appointments */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Appointments</h2>
          <Link to="/dashboard/appointments" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
            View all →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-7 h-7" />}
            title="No upcoming appointments"
            message="Book an appointment with one of our expert doctors today."
            action={<Link to="/doctors"><Button>Find Doctors</Button></Link>}
          />
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((apt) => (
              <AppointmentRow key={apt.id} appointment={apt} onCancel={() => handleCancel(apt.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAction icon={Stethoscope} title="Find a Doctor" desc="Search and book" to="/doctors" />
        <QuickAction icon={Activity} title="Medical Reports" desc="View & upload" to="/dashboard/reports" />
        <QuickAction icon={Calendar} title="Appointments" desc="Manage bookings" to="/dashboard/appointments" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Calendar; label: string; value: string | number; color: 'primary' | 'secondary' | 'success' | 'error' }) {
  const colors = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    secondary: 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400',
    success: 'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400',
    error: 'bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </motion.div>
  );
}

function AppointmentRow({ appointment, onCancel }: { appointment: Appointment; onCancel: () => void }) {
  const statusVariant = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'primary',
    cancelled: 'error',
    rejected: 'error',
  } as const;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <img
        src={appointment.doctor?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.doctor?.full_name || 'D')}&background=2563EB&color=fff`}
        alt={appointment.doctor?.full_name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-white truncate">{appointment.doctor?.full_name}</p>
        <p className="text-sm text-slate-500">{appointment.doctor?.specialization}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {appointment.appointment_date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appointment.time_slot}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant={statusVariant[appointment.status]}>{appointment.status}</Badge>
        {appointment.meeting_link && appointment.status === 'confirmed' && (
          <a href={appointment.meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
            <Video className="w-3 h-3" /> Join
          </a>
        )}
        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
          <button onClick={onCancel} className="text-xs font-medium text-error-600 hover:underline">Cancel</button>
        )}
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, desc, to }: { icon: typeof Calendar; title: string; desc: string; to: string }) {
  return (
    <Link to={to} className="card card-hover p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400" />
    </Link>
  );
}
