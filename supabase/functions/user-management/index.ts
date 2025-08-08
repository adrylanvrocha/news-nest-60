import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserManagementRequest {
  action: 'promote' | 'demote' | 'ban' | 'unban' | 'get_stats';
  userId?: string;
  role?: 'admin' | 'editor' | 'subscriber';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase clients
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

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

    const { action, userId, role }: UserManagementRequest = await req.json();

    console.log(`User management: ${action} by admin ${currentUser.id}`);

    let result;

    switch (action) {
      case 'promote':
      case 'demote':
        if (!userId || !role) {
          throw new Error('User ID and role are required');
        }

        // Validate role
        if (!['admin', 'editor', 'subscriber'].includes(role)) {
          throw new Error('Invalid role');
        }

        // Update user role with validation
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', userId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Log the role change for audit
        await supabase.rpc('log_access_attempt', {
          user_id: currentUser.id,
          action: `role_change_${action}`,
          resource: `user_${userId}_to_${role}`,
          success: true,
        }).catch(console.error);

        result = { updatedProfile };
        break;

      case 'ban':
        if (!userId) throw new Error('User ID required');

        // Disable user account using admin client
        const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { ban_duration: 'permanent' }
        );

        if (banError) throw banError;

        // Log the ban action
        await supabase.rpc('log_access_attempt', {
          user_id: currentUser.id,
          action: 'user_banned',
          resource: `user_${userId}`,
          success: true,
        }).catch(console.error);

        result = { banned: true };
        break;

      case 'unban':
        if (!userId) throw new Error('User ID required');

        // Re-enable user account
        const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { ban_duration: 'none' }
        );

        if (unbanError) throw unbanError;

        result = { unbanned: true };
        break;

      case 'get_stats':
        // Get comprehensive user statistics
        const [userCounts, recentActivity] = await Promise.all([
          supabase
            .from('profiles')
            .select('role')
            .then(({ data }) => {
              const counts = { admin: 0, editor: 0, subscriber: 0 };
              data?.forEach(profile => {
                counts[profile.role as keyof typeof counts]++;
              });
              return counts;
            }),
          supabase
            .from('access_logs')
            .select('action, created_at')
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(100)
        ]);

        result = {
          userCounts,
          recentActivity: recentActivity.data || [],
        };
        break;

      default:
        throw new Error('Invalid management action');
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in user-management function:', error);
    
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