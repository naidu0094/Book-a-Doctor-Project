import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthUser, UserRole } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        loadUserProfile(data.session.user.id, data.session.user.email ?? '');
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setLoading(false);
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await loadUserProfile(session.user.id, session.user.email ?? '');
        }
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadUserProfile(userId: string, email: string) {
    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('full_name')
        .eq('user_id', userId)
        .maybeSingle();

      if (patient) {
        setUser({ id: userId, email, role: 'patient', fullName: patient.full_name });
        setLoading(false);
        return;
      }

      const { data: doctor } = await supabase
        .from('doctors')
        .select('full_name')
        .eq('user_id', userId)
        .maybeSingle();

      if (doctor) {
        setUser({ id: userId, email, role: 'doctor', fullName: doctor.full_name });
        setLoading(false);
        return;
      }

      setUser({ id: userId, email, role: 'admin', fullName: 'Administrator' });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, role: UserRole, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, full_name: fullName } },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Sign up failed');

    if (role === 'patient') {
      const { error: profileError } = await supabase.from('patients').insert({
        user_id: data.user.id,
        full_name: fullName,
        email,
      });
      if (profileError) throw profileError;
    } else if (role === 'doctor') {
      const { error: profileError } = await supabase.from('doctors').insert({
        user_id: data.user.id,
        full_name: fullName,
        email,
        specialization: 'General Physician',
        consultation_fee: 0,
        status: 'pending',
        verified: false,
      });
      if (profileError) throw profileError;
    }

    await loadUserProfile(data.user.id, email);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
