import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/integrations/supabase/types';

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    "https://ghtdsyjuatsfombkrusu.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodGRzeWp1YXRzZm9tYmtydXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTU3NTUsImV4cCI6MjA2ODY3MTc1NX0.r_fHxlAx7y_Qpu-n92V_Keg8qvlaMrK_q-5806aqv2U",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}