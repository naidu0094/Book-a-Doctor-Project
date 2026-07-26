import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center">
        <div className="relative inline-block">
          <p className="text-[120px] sm:text-[160px] font-bold text-primary-600 dark:text-primary-400 leading-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Search className="w-12 h-12 text-primary-400" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Page Not Found</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/"><Button><Home className="w-4 h-4" /> Go Home</Button></Link>
          <Link to="/doctors"><Button variant="outline"><Search className="w-4 h-4" /> Find Doctors</Button></Link>
        </div>
      </div>
    </div>
  );
}
