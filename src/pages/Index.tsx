
import Layout from "@/components/Layout";
import FeaturedNews from "@/components/FeaturedNews";
import CategorySection from "@/components/CategorySection";
import PodcastCard from "@/components/PodcastCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import RecentNews from "@/components/RecentNews";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedArticle, useArticles } from "@/hooks/useArticles";
import { usePodcasts } from "@/hooks/usePodcasts";
import { useCategories } from "@/hooks/useCategories";
import { formatTimeAgo, formatDuration } from "@/utils/dateUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const { data: featuredArticle, isLoading: featuredLoading, error: featuredError } = useFeaturedArticle();
  const { data: latestArticles, isLoading: latestLoading } = useArticles({ 
    status: 'published', 
    limit: 6 
  });
  const { data: categories } = useCategories();
  const { data: featuredPodcasts, isLoading: podcastsLoading } = usePodcasts({ 
    status: 'published', 
    featured: true, 
    limit: 2 
  });

  // Get category IDs for filtering
  const politicsCategory = categories?.find(cat => cat.slug === 'politica');
  const worldCategory = categories?.find(cat => cat.slug === 'mundo');

  const { data: politicsArticles } = useArticles({ 
    status: 'published', 
    categoryId: politicsCategory?.id,
    limit: 3 
  });

  const { data: worldArticles } = useArticles({ 
    status: 'published', 
    categoryId: worldCategory?.id,
    limit: 3 
  });

  // Transform data for components
  const transformArticleToNews = (article: any) => ({
    title: article.title,
    excerpt: article.excerpt || '',
    category: article.categories?.name || 'Geral',
    timeAgo: formatTimeAgo(article.published_at || article.created_at),
    views: article.view_count?.toString() || '0',
    image: article.featured_image_url,
  });

  const transformPodcastToCard = (podcast: any) => ({
    title: podcast.title,
    description: podcast.description || '',
    duration: podcast.duration ? formatDuration(podcast.duration) : '00:00',
    timeAgo: formatTimeAgo(podcast.published_at || podcast.created_at),
    image: podcast.thumbnail_url,
  });

  if (featuredError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              Erro ao carregar as notícias. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-8">
          {featuredLoading ? (
            <div className="relative rounded-xl overflow-hidden">
              <Skeleton className="aspect-[2.5/1] w-full" />
            </div>
          ) : featuredArticle ? (
            <FeaturedNews
              title={featuredArticle.title}
              excerpt={featuredArticle.excerpt || ''}
              category={featuredArticle.categories?.name || 'Geral'}
              timeAgo={formatTimeAgo(featuredArticle.published_at || featuredArticle.created_at)}
              views={featuredArticle.view_count?.toString() || '0'}
            />
          ) : (
            <div className="bg-muted py-12 rounded-lg text-center text-muted-foreground">
              Nenhuma notícia em destaque disponível
            </div>
          )}
        </section>

        {/* Latest News */}
        <section className="py-8">
          {latestLoading ? (
            <div>
              <Skeleton className="h-8 w-64 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <RecentNews
              title="Últimas Notícias"
              viewAllHref="/noticias"
              news={latestArticles?.map(transformArticleToNews) || []}
            />
          )}
        </section>

        {/* Banner */}
        <div className="bg-muted py-12 rounded-lg my-8 text-center text-muted-foreground">
          Espaço para Banner BETWEEN_ARTICLES
        </div>

        {/* Politics Section */}
        {politicsCategory && (
          <CategorySection
            title="Política"
            category="Política"
            viewAllHref="/politica"
            news={politicsArticles?.map(transformArticleToNews) || []}
          />
        )}

        {/* World Section */}
        {worldCategory && (
          <CategorySection
            title="Mundo"
            category="Mundo"
            viewAllHref="/mundo"
            news={worldArticles?.map(transformArticleToNews) || []}
          />
        )}

        {/* Newsletter Section */}
        <div className="my-12">
          <NewsletterSignup />
        </div>

        {/* Podcasts Section */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading-2 font-bold text-foreground border-l-4 pl-4 border-news-podcasts">
              Podcasts
            </h2>
            <a 
              href="/podcasts"
              className="text-primary hover:text-primary-hover font-medium"
            >
              Ver todos
            </a>
          </div>
          
          {podcastsLoading ? (
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex bg-card rounded-lg border border-border overflow-hidden">
                  <Skeleton className="w-32 h-32" />
                  <div className="flex-1 p-4 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {featuredPodcasts?.map((podcast, index) => (
                <PodcastCard
                  key={podcast.id}
                  {...transformPodcastToCard(podcast)}
                />
              )) || (
                <div className="text-center text-muted-foreground">
                  Nenhum podcast disponível
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Index;
