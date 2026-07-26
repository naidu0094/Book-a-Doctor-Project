import { Link } from 'react-router-dom';
import { MapPin, Building2, Clock } from 'lucide-react';
import type { Doctor } from '../../types';
import Rating from '../ui/Rating';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface DoctorCardProps {
  doctor: Doctor;
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const availableDays = DAYS.filter((d) => doctor.availability?.[d]).map((d) => DAY_LABELS[d]);

  return (
    <div className="card card-hover p-5 flex flex-col">
      <div className="flex items-start gap-4">
        <img
          src={doctor.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.full_name)}&background=2563EB&color=fff&size=128`}
          alt={doctor.full_name}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900/40"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{doctor.full_name}</h3>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{doctor.specialization}</p>
          <div className="flex items-center gap-1 mt-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-xs text-slate-500 truncate">{doctor.hospital}</p>
          </div>
        </div>
        {doctor.verified && <Badge variant="success">Verified</Badge>}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {doctor.city || 'N/A'}
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {doctor.experience} yrs exp
        </div>
      </div>

      <div className="mt-3">
        <Rating value={doctor.rating} size="sm" reviews={doctor.patients_treated} />
      </div>

      {availableDays.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {availableDays.map((d) => (
            <span key={d} className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {d}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">₹{doctor.consultation_fee}</span>
          <span className="text-xs text-slate-500 ml-1">consultation</span>
        </div>
        <Link to={`/doctors/${doctor.id}`}>
          <Button size="sm">Book Now</Button>
        </Link>
      </div>
    </div>
  );
}
