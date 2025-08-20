import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/integrations/supabase/types';

export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    "https://ghtdsyjuatsfombkrusu.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodGRzeWp1YXRzZm9tYmtydXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTU3NTUsImV4cCI6MjA2ODY3MTc1NX0.r_fHxlAx7y_Qpu-n92V_Keg8qvlaMrK_q-5806aqv2U"
  );
}