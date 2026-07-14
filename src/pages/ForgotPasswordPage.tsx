import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { AuthShell } from './RegisterPage';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="We'll send you a link to reset your password">
      {sent ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Check your email</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            We've sent a password reset link to <span className="font-medium">{email}</span>
          </p>
          <Link to="/login">
            <Button variant="outline" fullWidth>
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {error && <Alert message={error} onClose={() => setError('')} className="mb-4" />}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" loading={loading} fullWidth size="lg">
              Send Reset Link
            </Button>
          </form>
          <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </>
      )}
    </AuthShell>
  );
}
