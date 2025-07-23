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
    const { email, password, firstName, lastName, role } = await req.json();

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    console.log('Creating user with email:', email, 'role:', role);

    // Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('User creation failed: No user returned');
    }

    console.log('User created in auth:', authData.user.id);

    // Create/update profile with role
    const { error: profileUpsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        first_name: firstName || null,
        last_name: lastName || null,
        role: role || 'subscriber',
      });

    if (profileUpsertError) {
      console.error('Profile creation error:', profileUpsertError);
      // Try to clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create user profile: ${profileUpsertError.message}`);
    }

    console.log('Profile created/updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          firstName,
          lastName,
          role: role || 'subscriber',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-admin-user function:', error);
    
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