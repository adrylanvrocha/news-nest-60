
import Layout from "@/components/Layout";
import NewsCard from "@/components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticles } from "@/hooks/useArticles";
import { useCategoryBySlug } from "@/hooks/useCategories";
import { formatTimeAgo } from "@/utils/dateUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Mundo = () => {
  const { data: category } = useCategoryBySlug('mundo');
  const { data: articles, isLoading, error } = useArticles({ 
    status: 'published', 
    categoryId: category?.id,
    limit: 20 
  });

  const transformArticleToNews = (article: any) => ({
    title: article.title,
    excerpt: article.excerpt || '',
    category: article.categories?.name || 'Mundo',
    timeAgo: formatTimeAgo(article.published_at || article.created_at),
    views: article.view_count?.toString() || '0',
    image: article.featured_image_url,
  });

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              Erro ao carregar as notícias internacionais. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-heading-1 font-bold text-foreground mb-2">Mundo</h1>
          <p className="text-muted-foreground">Últimas notícias sobre mundo</p>
        </div>

        {/* Banner Space */}
        <div className="bg-muted py-12 rounded-lg mb-8 text-center text-muted-foreground">
          Espaço para Banner BETWEEN_ARTICLES
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {/* Featured Article Skeleton */}
            <div className="space-y-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Grid Skeleton */}
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
        ) : articles && articles.length > 0 ? (
          <>
            {/* Featured Article */}
            <div className="mb-8">
              <NewsCard
                {...transformArticleToNews(articles[0])}
                featured={true}
              />
            </div>

            {/* Recent News */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(1).map((article) => (
                <NewsCard
                  key={article.id}
                  {...transformArticleToNews(article)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma notícia internacional disponível no momento.</p>
          </div>
        )}

        {/* Load More */}
        {articles && articles.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">Não há mais conteúdo para carregar</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Mundo;
