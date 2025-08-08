import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsRequest {
  action: 'view' | 'engagement' | 'report';
  contentType: 'article' | 'podcast';
  contentId?: string;
  data?: {
    timeSpent?: number;
    scrollDepth?: number;
    source?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { action, contentType, contentId, data }: AnalyticsRequest = await req.json();

    console.log(`Analytics: ${action} for ${contentType} ${contentId}`);

    let result;

    switch (action) {
      case 'view':
        if (!contentId) throw new Error('Content ID required');

        // Increment view count atomically
        const { data: updatedContent, error: viewError } = await supabase
          .from(contentType === 'article' ? 'articles' : 'podcasts')
          .update({
            view_count: supabase.raw('view_count + 1')
          })
          .eq('id', contentId)
          .select('view_count')
          .single();

        if (viewError) throw viewError;
        result = { viewCount: updatedContent.view_count };
        break;

      case 'engagement':
        // Process engagement metrics (time spent, scroll depth, etc.)
        const engagementData = {
          content_id: contentId,
          content_type: contentType,
          time_spent: data?.timeSpent || 0,
          scroll_depth: data?.scrollDepth || 0,
          source: data?.source || 'direct',
          created_at: new Date().toISOString(),
        };

        // Background task to log engagement
        EdgeRuntime.waitUntil(
          supabase.rpc('log_access_attempt', {
            user_id: null,
            action: 'content_engagement',
            resource: `${contentType}_${contentId}`,
            success: true,
          }).catch(console.error)
        );

        result = { tracked: true };
        break;

      case 'report':
        // Generate analytics report (admin only)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          throw new Error('Authorization required for reports');
        }

        const supabaseAuth = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          {
            global: {
              headers: { Authorization: authHeader },
            },
          }
        );

        const { data: { user } } = await supabaseAuth.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { data: profile } = await supabaseAuth
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'admin') {
          throw new Error('Admin access required');
        }

        // Generate comprehensive analytics
        const [articlesStats, podcastsStats] = await Promise.all([
          supabase.from('articles').select('view_count, created_at').eq('status', 'published'),
          supabase.from('podcasts').select('view_count, created_at').eq('status', 'published'),
        ]);

        const totalViews = [
          ...(articlesStats.data || []),
          ...(podcastsStats.data || [])
        ].reduce((sum, item) => sum + (item.view_count || 0), 0);

        result = {
          totalArticles: articlesStats.data?.length || 0,
          totalPodcasts: podcastsStats.data?.length || 0,
          totalViews,
          generatedAt: new Date().toISOString(),
        };
        break;

      default:
        throw new Error('Invalid analytics action');
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in content-analytics function:', error);
    
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