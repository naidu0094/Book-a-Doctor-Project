import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, SearchX } from 'lucide-react';
import { getDoctors, getDepartments, getCities, getHospitals, type DoctorFilters } from '../services/doctorService';
import type { Doctor, Department } from '../types';
import DoctorCard from '../components/doctor/DoctorCard';
import { DoctorCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/Alert';
import Select from '../components/ui/Select';

const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Malayalam', 'Urdu', 'Gujarati', 'Marathi', 'Rajasthani'];
const SPECIALIZATIONS = [
  'Cardiologist', 'Dermatologist', 'Neurologist', 'Dentist', 'Orthopedic',
  'Gynecologist', 'Pediatrician', 'ENT Specialist', 'Psychiatrist', 'Ophthalmologist',
  'Urologist', 'Oncologist', 'Pulmonologist', 'Endocrinologist', 'General Physician',
];

export default function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [_departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState<DoctorFilters>({
    search: searchParams.get('search') || '',
    specialization: searchParams.get('specialization') || '',
    city: '',
    minRating: undefined,
    minFee: undefined,
    maxFee: undefined,
    minExperience: undefined,
    gender: 'all',
    language: 'all',
    hospital: 'all',
    sort: 'rating',
  });

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => {});
    getCities().then(setCities).catch(() => {});
    getHospitals().then(setHospitals).catch(() => {});
  }, []);

  const fetchDoctors = useCallback(async (f: DoctorFilters) => {
    setLoading(true);
    try {
      const data = await getDoctors(f);
      setDoctors(data);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors({ ...filters, search });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    fetchDoctors(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const updateFilter = (key: keyof DoctorFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value === '' || value === 'all' ? undefined : value }));
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({
      search: '',
      specialization: '',
      city: '',
      minRating: undefined,
      minFee: undefined,
      maxFee: undefined,
      minExperience: undefined,
      gender: 'all',
      language: 'all',
      hospital: 'all',
      sort: 'rating',
    });
    setSearchParams({});
  };

  const activeFilterCount = [
    filters.specialization, filters.city, filters.minRating, filters.minFee,
    filters.maxFee, filters.minExperience,
    filters.gender !== 'all' ? filters.gender : undefined,
    filters.language !== 'all' ? filters.language : undefined,
    filters.hospital !== 'all' ? filters.hospital : undefined,
  ].filter(Boolean).length;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Find Your Doctor</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {loading ? 'Searching...' : `${doctors.length} doctors available`}
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by doctor name, hospital, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary-600 text-white">{activeFilterCount}</span>
            )}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 flex-shrink-0`}>
            <div className="card p-5 sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              <div>
                <Select
                  label="Specialization"
                  value={filters.specialization || ''}
                  onChange={(e) => updateFilter('specialization', e.target.value)}
                  options={SPECIALIZATIONS.map((s) => ({ value: s, label: s }))}
                  placeholder="All specializations"
                />
              </div>

              <div>
                <Select
                  label="City"
                  value={filters.city || ''}
                  onChange={(e) => updateFilter('city', e.target.value)}
                  options={cities.map((c) => ({ value: c, label: c }))}
                  placeholder="All cities"
                />
              </div>

              <div>
                <Select
                  label="Hospital"
                  value={filters.hospital || 'all'}
                  onChange={(e) => updateFilter('hospital', e.target.value)}
                  options={hospitals.map((h) => ({ value: h, label: h }))}
                  placeholder="All hospitals"
                />
              </div>

              <div>
                <Select
                  label="Gender"
                  value={filters.gender || 'all'}
                  onChange={(e) => updateFilter('gender', e.target.value)}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                  ]}
                  placeholder="Any gender"
                />
              </div>

              <div>
                <Select
                  label="Language"
                  value={filters.language || 'all'}
                  onChange={(e) => updateFilter('language', e.target.value)}
                  options={LANGUAGES.map((l) => ({ value: l, label: l }))}
                  placeholder="Any language"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Min Rating
                </label>
                <div className="flex gap-2">
                  {[4.5, 4.0, 3.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateFilter('minRating', filters.minRating === r ? undefined : r)}
                      className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        filters.minRating === r
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {r}+
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Min Experience
                </label>
                <div className="flex gap-2">
                  {[5, 10, 15].map((y) => (
                    <button
                      key={y}
                      onClick={() => updateFilter('minExperience', filters.minExperience === y ? undefined : y)}
                      className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        filters.minExperience === y
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {y}+ yrs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Fee Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minFee ?? ''}
                    onChange={(e) => updateFilter('minFee', e.target.value ? Number(e.target.value) : undefined)}
                    className="input-field text-sm py-2"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxFee ?? ''}
                    onChange={(e) => updateFilter('maxFee', e.target.value ? Number(e.target.value) : undefined)}
                    className="input-field text-sm py-2"
                  />
                </div>
              </div>

              <div>
                <Select
                  label="Sort By"
                  value={filters.sort || 'rating'}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  options={[
                    { value: 'rating', label: 'Highest Rated' },
                    { value: 'fee-low', label: 'Fee: Low to High' },
                    { value: 'fee-high', label: 'Fee: High to Low' },
                    { value: 'experience', label: 'Most Experienced' },
                  ]}
                />
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <DoctorCardSkeleton key={i} />)}
              </div>
            ) : doctors.length === 0 ? (
              <EmptyState
                icon={<SearchX className="w-7 h-7" />}
                title="No doctors found"
                message="Try adjusting your search or filters to find what you're looking for."
                action={
                  <button onClick={clearFilters} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                    Clear all filters
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
