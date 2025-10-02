import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Admin {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const useAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const checkAdminStatus = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setAdmin(null);
        return false;
      }

      if (!data) {
        setAdmin(null);
        return false;
      }

      setAdmin(data);
      return true;
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setAdmin(null);
      return false;
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    // Check for existing session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isSubscribed) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkAdminStatus(session.user.id);
      } else {
        setAdmin(null);
      }
      
      setLoading(false);
      setInitialized(true);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!initialized) return; // Skip until initial check is done
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setAdmin(null);
        }
      }
    );

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [checkAdminStatus, initialized]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setAdmin(null);
  };

  const isAdmin = !!admin;

  return {
    user,
    session,
    admin,
    loading,
    isAdmin,
    signIn,
    signOut,
  };
};