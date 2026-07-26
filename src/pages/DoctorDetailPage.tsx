import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Building2, Clock, Award, Languages, Calendar, ArrowLeft,
  CheckCircle, Video, FileText, ShieldCheck, Stethoscope,
} from 'lucide-react';
import { getDoctorById } from '../services/doctorService';
import { getReviewsByDoctor } from '../services/medicalService';
import { createAppointment } from '../services/appointmentService';
import { createNotification, uploadReport, createPayment } from '../services/medicalService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Doctor, Review } from '../types';
import Rating from '../components/ui/Rating';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Textarea from '../components/ui/Textarea';
import Alert, { EmptyState } from '../components/ui/Alert';

const DAYS = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' }, { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' }, { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'success'>('details');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getDoctorById(id), getReviewsByDoctor(id)])
      .then(([d, r]) => {
        setDoctor(d);
        setReviews(r);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const next14Days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const isDayAvailable = (date: Date) => {
    if (!doctor?.availability) return false;
    const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
    return doctor.availability[dayKey];
  };

  const handleBookClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/doctors/${id}` } });
      return;
    }
    if (user.role !== 'patient') {
      setBookingError('Only patients can book appointments.');
      return;
    }
    setBookingOpen(true);
  };

  const handleConfirmBooking = async () => {
    setBookingError('');
    setBookingLoading(true);
    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (!patient) throw new Error('Patient profile not found');

      const appointment = await createAppointment({
        patient_id: patient.id,
        doctor_id: doctor!.id,
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        symptoms,
      });

      if (reportFile) {
        try {
          await uploadReport(reportFile, patient.id, appointment.id);
        } catch {
          // Bucket may not exist; don't block booking
        }
      }

      await createPayment({
        appointment_id: appointment.id,
        patient_id: patient.id,
        doctor_id: doctor!.id,
        amount: doctor!.consultation_fee,
        method: 'card',
        transaction_id: `txn_${Date.now()}`,
      });

      if (doctor!.user_id) {
        try {
          await createNotification({
            user_id: doctor!.user_id,
            title: 'New Appointment Booking',
            message: `${user!.fullName} booked an appointment on ${selectedDate} at ${selectedSlot}`,
            type: 'appointment',
          });
        } catch {
          // Notification is non-critical
        }
      }

      setBookingStep('success');
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <EmptyState icon={<Stethoscope className="w-7 h-7" />} title="Doctor not found" message="The doctor you're looking for doesn't exist." action={<Link to="/doctors"><Button>Browse Doctors</Button></Link>} />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/doctors" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to doctors
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <img
                  src={doctor.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.full_name)}&background=2563EB&color=fff&size=200`}
                  alt={doctor.full_name}
                  className="w-28 h-28 rounded-2xl object-cover ring-4 ring-primary-100 dark:ring-primary-900/40"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{doctor.full_name}</h1>
                      <p className="text-primary-600 dark:text-primary-400 font-medium">{doctor.specialization}</p>
                    </div>
                    {doctor.verified && <Badge variant="success"><ShieldCheck className="w-3 h-3 mr-1 inline" /> Verified</Badge>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" /> {doctor.hospital}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {doctor.city}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {doctor.experience} yrs exp</span>
                  </div>
                  <div className="mt-3">
                    <Rating value={doctor.rating} reviews={doctor.patients_treated} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {doctor.languages?.map((lang) => (
                      <Badge key={lang} variant="neutral">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* About */}
            {doctor.biography && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">About</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{doctor.biography}</p>
              </div>
            )}

            {/* Qualifications */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Qualifications & Experience</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoRow icon={Award} label="Qualification" value={doctor.qualification || 'N/A'} />
                <InfoRow icon={Clock} label="Experience" value={`${doctor.experience} years`} />
                <InfoRow icon={Building2} label="Hospital" value={doctor.hospital || 'N/A'} />
                <InfoRow icon={FileText} label="License" value={doctor.license_number || 'N/A'} />
                <InfoRow icon={Languages} label="Languages" value={doctor.languages?.join(', ') || 'N/A'} />
                <InfoRow icon={MapPin} label="Clinic Address" value={doctor.clinic_address || 'N/A'} />
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Patient Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300">
                          {review.patient?.full_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{review.patient?.full_name || 'Anonymous'}</p>
                          <Rating value={review.rating} size="sm" showValue={false} />
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right - Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500">Consultation Fee</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">₹{doctor.consultation_fee}</p>
              </div>

              <div className="py-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Video className="w-4 h-4 text-secondary-500" /> Video consultation available
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="w-4 h-4 text-success-500" /> Instant confirmation
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <FileText className="w-4 h-4 text-primary-500" /> Digital prescription
                </div>
              </div>

              {/* Availability */}
              <div className="py-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Availability</p>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((d) => (
                    <span
                      key={d.key}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        doctor.availability?.[d.key]
                          ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 line-through'
                      }`}
                    >
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>

              <Button fullWidth size="lg" className="mt-4" onClick={handleBookClick}>
                <Calendar className="w-5 h-5" /> Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal open={bookingOpen} onClose={() => { setBookingOpen(false); setBookingStep('details'); }} title="Book Appointment" size="lg">
        {bookingStep === 'details' && (
          <div className="space-y-5">
            {bookingError && <Alert message={bookingError} onClose={() => setBookingError('')} />}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Date
              </label>
              <div className="grid grid-cols-7 gap-2">
                {next14Days.map((d) => {
                  const dateStr = d.toISOString().split('T')[0];
                  const available = isDayAvailable(d);
                  return (
                    <button
                      key={dateStr}
                      disabled={!available}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        selectedDate === dateStr
                          ? 'bg-primary-600 text-white'
                          : available
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <p className="text-[10px] uppercase">{d.toLocaleDateString('en', { weekday: 'short' })}</p>
                      <p className="text-sm font-semibold">{d.getDate()}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(doctor.time_slots || []).map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedSlot === slot
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedSlot && (
              <>
                <Textarea
                  label="Symptoms / Reason for visit"
                  placeholder="Describe your symptoms..."
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Upload Medical Report (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                    className="input-field text-sm py-2"
                  />
                  {reportFile && <p className="mt-1 text-xs text-success-600">Selected: {reportFile.name}</p>}
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Consultation Fee</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">₹{doctor.consultation_fee}</span>
                </div>

                <Button fullWidth size="lg" loading={bookingLoading} onClick={handleConfirmBooking}>
                  Pay & Confirm Booking
                </Button>
              </>
            )}
          </div>
        )}

        {bookingStep === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Appointment Confirmed!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Your appointment with {doctor.full_name} on {selectedDate} at {selectedSlot} has been confirmed.
            </p>
            <div className="flex gap-3">
              <Link to="/dashboard/appointments"><Button fullWidth>View Appointments</Button></Link>
              <Button variant="outline" onClick={() => { setBookingOpen(false); setBookingStep('details'); }}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Award; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}
