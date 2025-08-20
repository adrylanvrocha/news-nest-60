import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Layout from "@/components/Layout";
import ShareButton from "@/components/ShareButton";
import { Helmet } from "react-helmet-async";

export default function ArticleView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from("articles")
          .select(`
            *,
            categories (name, slug),
            profiles (first_name, last_name)
          `)
          .eq("slug", slug)
          .eq("status", "published")
          .single();

        if (error) throw error;
        setArticle(data as Article);

        // Increment view count
        await supabase
          .from("articles")
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq("id", data.id);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-6">O artigo que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </div>
      </Layout>
    );
  }

  const getCategoryColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "política":
        return "bg-news-politics";
      case "mundo":
        return "bg-news-world";
      case "cultura":
        return "bg-news-culture";
      case "entretenimento":
        return "bg-news-entertainment";
      default:
        return "bg-primary";
    }
  };

  const authorName = article.profiles 
    ? `${article.profiles.first_name || ""} ${article.profiles.last_name || ""}`.trim() || "Autor"
    : "Autor";

  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), {
        addSuffix: true,
        locale: ptBR,
      })
    : "Recentemente";

  // Prepare SEO data
  const baseUrl = "https://francesnews-lovable.lovable.app";
  const articleUrl = `${baseUrl}/artigos/${article.slug}`;
  const imageUrl = article.featured_image_url 
    ? (article.featured_image_url.includes('supabase.co') || article.featured_image_url.includes('/storage/v1/object/public/')
        ? `${article.featured_image_url}?width=1200&height=630&resize=cover&quality=85&format=jpeg`
        : article.featured_image_url)
    : `${baseUrl}/placeholder.svg`;
  const description = article.excerpt || "Leia mais em Frances News";

  return (
    <Layout>
      <Helmet>
        <title>{article.title} - Frances News</title>
        <meta name="description" content={description} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:secure_url" content={imageUrl} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={article.title} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Frances News" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="article:author" content={authorName} />
        <meta property="article:published_time" content={article.published_at} />
        <meta property="article:section" content={article.categories?.name || "Notícias"} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@francesnews" />
        <meta name="twitter:creator" content="@francesnews" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={article.title} />
        
        {/* WhatsApp and Telegram optimized tags */}
        <meta name="whatsapp:image" content={imageUrl} />
        <meta name="telegram:image" content={imageUrl} />
        
        {/* Additional meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#1a365d" />
        <link rel="canonical" href={articleUrl} />
      </Helmet>
      
      <article className="container max-w-4xl mx-auto px-4 py-8">
        <Button 
          onClick={() => navigate("/")} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge 
              variant="secondary" 
              className={`${getCategoryColor(article.categories?.name || "")} text-white`}
            >
              {article.categories?.name || "Geral"}
            </Badge>
            {article.is_featured && (
              <Badge variant="outline">
                Destaque
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Por {authorName}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {timeAgo}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.view_count || 0} visualizações
              </span>
            </div>
            <ShareButton 
              title={article.title}
              slug={article.slug}
            />
          </div>
          <div className="border-b border-border mt-4"></div>
        </header>

        {article.featured_image_url && (
          <div className="mb-8">
            <img 
              src={article.featured_image_url} 
              alt={article.title}
              className="w-full h-auto rounded-lg shadow-news-md"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: article.content || "" }}
            className="text-foreground leading-relaxed"
          />
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </article>
    </Layout>
  );
}