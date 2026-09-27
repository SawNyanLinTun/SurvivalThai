import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { invokeFunction, supabase } from '../lib/supabase';
import { deviceId, deviceLabel } from './helpers';
import { clearClassStore } from '../data/classStore';

const AuthContext = createContext(null);

async function loadProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

// Returns an error code, or null when the session may continue.
async function checkAccess(profile, expectedRole) {
  if (!profile || profile.role === 'pending') return 'not_authorized';
  if (expectedRole && profile.role !== expectedRole) return `wrong_role_${profile.role}`;
  const { data, error } = await supabase.rpc('register_device', { p_device_id: deviceId(), p_label: deviceLabel() });
  if (error) return 'server_error';
  if (data === 'limit') return 'device_limit';
  return null;
}

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null); // error code shown on the login page after a forced sign-out

  const signOut = useCallback(async (reason = null) => {
    await supabase.auth.signOut();
    clearClassStore();
    setProfile(null);
    setNotice(reason);
  }, []);

  // Restore an existing session on page load.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user) {
        try {
          const p = await loadProfile(user.id);
          const problem = await checkAccess(p);
          if (problem) await signOut(problem);
          else if (active) setProfile(p);
        } catch {
          await signOut('server_error');
        }
      }
      if (active) setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setProfile(null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [signOut]);

  const signIn = useCallback(
    async ({ email, password, role }) => {
      setNotice(null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(/invalid/i.test(error.message) ? 'invalid_credentials' : 'server_error');
      const p = await loadProfile(data.user.id);
      const problem = await checkAccess(p, role);
      if (problem) {
        await signOut();
        throw new Error(problem);
      }
      setProfile(p);
      return p;
    },
    [signOut]
  );

  const joinClass = useCallback(
    async ({ joinCode, fullName, email, password }) => {
      await invokeFunction('join-class', { joinCode, fullName, email, password });
      return signIn({ email, password, role: 'student' });
    },
    [signIn]
  );

  return (
    <AuthContext.Provider value={{ profile, loading, notice, signIn, signOut, joinClass, clearNotice: () => setNotice(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
