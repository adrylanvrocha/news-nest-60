import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArticleRequest {
  action: 'create' | 'update' | 'publish' | 'feature' | 'delete';
  articleId?: string;
  data?: {
    title?: string;
    content?: string;
    excerpt?: string;
    categoryId?: string;
    tags?: string[];
    featuredImageUrl?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
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

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized: Invalid user token');
    }

    const { action, articleId, data }: ArticleRequest = await req.json();

    console.log(`Article operation: ${action} by user ${user.id}`);

    let result;

    switch (action) {
      case 'create':
        if (!data?.title || !data?.content) {
          throw new Error('Title and content are required');
        }

        // Generate slug from title
        const slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);

        // Create article with business logic validation
        const { data: newArticle, error: createError } = await supabase
          .from('articles')
          .insert({
            title: data.title,
            content: data.content,
            excerpt: data.excerpt || data.content.substring(0, 200) + '...',
            slug: `${slug}-${Date.now()}`,
            author_id: user.id,
            category_id: data.categoryId,
            tags: data.tags || [],
            featured_image_url: data.featuredImageUrl,
            status: 'draft',
          })
          .select()
          .single();

        if (createError) throw createError;
        result = { article: newArticle };
        break;

      case 'publish':
        if (!articleId) throw new Error('Article ID required');

        // Validate article before publishing
        const { data: article, error: fetchError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', articleId)
          .single();

        if (fetchError) throw fetchError;
        if (!article.content || article.content.length < 100) {
          throw new Error('Article content too short for publishing');
        }

        const { data: publishedArticle, error: publishError } = await supabase
          .from('articles')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .eq('id', articleId)
          .select()
          .single();

        if (publishError) throw publishError;
        result = { article: publishedArticle };
        break;

      case 'feature':
        if (!articleId) throw new Error('Article ID required');

        // Check user permissions for featuring
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || !['admin', 'editor'].includes(profile.role)) {
          throw new Error('Insufficient permissions to feature articles');
        }

        const { data: featuredArticle, error: featureError } = await supabase
          .from('articles')
          .update({ is_featured: true })
          .eq('id', articleId)
          .select()
          .single();

        if (featureError) throw featureError;
        result = { article: featuredArticle };
        break;

      case 'delete':
        if (!articleId) throw new Error('Article ID required');

        const { error: deleteError } = await supabase
          .from('articles')
          .delete()
          .eq('id', articleId);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;

      default:
        throw new Error('Invalid action');
    }

    // Log the operation for audit
    await supabase.rpc('log_access_attempt', {
      user_id: user.id,
      action: `article_${action}`,
      resource: articleId || 'new_article',
      success: true,
    }).catch(console.error);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in article-operations function:', error);
    
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