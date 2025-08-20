'use client';

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import RecentNews from "@/components/RecentNews";
import { formatTimeAgo } from "@/utils/dateUtils";
import { normalizeImageUrl } from "@/utils/imageUtils";

const RecentNewsContainer = () => {
  const supabase = createBrowserSupabaseClient();

  const { data: recentArticles, isLoading } = useQuery({
    queryKey: ['recent-articles'],
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
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading-2 font-bold text-foreground">Notícias Recentes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-5 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="flex gap-4">
                  <div className="h-3 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const newsItems = recentArticles?.map(article => ({
    title: article.title,
    excerpt: article.excerpt || '',
    category: article.categories?.name || 'Geral',
    timeAgo: formatTimeAgo(article.published_at),
    views: article.view_count?.toString() || '0',
    image: normalizeImageUrl(article.featured_image_url),
    slug: article.slug
  })) || [];

  return (
    <RecentNews
      title="Notícias Recentes"
      viewAllHref="/artigos"
      news={newsItems}
    />
  );
};

export default RecentNewsContainer;