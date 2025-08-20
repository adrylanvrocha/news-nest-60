import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Layout from '@/components/Layout';
import ShareButton from '@/components/ShareButton';
import { formatTimeAgo } from '@/utils/dateUtils';
import { normalizeImageUrl, normalizeOgImage } from '@/utils/imageUtils';

interface Props {
  params: { slug: string };
}

async function getArticle(slug: string) {
  const supabase = createServerSupabaseClient();
  
  const { data: article, error } = await supabase
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
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !article) {
    return null;
  }

  return article;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Artigo não encontrado',
    };
  }

  const imageUrl = normalizeOgImage(article.featured_image_url);

  return {
    title: article.title,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      type: 'article',
      publishedTime: article.published_at,
      authors: article.profiles 
        ? [`${article.profiles.first_name} ${article.profiles.last_name}`.trim()]
        : [],
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.title,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  // Increment view count
  const supabase = createServerSupabaseClient();
  await supabase.rpc('increment_view_count', { 
    article_id: article.id 
  }).catch(() => {
    // Ignore errors for view counting
  });

  return (
    <Layout>
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {article.featured_image_url && (
          <div className="mb-8">
            <img
              src={normalizeImageUrl(article.featured_image_url) || ''}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
          </div>
        )}

        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {article.categories && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                {article.categories.name}
              </span>
            )}
            <time dateTime={article.published_at}>
              {formatTimeAgo(article.published_at)}
            </time>
            {article.profiles && (
              <span>
                Por {article.profiles.first_name} {article.profiles.last_name}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
          
          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>
          )}

          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-4">
              <ShareButton
                title={article.title}
                slug={article.slug}
                url={`https://francesnews-lovable.lovable.app/artigos/${article.slug}`}
              />
            </div>
          </div>
        </header>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />

        <footer className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <ShareButton
              title={article.title}
              slug={article.slug}
              url={`https://francesnews-lovable.lovable.app/artigos/${article.slug}`}
            />
          </div>
        </footer>
      </article>
    </Layout>
  );
}