import { useEffect, useState } from 'react';
import { FileText, Plus, Search, Pill } from 'lucide-react';
import { getAppointmentsByDoctor, updateAppointmentStatus } from '../../services/appointmentService';
import { createPrescription } from '../../services/medicalService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Appointment, Doctor, Prescription } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/Alert';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

interface MedicationEntry {
  name: string;
  dosage: string;
  duration: string;
}

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [_prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [writeOpen, setWriteOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [medications, setMedications] = useState<MedicationEntry[]>([{ name: '', dosage: '', duration: '' }]);
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: d } = await supabase.from('doctors').select('*').eq('user_id', user.id).maybeSingle();
        if (d) {
          setDoctor(d);
          const appts = await getAppointmentsByDoctor(d.id);
          setAppointments(appts.filter((a) => a.status === 'confirmed' || a.status === 'completed'));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleWrite = (appt: Appointment) => {
    setSelectedAppt(appt);
    setMedications([{ name: '', dosage: '', duration: '' }]);
    setDiagnosis('');
    setAdvice('');
    setWriteOpen(true);
  };

  const handleSave = async () => {
    if (!selectedAppt || !doctor) return;
    setSaving(true);
    try {
      const validMeds = medications.filter((m) => m.name.trim());
      const presc = await createPrescription({
        appointment_id: selectedAppt.id,
        patient_id: selectedAppt.patient_id,
        doctor_id: doctor.id,
        medications: validMeds,
        diagnosis,
        advice,
      });
      setPrescriptions((prev) => [presc, ...prev]);
      if (selectedAppt.status === 'confirmed') {
        await updateAppointmentStatus(selectedAppt.id, 'completed');
        setAppointments((prev) => prev.map((a) => (a.id === selectedAppt.id ? { ...a, status: 'completed' } : a)));
      }
      setWriteOpen(false);
    } catch {
      alert('Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const filtered = appointments.filter((a) => !search || a.patient?.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prescriptions</h1>
        <p className="text-slate-600 dark:text-slate-400">Write and manage prescriptions for your patients</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by patient name..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText className="w-7 h-7" />} title="No appointments to prescribe" message="Confirmed appointments will appear here for prescription writing." />
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => (
            <div key={apt.id} className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg font-semibold text-primary-700 dark:text-primary-300">
                {apt.patient?.full_name?.charAt(0) || 'P'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">{apt.patient?.full_name}</p>
                <p className="text-xs text-slate-500">{apt.appointment_date} at {apt.time_slot}</p>
                {apt.symptoms && <p className="text-sm text-slate-500 mt-1">Symptoms: {apt.symptoms}</p>}
              </div>
              <Button size="sm" onClick={() => handleWrite(apt)}>
                <Plus className="w-4 h-4" /> Write Prescription
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Write Prescription Modal */}
      <Modal open={writeOpen} onClose={() => setWriteOpen(false)} title={`Prescription for ${selectedAppt?.patient?.full_name || ''}`} size="lg">
        <div className="space-y-5">
          <Input label="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Primary diagnosis" />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Medications</label>
            <div className="space-y-3">
              {medications.map((med, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input className="input-field text-sm sm:col-span-5" placeholder="Medicine name" value={med.name} onChange={(e) => {
                    const next = [...medications]; next[i] = { ...med, name: e.target.value }; setMedications(next);
                  }} />
                  <input className="input-field text-sm sm:col-span-3" placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={(e) => {
                    const next = [...medications]; next[i] = { ...med, dosage: e.target.value }; setMedications(next);
                  }} />
                  <input className="input-field text-sm sm:col-span-3" placeholder="Duration (e.g. 7 days)" value={med.duration} onChange={(e) => {
                    const next = [...medications]; next[i] = { ...med, duration: e.target.value }; setMedications(next);
                  }} />
                  {medications.length > 1 && (
                    <button onClick={() => setMedications(medications.filter((_, idx) => idx !== i))} className="sm:col-span-1 text-error-600 text-sm font-medium">Remove</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setMedications([...medications, { name: '', dosage: '', duration: '' }])} className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
              + Add medication
            </button>
          </div>

          <Textarea label="Advice / Instructions" rows={3} value={advice} onChange={(e) => setAdvice(e.target.value)} placeholder="Dietary advice, follow-up instructions..." />

          <Button fullWidth size="lg" loading={saving} onClick={handleSave}>
            <Pill className="w-4 h-4" /> Save Prescription
          </Button>
        </div>
      </Modal>
    </div>
  );
}
