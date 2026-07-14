import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Droplet, Heart, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Patient, Doctor, UserRole } from '../../types';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

export default function ProfilePage() {
  const { user } = useAuth();
  const [_profile, setProfile] = useState<Patient | Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const role = user?.role as UserRole;
  const isDoctor = role === 'doctor';

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const table = isDoctor ? 'doctors' : 'patients';
        const { data } = await supabase.from(table).select('*').eq('user_id', user.id).maybeSingle();
        if (data) {
          setProfile(data);
          setForm({
            full_name: data.full_name || '',
            phone: data.phone || '',
            address: data.address || data.clinic_address || '',
            blood_group: data.blood_group || '',
            medical_history: data.medical_history || '',
            emergency_contact: data.emergency_contact || '',
            gender: data.gender || '',
            city: data.city || '',
            hospital: data.hospital || '',
            qualification: data.qualification || '',
            biography: data.biography || '',
            consultation_fee: String(data.consultation_fee || ''),
            experience: String(data.experience || ''),
            specialization: data.specialization || '',
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user, isDoctor]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const table = isDoctor ? 'doctors' : 'patients';
      const update: Record<string, unknown> = {
        full_name: form.full_name,
        phone: form.phone,
        gender: form.gender,
        updated_at: new Date().toISOString(),
      };
      if (isDoctor) {
        update.hospital = form.hospital;
        update.city = form.city;
        update.qualification = form.qualification;
        update.biography = form.biography;
        update.consultation_fee = Number(form.consultation_fee) || 0;
        update.experience = Number(form.experience) || 0;
        update.specialization = form.specialization;
        update.clinic_address = form.address;
      } else {
        update.address = form.address;
        update.blood_group = form.blood_group;
        update.medical_history = form.medical_history;
        update.emergency_contact = form.emergency_contact;
      }
      const { error: updateError } = await supabase.from(table).update(update).eq('user_id', user!.id);
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">Update your personal information</p>
      </div>

      {error && <Alert message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message="Profile updated successfully!" onClose={() => setSuccess(false)} />}

      {/* Avatar */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl font-bold text-primary-700 dark:text-primary-300">
            {form.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{form.full_name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 capitalize">
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full Name" icon={<User className="w-4 h-4" />} value={form.full_name || ''} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Email" icon={<Mail className="w-4 h-4" />} value={user?.email || ''} disabled />
          <Input label="Phone" icon={<Phone className="w-4 h-4" />} value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
            <select value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Role-specific info */}
      {isDoctor ? (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Professional Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Specialization" value={form.specialization || ''} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            <Input label="Hospital" value={form.hospital || ''} onChange={(e) => setForm({ ...form, hospital: e.target.value })} />
            <Input label="Qualification" value={form.qualification || ''} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
            <Input label="City" icon={<MapPin className="w-4 h-4" />} value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input label="Experience (years)" type="number" value={form.experience || ''} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
            <Input label="Consultation Fee (₹)" type="number" value={form.consultation_fee || ''} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Biography</label>
              <textarea value={form.biography || ''} onChange={(e) => setForm({ ...form, biography: e.target.value })} rows={3} className="input-field resize-none" />
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Medical Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Blood Group" icon={<Droplet className="w-4 h-4" />} value={form.blood_group || ''} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} placeholder="e.g. O+" />
            <Input label="Emergency Contact" icon={<Heart className="w-4 h-4" />} value={form.emergency_contact || ''} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} />
            <Input label="Address" icon={<MapPin className="w-4 h-4" />} value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Medical History</label>
              <textarea value={form.medical_history || ''} onChange={(e) => setForm({ ...form, medical_history: e.target.value })} rows={3} className="input-field resize-none" placeholder="Any chronic conditions, allergies, past surgeries..." />
            </div>
          </div>
        </div>
      )}

      <Button onClick={handleSave} loading={saving} size="lg">
        <Save className="w-4 h-4" /> Save Changes
      </Button>
    </div>
  );
}
