# Book A Doctor — Healthcare Appointment Platform

A production-ready healthcare appointment booking platform where patients can find doctors, book appointments, manage medical reports, and access prescriptions. Doctors can manage their practice, accept/reject appointments, write prescriptions, and track earnings. Admins can oversee the entire platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| State | Redux Toolkit, React Context |
| Forms | React Hook Form |
| Charts | Chart.js, react-chartjs-2 |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Routing | React Router DOM v6 |

## Features

### Patient
- Register / Login with JWT authentication
- Search doctors by name, hospital, city, specialization
- Filter by rating, fee, experience, gender, language, hospital
- Book appointments with date, time slot, and symptom details
- Upload medical reports
- Cancel and reschedule appointments
- View prescriptions and download reports
- Receive in-app notifications
- Edit profile with medical history

### Doctor
- Doctor dashboard with analytics (weekly appointments, status breakdown)
- Accept / reject appointment requests
- Mark appointments as completed
- Generate video consultation links
- Write digital prescriptions with medications
- View patient list and history
- Track earnings with 6-month revenue trend
- Manage availability (working days + time slots)
- Update professional profile

### Admin
- Platform overview with key metrics
- Approve / reject pending doctors
- Manage all doctors and patients
- Add / delete departments
- View revenue analytics and payment status
- Charts: doctors by department, payment distribution

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

The following are pre-configured in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Input, Modal, Badge, etc.)
│   ├── layout/       # Layout components (Navbar, Footer, DashboardLayout)
│   ├── doctor/       # Doctor-specific components (DoctorCard)
│   └── ProtectedRoute.tsx
├── context/
│   └── AuthContext.tsx    # Authentication context
├── lib/
│   └── supabase.ts        # Supabase client
├── pages/
│   ├── HomePage.tsx       # Landing page
│   ├── DoctorsPage.tsx    # Doctor search & filter
│   ├── DoctorDetailPage.tsx  # Doctor profile + booking
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── NotFoundPage.tsx
│   └── dashboard/         # Dashboard pages
│       ├── PatientDashboard.tsx
│       ├── DoctorDashboard.tsx
│       ├── AdminDashboard.tsx
│       ├── AppointmentsPage.tsx
│       ├── DoctorAppointmentsPage.tsx
│       ├── ProfilePage.tsx
│       ├── ReportsPage.tsx
│       ├── NotificationsPage.tsx
│       ├── PatientsPage.tsx
│       ├── PrescriptionsPage.tsx
│       ├── EarningsPage.tsx
│       └── AvailabilityPage.tsx
├── redux/
│   ├── store.ts
│   ├── hooks.ts
│   └── slices/
│       └── uiSlice.ts     # Dark mode, sidebar state
├── services/
│   ├── doctorService.ts      # Doctor & department API
│   ├── appointmentService.ts # Appointment CRUD
│   └── medicalService.ts     # Payments, prescriptions, reports, reviews, notifications
├── types/
│   └── index.ts          # TypeScript interfaces
└── index.css            # Global styles + Tailwind
```

## Database Schema

The platform uses Supabase (PostgreSQL) with the following tables:

- **departments** — Medical specializations
- **doctors** — Doctor profiles (linked to auth.users)
- **patients** — Patient profiles (linked to auth.users)
- **appointments** — Booking records
- **payments** — Payment transactions
- **prescriptions** — Doctor-prescribed medications
- **reports** — Patient-uploaded medical files
- **reviews** — Patient ratings and feedback
- **notifications** — In-app notifications

All tables have Row Level Security (RLS) enabled with owner-scoped policies.

## Design System

- **Primary**: #2563EB (Blue)
- **Secondary**: #10B981 (Emerald)
- **Background**: #F8FAFC (Light) / #020617 (Dark)
- **Fonts**: Inter (body), Poppins (headings)
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive**: Mobile-first design with breakpoints from 640px to 1280px

## License

MIT
