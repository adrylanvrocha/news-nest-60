import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Layout from '@/components/Layout';
import PodcastCard from '@/components/PodcastCard';

export const metadata: Metadata = {
  title: 'Podcasts',
  description: 'Ouça os melhores podcasts sobre política, economia, cultura e muito mais.',
  openGraph: {
    title: 'Podcasts - FrancesNews',
    description: 'Ouça os melhores podcasts sobre política, economia, cultura e muito mais.',
  },
};

async function getPodcasts() {
  const supabase = createServerSupabaseClient();
  
  const { data: podcasts } = await supabase
    .from('podcasts')
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
    .limit(20);

  return podcasts || [];
}

export default async function PodcastsPage() {
  const podcasts = await getPodcasts();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Podcasts</h1>
          <p className="text-muted-foreground">
            Ouça os melhores podcasts sobre política, economia, cultura e muito mais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.map((podcast) => (
            <PodcastCard
              key={podcast.id}
              id={podcast.id}
              title={podcast.title}
              description={podcast.description}
              thumbnailUrl={podcast.thumbnail_url}
              audioUrl={podcast.audio_url}
              publishedAt={podcast.published_at}
              duration={podcast.duration}
              slug={podcast.slug}
              category={podcast.categories?.name}
              author={
                podcast.profiles
                  ? `${podcast.profiles.first_name} ${podcast.profiles.last_name}`.trim()
                  : 'Autor'
              }
            />
          ))}
        </div>

        {podcasts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum podcast disponível no momento.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}