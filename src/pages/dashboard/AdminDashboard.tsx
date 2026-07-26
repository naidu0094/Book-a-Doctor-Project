import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Stethoscope, Calendar, DollarSign, 
  ShieldCheck, UserCog, Trash2, Search,
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { supabase } from '../../lib/supabase';
import type { Doctor, Patient, Appointment, Payment, Department } from '../../types';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/Alert';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'doctors' | 'patients' | 'departments'>('overview');
  const [search, setSearch] = useState('');
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [d, p, a, pay, dept] = await Promise.all([
        supabase.from('doctors').select('*, department:departments(*)').order('created_at', { ascending: false }),
        supabase.from('patients').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*, doctor:doctors(*), patient:patients(*)').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('departments').select('*').order('name'),
      ]);
      setDoctors(d.data || []);
      setPatients(p.data || []);
      setAppointments(a.data || []);
      setPayments(pay.data || []);
      setDepartments(dept.data || []);
    } finally {
      setLoading(false);
    }
  }

  const handleApproveDoctor = async (id: string) => {
    const { error } = await supabase.from('doctors').update({ verified: true, status: 'approved' }).eq('id', id);
    if (error) { alert('Failed to approve'); return; }
    setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, verified: true, status: 'approved' } : d)));
  };

  const handleRejectDoctor = async (id: string) => {
    const { error } = await supabase.from('doctors').update({ verified: false, status: 'rejected' }).eq('id', id);
    if (error) { alert('Failed to reject'); return; }
    setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, verified: false, status: 'rejected' } : d)));
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm('Delete this doctor?')) return;
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    if (error) { alert('Failed to delete'); return; }
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm('Delete this patient?')) return;
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) { alert('Failed to delete'); return; }
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    const slug = newDeptName.toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from('departments').insert({ name: newDeptName, slug, description: newDeptDesc });
    if (error) { alert('Failed to add department'); return; }
    setNewDeptName('');
    setNewDeptDesc('');
    setDeptModalOpen(false);
    fetchAll();
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Delete this department?')) return;
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) { alert('Failed to delete'); return; }
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  if (loading) return <DashboardSkeleton />;

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter((a) => a.appointment_date === today);
  const totalRevenue = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingDoctors = doctors.filter((d) => d.status === 'pending');

  // Charts
  const specData = {
    labels: departments.map((d) => d.name),
    datasets: [{
      label: 'Doctors',
      data: departments.map((d) => doctors.filter((doc) => doc.department_id === d.id).length),
      backgroundColor: '#2563eb',
      borderRadius: 8,
    }],
  };

  const revenueData = {
    labels: ['Completed', 'Pending', 'Refunded'],
    datasets: [{
      data: [
        payments.filter((p) => p.status === 'completed').length,
        payments.filter((p) => p.status === 'pending').length,
        payments.filter((p) => p.status === 'refunded').length,
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const filteredDoctors = doctors.filter((d) => !search || d.full_name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase()));
  const filteredPatients = patients.filter((p) => !search || p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Platform overview and management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {([
          { key: 'overview', label: 'Overview' },
          { key: 'doctors', label: `Doctors (${doctors.length})` },
          { key: 'patients', label: `Patients (${patients.length})` },
          { key: 'departments', label: `Departments (${departments.length})` },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Patients" value={patients.length} color="primary" />
            <StatCard icon={Stethoscope} label="Total Doctors" value={doctors.length} color="secondary" />
            <StatCard icon={Calendar} label="Today's Appointments" value={todaysAppointments.length} color="warning" />
            <StatCard icon={DollarSign} label="Total Revenue" value={`₹${totalRevenue}`} color="success" />
          </div>

          {pendingDoctors.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-warning-500" /> Pending Doctor Approvals ({pendingDoctors.length})
              </h3>
              <div className="space-y-3">
                {pendingDoctors.map((d) => (
                  <div key={d.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-semibold text-primary-700">
                      {d.full_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{d.full_name}</p>
                      <p className="text-xs text-slate-500">{d.specialization} • {d.email}</p>
                    </div>
                    <Button size="sm" variant="success" onClick={() => handleApproveDoctor(d.id)}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => handleRejectDoctor(d.id)}>Reject</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Doctors by Department</h3>
              <Bar data={specData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Payment Status</h3>
              <div className="flex items-center justify-center h-[240px]">
                <Doughnut data={revenueData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctors */}
      {tab === 'doctors' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          {filteredDoctors.length === 0 ? (
            <EmptyState icon={<Stethoscope className="w-7 h-7" />} title="No doctors found" message="No doctors match your search." />
          ) : (
            <div className="space-y-3">
              {filteredDoctors.map((d) => (
                <div key={d.id} className="card p-4 flex items-center gap-4">
                  <img src={d.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.full_name)}&background=2563EB&color=fff`} alt={d.full_name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">{d.full_name}</p>
                    <p className="text-xs text-slate-500">{d.specialization} • {d.hospital} • {d.city}</p>
                  </div>
                  <Badge variant={d.status === 'approved' ? 'success' : d.status === 'pending' ? 'warning' : 'error'}>{d.status}</Badge>
                  {d.status === 'pending' && <Button size="sm" variant="success" onClick={() => handleApproveDoctor(d.id)}>Approve</Button>}
                  <Button size="sm" variant="ghost" className="text-error-600" onClick={() => handleDeleteDoctor(d.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Patients */}
      {tab === 'patients' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          {filteredPatients.length === 0 ? (
            <EmptyState icon={<Users className="w-7 h-7" />} title="No patients found" message="No patients match your search." />
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((p) => (
                <div key={p.id} className="card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg font-semibold text-primary-700">
                    {p.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">{p.full_name}</p>
                    <p className="text-xs text-slate-500">{p.email} • {p.phone || 'No phone'}</p>
                  </div>
                  {p.blood_group && <Badge variant="error">Blood: {p.blood_group}</Badge>}
                  <Button size="sm" variant="ghost" className="text-error-600" onClick={() => handleDeletePatient(p.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Departments */}
      {tab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setDeptModalOpen(true)}><UserCog className="w-4 h-4" /> Add Department</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d) => (
              <div key={d.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{d.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{d.description || 'No description'}</p>
                    <Badge variant="primary" className="mt-2">{doctors.filter((doc) => doc.department_id === d.id).length} doctors</Badge>
                  </div>
                  <button onClick={() => handleDeleteDepartment(d.id)} className="text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 p-2 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={deptModalOpen} onClose={() => setDeptModalOpen(false)} title="Add Department">
        <div className="space-y-4">
          <Input label="Department Name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="e.g. Neurology" />
          <Input label="Description" value={newDeptDesc} onChange={(e) => setNewDeptDesc(e.target.value)} placeholder="Brief description" />
          <Button fullWidth onClick={handleAddDepartment}>Add Department</Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color: 'primary' | 'secondary' | 'success' | 'warning' }) {
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
