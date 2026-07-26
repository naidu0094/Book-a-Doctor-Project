import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Users, DollarSign, Clock, CheckCircle,
  Stethoscope,
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getAppointmentsByDoctor, updateAppointmentStatus } from '../../services/appointmentService';
import { getPaymentsByDoctor } from '../../services/medicalService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Appointment, Payment, Doctor } from '../../types';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Alert';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: d } = await supabase.from('doctors').select('*').eq('user_id', user.id).maybeSingle();
        if (d) {
          setDoctor(d);
          const [appts, pays] = await Promise.all([
            getAppointmentsByDoctor(d.id),
            getPaymentsByDoctor(d.id),
          ]);
          setAppointments(appts);
          setPayments(pays);
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

  if (loading) return <DashboardSkeleton />;
  if (!doctor) return <EmptyState icon={<Stethoscope className="w-7 h-7" />} title="Profile not found" message="Please complete your doctor profile." />;

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter((a) => a.appointment_date === today);
  const pending = appointments.filter((a) => a.status === 'pending');
  const completed = appointments.filter((a) => a.status === 'completed');
  const totalEarnings = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  // Chart data
  const statusData = {
    labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [{
      data: [
        pending.length,
        appointments.filter((a) => a.status === 'confirmed').length,
        completed.length,
        appointments.filter((a) => a.status === 'cancelled' || a.status === 'rejected').length,
      ],
      backgroundColor: ['#f59e0b', '#10b981', '#2563eb', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const weeklyData = {
    labels: last7Days.map((d) => d.toLocaleDateString('en', { weekday: 'short' })),
    datasets: [{
      label: 'Appointments',
      data: last7Days.map((d) => {
        const ds = d.toISOString().split('T')[0];
        return appointments.filter((a) => a.appointment_date === ds).length;
      }),
      backgroundColor: '#2563eb',
      borderRadius: 8,
    }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Doctor Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome, Dr. {doctor.full_name.split(' ').slice(-1)}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Today's Appointments" value={todaysAppointments.length} color="primary" />
        <StatCard icon={Clock} label="Pending Requests" value={pending.length} color="warning" />
        <StatCard icon={Users} label="Total Patients" value={doctor.patients_treated} color="secondary" />
        <StatCard icon={DollarSign} label="Total Earnings" value={`₹${totalEarnings}`} color="success" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Weekly Appointments</h3>
          <Bar data={weeklyData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Appointment Status</h3>
          <div className="flex items-center justify-center h-[240px]">
            <Doughnut data={statusData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
      </div>

      {/* Pending appointments */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Pending Appointment Requests</h2>
          <Badge variant="warning">{pending.length} pending</Badge>
        </div>
        {pending.length === 0 ? (
          <EmptyState icon={<CheckCircle className="w-7 h-7" />} title="No pending requests" message="All caught up! New appointment requests will appear here." />
        ) : (
          <div className="space-y-3">
            {pending.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300">
                  {apt.patient?.full_name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{apt.patient?.full_name}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>{apt.appointment_date} at {apt.time_slot}</span>
                    {apt.symptoms && <span className="truncate">• {apt.symptoms}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="success" onClick={() => handleAccept(apt.id)}>
                    <CheckCircle className="w-4 h-4" /> Accept
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleReject(apt.id)}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Calendar; label: string; value: string | number; color: 'primary' | 'secondary' | 'success' | 'warning' }) {
  const colors = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    secondary: 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400',
    success: 'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400',
    warning: 'bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </motion.div>
  );
}
