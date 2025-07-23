import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Initialize regular client for auth verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Verify current user is admin
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !currentUser) {
      throw new Error('Unauthorized: Invalid user token');
    }

    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (profileError || currentProfile?.role !== 'admin') {
      throw new Error('Unauthorized: Admin role required');
    }

    // Parse request body
    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds)) {
      throw new Error('userIds array is required');
    }

    console.log('Fetching emails for user IDs:', userIds);

    // Get all users from auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('Auth list error:', authError);
      throw new Error(`Failed to fetch users: ${authError.message}`);
    }

    // Filter and map to requested user IDs
    const emails = authData.users
      .filter(user => userIds.includes(user.id))
      .map(user => ({
        user_id: user.id,
        email: user.email,
      }));

    console.log('Found emails for users:', emails.length);

    return new Response(
      JSON.stringify({
        success: true,
        emails,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in get-user-emails function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});