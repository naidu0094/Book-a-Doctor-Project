import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ShieldCheck, Clock, HeartPulse, Star, ChevronDown, Stethoscope,
  CalendarCheck, Video, Award, Users, Activity, Download, Quote, FileText,
} from 'lucide-react';
import { getPopularDoctors, getTopRatedDoctors, getDepartments } from '../services/doctorService';
import type { Doctor, Department } from '../types';
import DoctorCard from '../components/doctor/DoctorCard';
import { DoctorCardSkeleton } from '../components/ui/Skeleton';
import Rating from '../components/ui/Rating';

const SPECIALIZATIONS = [
  'Cardiologist', 'Dermatologist', 'Neurologist', 'Dentist', 'Orthopedic',
  'Gynecologist', 'Pediatrician', 'ENT Specialist', 'Psychiatrist', 'Ophthalmologist',
];

const TESTIMONIALS = [
  { name: 'Rahul Kumar', role: 'Patient', text: 'Book A Doctor made it incredibly easy to find a cardiologist near me. The booking process was smooth and the doctor was excellent!', rating: 5 },
  { name: 'Sneha Patel', role: 'Patient', text: 'I love how I can manage all my appointments and medical reports in one place. The reminders are a lifesaver for someone like me with a busy schedule.', rating: 5 },
  { name: 'Arjun Singh', role: 'Patient', text: 'The video consultation feature saved me a trip to the hospital. The doctor was thorough and the prescription was available immediately after.', rating: 4 },
];

const FAQS = [
  { q: 'How do I book an appointment?', a: 'Search for a doctor by specialization or name, view their profile, select an available date and time slot, complete the payment, and your appointment is confirmed instantly.' },
  { q: 'Can I cancel or reschedule my appointment?', a: 'Yes, you can cancel or reschedule any appointment from your dashboard. Cancellations made 24 hours before the appointment are fully refundable.' },
  { q: 'Do you offer video consultations?', a: 'Yes, many of our doctors offer video consultations. Look for the video icon on doctor profiles and select the video option during booking.' },
  { q: 'How do I access my prescriptions?', a: 'All prescriptions are available in your patient dashboard under the Prescriptions section. You can download them as PDF at any time.' },
  { q: 'Is my medical data secure?', a: 'Absolutely. We use industry-standard encryption and follow healthcare data protection regulations. Your data is never shared with third parties.' },
];

const STATS = [
  { icon: Users, label: 'Happy Patients', value: '50K+' },
  { icon: Stethoscope, label: 'Expert Doctors', value: '500+' },
  { icon: CalendarCheck, label: 'Appointments', value: '100K+' },
  { icon: Award, label: 'Specializations', value: '15+' },
];

const FEATURES = [
  { icon: Search, title: 'Easy Doctor Search', desc: 'Find doctors by specialization, city, hospital, rating, and availability with our advanced search filters.' },
  { icon: CalendarCheck, title: 'Instant Booking', desc: 'Book appointments in seconds with real-time availability and instant confirmation.' },
  { icon: Video, title: 'Video Consultations', desc: 'Connect with doctors from the comfort of your home via secure video calls.' },
  { icon: FileTextIcon, title: 'Digital Prescriptions', desc: 'Access your prescriptions online and download them as PDF anytime, anywhere.' },
  { icon: ShieldCheck, title: 'Verified Doctors', desc: 'Every doctor on our platform is verified and credentials-checked for your safety.' },
  { icon: Clock, title: '24/7 Support', desc: 'Our support team is available round the clock to assist you with any queries.' },
];

function FileTextIcon(props: { className?: string }) {
  return <FileText {...props} />;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [popular, setPopular] = useState<Doctor[]>([]);
  const [topRated, setTopRated] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    Promise.all([getPopularDoctors(4), getTopRatedDoctors(4), getDepartments()])
      .then(([p, t, d]) => {
        setPopular(p);
        setTopRated(t);
        setDepartments(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (specialization) params.set('specialization', specialization);
    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-pattern">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-secondary-50/50 dark:from-primary-950/20 dark:to-secondary-950/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-5">
                <HeartPulse className="w-4 h-4" />
                Trusted by 50,000+ patients
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight text-balance">
                Your Health,{' '}
                <span className="text-primary-600 dark:text-primary-400">One Click</span>{' '}
                Away
              </h1>
              <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 max-w-xl">
                Book appointments with top-rated doctors near you. Search by specialization,
                compare fees, and get instant confirmations.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="mt-8 glass p-2 rounded-2xl flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search doctor, hospital, or city"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 py-2"
                  />
                </div>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 text-sm text-slate-700 dark:text-slate-300 outline-none border border-slate-200 dark:border-slate-700"
                >
                  <option value="">All Specializations</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap"
                >
                  Search
                </button>
              </form>

              <div className="mt-8 flex flex-wrap gap-2">
                {SPECIALIZATIONS.slice(0, 6).map((s) => (
                  <Link
                    key={s}
                    to={`/doctors?specialization=${s}`}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Doctor consultation"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent" />
              </div>
              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 glass-strong rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Appointment Booked</p>
                    <p className="text-xs text-slate-500">Dr. Arjun Reddy, 10:00 AM</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -top-4 -right-4 glass-strong rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">4.9 Rating</p>
                    <p className="text-xs text-slate-500">1,250+ reviews</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Browse by Specialization</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Find the right specialist for your health needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {departments.map((dept, i) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/doctors?specialization=${dept.name}`}
                  className="card card-hover p-5 text-center block"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-3">
                    <Stethoscope className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{dept.name}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Doctors */}
      <section className="py-16 lg:py-20 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Popular Doctors</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Most booked doctors this week</p>
            </div>
            <Link to="/doctors" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? [...Array(4)].map((_, i) => <DoctorCardSkeleton key={i} />)
              : popular.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Choose Us</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Experience healthcare the modern way</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card card-hover p-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Doctors */}
      <section className="py-16 lg:py-20 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Top Rated Doctors</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Highest rated by our patients</p>
            </div>
            <Link to="/doctors" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? [...Array(4)].map((_, i) => <DoctorCardSkeleton key={i} />)
              : topRated.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Patient Testimonials</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">What our patients say about us</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card p-6"
              >
                <Quote className="w-8 h-8 text-primary-200 dark:text-primary-800 mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">"{t.text}"</p>
                <Rating value={t.rating} size="sm" showValue={false} />
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 lg:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <Activity className="absolute top-4 left-8 w-24 h-24 text-white" />
              <HeartPulse className="absolute bottom-4 right-8 w-32 h-32 text-white" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-3">Download Our Mobile App</h2>
              <p className="text-primary-100 max-w-xl mx-auto mb-6">
                Book appointments, set medicine reminders, and access your medical records on the go.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors">
                  <Download className="w-5 h-5" />
                  App Store
                </button>
                <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors">
                  <Download className="w-5 h-5" />
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Everything you need to know</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
