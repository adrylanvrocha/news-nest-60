'use client';

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import FeaturedNews from "@/components/FeaturedNews";
import { formatTimeAgo } from "@/utils/dateUtils";

const FeaturedNewsContainer = () => {
  const supabase = createBrowserSupabaseClient();

  const { data: featuredArticle, isLoading } = useQuery({
    queryKey: ['featured-article'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (
            first_name,
            last_name
          ),
          categories (
            name,
            slug
          )
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-muted">
        <div className="aspect-[2.5/1] bg-gradient-to-t from-black/90 via-black/40 to-transparent animate-pulse" />
      </div>
    );
  }

  if (!featuredArticle) {
    // Fallback content if no featured article
    return (
      <FeaturedNews
        title="Bem-vindo ao Frances News"
        excerpt="Seu portal de notícias com as principais informações do Brasil e do mundo."
        category="Geral"
        timeAgo="Agora"
        views="0"
      />
    );
  }

  return (
    <FeaturedNews
      title={featuredArticle.title}
      excerpt={featuredArticle.excerpt || ''}
      category={featuredArticle.categories?.name || 'Geral'}
      timeAgo={formatTimeAgo(featuredArticle.published_at)}
      views={featuredArticle.view_count?.toString() || '0'}
      slug={featuredArticle.slug}
    />
  );
};

export default FeaturedNewsContainer;