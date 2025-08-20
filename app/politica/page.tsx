import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Layout from '@/components/Layout';
import NewsCard from '@/components/NewsCard';
import { formatTimeAgo } from '@/utils/dateUtils';
import { normalizeImageUrl } from '@/utils/imageUtils';

export const metadata: Metadata = {
  title: 'Política',
  description: 'Acompanhe as principais notícias de política do Brasil e do mundo.',
  openGraph: {
    title: 'Política - FrancesNews',
    description: 'Acompanhe as principais notícias de política do Brasil e do mundo.',
  },
};

async function getArticles() {
  const supabase = createServerSupabaseClient();
  
  const { data: articles } = await supabase
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
    .eq('categories.slug', 'politica')
    .order('published_at', { ascending: false })
    .limit(20);

  return articles || [];
}

export default async function PoliticaPage() {
  const articles = await getArticles();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Política</h1>
          <p className="text-muted-foreground">
            Acompanhe as principais notícias de política do Brasil e do mundo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              title={article.title}
              excerpt={article.excerpt || ''}
              category={article.categories?.name || 'Geral'}
              timeAgo={formatTimeAgo(article.published_at)}
              views={article.view_count?.toString() || '0'}
              image={normalizeImageUrl(article.featured_image_url)}
              slug={article.slug}
            />
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhuma notícia de política disponível no momento.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}