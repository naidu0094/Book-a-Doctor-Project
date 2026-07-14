import { useEffect, useState, useRef } from 'react';
import { FileText, Upload, Trash2, Download, FileImage, File } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getReportsByPatient, uploadReport, deleteReport } from '../../services/medicalService';
import type { Report, Patient } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Alert, { EmptyState } from '../../components/ui/Alert';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

export default function ReportsPage() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: p } = await supabase.from('patients').select('*').eq('user_id', user.id).maybeSingle();
        if (p) {
          setPatient(p);
          const r = await getReportsByPatient(p.id);
          setReports(r);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !patient) return;
    setUploading(true);
    setError('');
    try {
      const report = await uploadReport(file, patient.id);
      setReports((prev) => [report, ...prev]);
      setUploadOpen(false);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Failed to delete report');
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Medical Reports</h1>
          <p className="text-slate-600 dark:text-slate-400">Upload and manage your medical documents</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}><Upload className="w-4 h-4" /> Upload Report</Button>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-7 h-7" />}
          title="No reports uploaded"
          message="Upload your medical reports, lab results, and prescriptions to keep them accessible anytime."
          action={<Button onClick={() => setUploadOpen(true)}><Upload className="w-4 h-4" /> Upload Now</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="card card-hover p-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  {report.file_type?.includes('image') ? <FileImage className="w-6 h-6" /> : <File className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{report.file_name}</p>
                  <p className="text-xs text-slate-500">{new Date(report.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button size="sm" variant="outline" fullWidth><Download className="w-3.5 h-3.5" /> View</Button>
                </a>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(report.id)} className="text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Medical Report">
        <form onSubmit={handleUpload} className="space-y-4">
          {error && <Alert message={error} onClose={() => setError('')} />}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select File</label>
            <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" required className="input-field text-sm py-2" />
            <p className="mt-1 text-xs text-slate-500">Supported: Images, PDF, DOC (Max 10MB)</p>
          </div>
          <Button type="submit" fullWidth loading={uploading}>Upload</Button>
        </form>
      </Modal>
    </div>
  );
}
