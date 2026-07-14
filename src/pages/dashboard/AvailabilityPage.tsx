import { useEffect, useState } from 'react';
import { Clock, Save, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Doctor } from '../../types';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

const DEFAULT_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

export default function AvailabilityPage() {
  const { user } = useAuth();
  const [_doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [slots, setSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [newSlot, setNewSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: d } = await supabase.from('doctors').select('*').eq('user_id', user.id).maybeSingle();
        if (d) {
          setDoctor(d);
          setAvailability(d.availability || {});
          setSlots(d.time_slots || DEFAULT_SLOTS);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ availability, time_slots: slots, updated_at: new Date().toISOString() })
        .eq('user_id', user!.id);
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Availability & Time Slots</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your working days and consultation slots</p>
      </div>

      {success && <Alert type="success" message="Availability updated successfully!" onClose={() => setSuccess(false)} />}

      {/* Days */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" /> Available Days
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {DAYS.map((day) => (
            <button
              key={day.key}
              onClick={() => setAvailability((prev) => ({ ...prev, [day.key]: !prev[day.key] }))}
              className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                availability[day.key]
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
              }`}
            >
              {day.label.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" /> Time Slots
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {slots.map((slot) => (
            <div key={slot} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
              {slot}
              <button
                onClick={() => setSlots(slots.filter((s) => s !== slot))}
                className="ml-1 text-slate-400 hover:text-error-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="time"
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
            className="input-field text-sm py-2"
          />
          <Button
            onClick={() => {
              if (newSlot) {
                const formatted = new Date(`2000-01-01T${newSlot}`).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
                if (!slots.includes(formatted)) setSlots([...slots, formatted].sort());
                setNewSlot('');
              }
            }}
          >
            Add Slot
          </Button>
        </div>
      </div>

      <Button onClick={handleSave} loading={saving} size="lg">
        <Save className="w-4 h-4" /> Save Availability
      </Button>
    </div>
  );
}
