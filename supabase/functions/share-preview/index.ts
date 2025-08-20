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
    const url = new URL(req.url);
    const slug = url.pathname.split('/').pop();
    const userAgent = req.headers.get('User-Agent') || '';

    if (!slug) {
      return new Response('Article not found', { status: 404 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fetch article data
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image_url,
        published_at,
        categories(name, slug),
        profiles:author_id(first_name, last_name)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !article) {
      console.error('Article not found:', error);
      return new Response('Article not found', { status: 404 });
    }

    // Check if request is from a social media bot
    const isBot = /bot|crawler|spider|facebook|twitter|whatsapp|telegram|linkedin|pinterest/i.test(userAgent);
    
    // For bots, return HTML with Open Graph tags
    if (isBot) {
      const baseUrl = Deno.env.get('SITE_URL') || 'https://francesnews-lovable.lovable.app';
      const articleUrl = `${baseUrl}/artigos/${article.slug}`;
      
      // Create cache-busting parameter based on article update time
      const cacheParam = new Date(article.published_at).getTime();
      
      // Use article image or fallback to a reliable placeholder
      let imageUrl = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop&crop=center&v=${cacheParam}`;
      let imageType = 'image/jpeg';
      
      if (article.featured_image_url) {
        try {
          const isSupabaseImage = article.featured_image_url.includes('supabase.co') || 
                                 article.featured_image_url.includes('/storage/v1/object/public/');
          
          if (isSupabaseImage) {
            imageUrl = `${article.featured_image_url}?width=1200&height=630&resize=cover&quality=85&format=jpeg&v=${cacheParam}`;
            imageType = 'image/jpeg';
          } else {
            imageUrl = `${article.featured_image_url}?v=${cacheParam}`;
            imageType = 'image/jpeg';
          }
        } catch (error) {
          console.error('Error processing image URL:', error);
          // Fallback to Unsplash news image with cache busting
          imageUrl = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop&crop=center&v=${cacheParam}`;
          imageType = 'image/jpeg';
        }
      }
      const authorName = article.profiles?.first_name && article.profiles?.last_name 
        ? `${article.profiles.first_name} ${article.profiles.last_name}`
        : 'Frances News';
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} - Frances News</title>
  <meta name="description" content="${article.excerpt || 'Leia mais em Frances News'}">
  
  <!-- Open Graph tags for social media -->
  <meta property="og:title" content="${article.title}">
  <meta property="og:description" content="${article.excerpt || 'Leia mais em Frances News'}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:type" content="${imageType}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${article.title}">
  <meta property="og:url" content="${articleUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Frances News">
  <meta property="og:locale" content="pt_BR">
  <meta property="article:author" content="${authorName}">
  <meta property="article:published_time" content="${article.published_at}">
  <meta property="article:section" content="${article.categories?.name || 'Notícias'}">
  
  <!-- Twitter Card tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@francesnews">
  <meta name="twitter:creator" content="@francesnews">
  <meta name="twitter:title" content="${article.title}">
  <meta name="twitter:description" content="${article.excerpt || 'Leia mais em Frances News'}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${article.title}">
  
  <!-- WhatsApp optimized tags -->
  <meta name="whatsapp:image" content="${imageUrl}">
  
  <!-- Telegram optimized tags -->
  <meta name="telegram:image" content="${imageUrl}">
  <meta name="format-detection" content="telephone=no">
  
  <!-- Cache control optimized for social media crawlers -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  
  <!-- Telegram specific -->
  <meta name="telegram:channel" content="@francesnews">
  
  <!-- Additional meta tags for better rendering -->
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#1a365d">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${articleUrl}">
  
  <!-- Refresh to actual article page after a short delay -->
  <meta http-equiv="refresh" content="0;url=${articleUrl}">
</head>
<body>
  <h1>${article.title}</h1>
  <p>${article.excerpt || ''}</p>
  <p>Redirecionando para o artigo...</p>
  <script>
    // Immediate redirect for any remaining cases
    window.location.href = "${articleUrl}";
  </script>
</body>
</html>`;
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Last-Modified': new Date(article.published_at).toUTCString(),
          'ETag': `"${cacheParam}"`,
          ...corsHeaders
        }
      });
    }

    // For regular users, redirect to the main app
    const baseUrl = Deno.env.get('SITE_URL') || 'https://francesnews-lovable.lovable.app';
    const appUrl = `${baseUrl}/artigos/${article.slug}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': appUrl,
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Error in share-preview function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});