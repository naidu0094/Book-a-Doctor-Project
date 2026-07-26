import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Stethoscope, Menu, X, Calendar, User, LogOut, Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DarkModeToggle from '../ui/DarkModeToggle';

export default function PublicNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400'
    }`;

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-slate-200/60 dark:border-slate-800/60">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
              Book A Doctor
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={linkClass} end>
              <span className="flex items-center gap-1.5"><HomeIcon className="w-4 h-4" /> Home</span>
            </NavLink>
            <NavLink to="/doctors" className={linkClass}>
              Doctors
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={linkClass}>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Appointments</span>
              </NavLink>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <DarkModeToggle />
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user.fullName.split(' ')[0]}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <NavLink to="/" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" end onClick={() => setMobileOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/doctors" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
              Doctors
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                Appointments
              </NavLink>
            )}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              {user ? (
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="flex-1 text-center px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700" onClick={() => setMobileOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="flex-1 text-center px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 text-white" onClick={() => setMobileOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
