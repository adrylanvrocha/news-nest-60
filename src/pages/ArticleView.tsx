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

  return (
    <Layout>
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

          <div className="flex items-center gap-6 text-sm text-muted-foreground border-b border-border pb-6">
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