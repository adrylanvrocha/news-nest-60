
import Layout from "@/components/Layout";
import PodcastCard from "@/components/PodcastCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePodcasts } from "@/hooks/usePodcasts";
import { formatTimeAgo, formatDuration } from "@/utils/dateUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Podcasts = () => {
  const { data: podcasts, isLoading, error } = usePodcasts({ 
    status: 'published',
    limit: 20 
  });

  const transformPodcastToCard = (podcast: any) => ({
    title: podcast.title,
    description: podcast.description || '',
    duration: podcast.duration ? formatDuration(podcast.duration) : '00:00',
    timeAgo: formatTimeAgo(podcast.published_at || podcast.created_at),
    image: podcast.thumbnail_url,
    category: podcast.categories?.name || 'Podcast',
  });

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              Erro ao carregar os podcasts. Tente novamente mais tarde.
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
          <h1 className="text-heading-1 font-bold text-foreground mb-2">Podcasts</h1>
          <p className="text-muted-foreground">Ouça nossos podcasts com análises e entrevistas exclusivas</p>
        </div>

        {/* Banner Space */}
        <div className="bg-muted py-12 rounded-lg mb-8 text-center text-muted-foreground">
          Espaço para Banner BETWEEN_ARTICLES
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
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
        ) : podcasts && podcasts.length > 0 ? (
          <div className="space-y-6">
            {podcasts.map((podcast) => (
              <PodcastCard
                key={podcast.id}
                {...transformPodcastToCard(podcast)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum podcast disponível no momento.</p>
          </div>
        )}

        {/* Load More */}
        {podcasts && podcasts.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">Não há mais conteúdo para carregar</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Podcasts;
