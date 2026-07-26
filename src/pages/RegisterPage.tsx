import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Mail, Lock, User, Phone, Heart, Activity } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import type { UserRole } from '../types';

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('patient');
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setLoading(true);
    try {
      await signUp(data.email, data.password, role, data.fullName);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join thousands of patients and doctors on Book A Doctor">
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">I am a...</p>
        <div className="grid grid-cols-2 gap-3">
          <RoleCard active={role === 'patient'} onClick={() => setRole('patient')} icon={<Heart className="w-5 h-5" />} label="Patient" desc="Book appointments" />
          <RoleCard active={role === 'doctor'} onClick={() => setRole('doctor')} icon={<Activity className="w-5 h-5" />} label="Doctor" desc="Manage practice" />
        </div>
      </div>

      {error && <Alert message={error} onClose={() => setError('')} className="mb-4" />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="John Doe"
          icon={<User className="w-4 h-4" />}
          error={errors.fullName?.message}
          {...register('fullName', { required: 'Full name is required' })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
          })}
        />
        <Input
          label="Phone"
          placeholder="+91 98765 43210"
          icon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
          {...register('phone', { required: 'Phone is required' })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 6 characters"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
          icon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === password || 'Passwords do not match',
          })}
        />
        <Button type="submit" loading={loading} fullWidth size="lg">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

function RoleCard({ active, onClick, icon, label, desc }: { active: boolean; onClick: () => void; icon: ReactNode; label: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 text-left transition-all ${
        active
          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${active ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
        {icon}
      </div>
      <p className="font-semibold text-slate-900 dark:text-slate-100">{label}</p>
      <p className="text-xs text-slate-500">{desc}</p>
    </button>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Stethoscope className="absolute top-20 left-20 w-40 h-40 text-white" />
          <Heart className="absolute bottom-20 right-20 w-32 h-32 text-white" />
        </div>
        <div className="relative flex flex-col justify-center px-12 text-white">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl">Book A Doctor</span>
          </Link>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Your health journey starts here
          </h2>
          <p className="text-primary-100 text-lg max-w-md">
            Book appointments with verified doctors, access digital prescriptions, and manage your health records — all in one place.
          </p>
          <div className="mt-8 space-y-3">
            {['500+ verified doctors', '15+ specializations', '24/7 customer support'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-primary-100">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900 dark:text-white">Book A Doctor</span>
            </Link>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
