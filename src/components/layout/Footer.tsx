import { Link } from 'react-router-dom';
import { Stethoscope, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">Book A Doctor</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your trusted healthcare platform. Find and book appointments with top-rated doctors near you.
            </p>
            <div className="flex gap-3 mt-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/doctors" className="hover:text-primary-400 transition-colors">Find Doctors</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Register</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Specializations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/doctors?specialization=Cardiologist" className="hover:text-primary-400 transition-colors">Cardiology</Link></li>
              <li><Link to="/doctors?specialization=Dermatologist" className="hover:text-primary-400 transition-colors">Dermatology</Link></li>
              <li><Link to="/doctors?specialization=Neurologist" className="hover:text-primary-400 transition-colors">Neurology</Link></li>
              <li><Link to="/doctors?specialization=Pediatrician" className="hover:text-primary-400 transition-colors">Pediatrics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400" /> support@bookadoctor.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400" /> Hyderabad, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Book A Doctor. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
