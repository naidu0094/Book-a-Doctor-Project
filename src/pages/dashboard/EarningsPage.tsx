import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getPaymentsByDoctor } from '../../services/medicalService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Payment, Doctor } from '../../types';
import Badge from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/Alert';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function EarningsPage() {
  const { user } = useAuth();
  const [_doctor, setDoctor] = useState<Doctor | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: d } = await supabase.from('doctors').select('*').eq('user_id', user.id).maybeSingle();
        if (d) {
          setDoctor(d);
          const pays = await getPaymentsByDoctor(d.id);
          setPayments(pays);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <DashboardSkeleton />;

  const completed = payments.filter((p) => p.status === 'completed');
  const totalEarnings = completed.reduce((sum, p) => sum + p.amount, 0);
  const thisMonth = completed.filter((p) => new Date(p.created_at).getMonth() === new Date().getMonth());
  const monthEarnings = thisMonth.reduce((sum, p) => sum + p.amount, 0);

  // Monthly chart
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d;
  });
  const chartData = {
    labels: months.map((d) => d.toLocaleDateString('en', { month: 'short' })),
    datasets: [{
      label: 'Earnings (₹)',
      data: months.map((d) => {
        const m = d.getMonth();
        const y = d.getFullYear();
        return completed
          .filter((p) => new Date(p.created_at).getMonth() === m && new Date(p.created_at).getFullYear() === y)
          .reduce((sum, p) => sum + p.amount, 0);
      }),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings</h1>
        <p className="text-slate-600 dark:text-slate-400">Track your revenue and payment history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-success-50 dark:bg-success-900/20 flex items-center justify-center mb-3 text-success-600">
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalEarnings}</p>
          <p className="text-sm text-slate-500">Total Earnings</p>
        </div>
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-3 text-primary-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{monthEarnings}</p>
          <p className="text-sm text-slate-500">This Month</p>
        </div>
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center mb-3 text-secondary-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{completed.length}</p>
          <p className="text-sm text-slate-500">Total Transactions</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Earnings Trend (6 months)</h3>
        <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Payment History</h3>
        {completed.length === 0 ? (
          <EmptyState icon={<DollarSign className="w-7 h-7" />} title="No payments yet" message="Payments from appointments will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Patient</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="py-3 text-slate-600 dark:text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-slate-900 dark:text-white">#{p.patient_id.slice(0, 8)}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">₹{p.amount}</td>
                    <td className="py-3"><Badge variant="success">{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
