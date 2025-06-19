import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Session storage utilities for Supabase
export const storeSession = async () => {
  const supabase = createClientComponentClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Store the session data in sessionStorage
    sessionStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at
    }));
  }
};

export const clearSession = () => {
  sessionStorage.removeItem('supabase.auth.token');
};

export const getStoredSession = () => {
  const stored = sessionStorage.getItem('supabase.auth.token');
  return stored ? JSON.parse(stored) : null;
}; 