import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Layout from '@/components/Layout';
import NewsCard from '@/components/NewsCard';

export const metadata: Metadata = {
  title: 'Entretenimento',
  description: 'Fique por dentro das novidades do mundo do entretenimento, celebridades e espetáculos.',
  openGraph: {
    title: 'Entretenimento - FrancesNews',
    description: 'Fique por dentro das novidades do mundo do entretenimento, celebridades e espetáculos.',
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
    .eq('categories.slug', 'entretenimento')
    .order('published_at', { ascending: false })
    .limit(20);

  return articles || [];
}

export default async function EntretenimentoPage() {
  const articles = await getArticles();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Entretenimento</h1>
          <p className="text-muted-foreground">
            Fique por dentro das novidades do mundo do entretenimento, celebridades e espetáculos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              id={article.id}
              title={article.title}
              excerpt={article.excerpt}
              imageUrl={article.featured_image_url}
              publishedAt={article.published_at}
              slug={article.slug}
              category={article.categories?.name}
              author={
                article.profiles
                  ? `${article.profiles.first_name} ${article.profiles.last_name}`.trim()
                  : 'Autor'
              }
            />
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhuma notícia de entretenimento disponível no momento.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}